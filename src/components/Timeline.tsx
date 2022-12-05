import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { RouterInputs, RouterOutputs, trpc } from "../utils/trpc";
import CreateTweet from "./CreateTweet";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

import { AiFillHeart } from "react-icons/ai";
import {
  InfiniteData,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";

import Link from "next/link";
import { signOut } from "next-auth/react";
import Container from "./Container";

const LIMIT = 10;

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dh",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  function handleScroll() {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const winHeight =
      document.body.scrollTop || document.documentElement.scrollTop;
    const scrolled = (winHeight / height) * 100;
    setScrollPosition(scrolled);
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return scrollPosition;
}

function updateCache({
  queryClient,
  variables,
  data,
  action,
  input,
}: {
  queryClient: QueryClient;
  variables: {
    tweetId: string;
  };
  data: {
    userId: string;
  };
  action: "like" | "unlike";
  input: RouterInputs["tweet"]["timeline"];
}) {
  queryClient.setQueryData(
    [
      ["tweet", "timeline"],
      {
        input,
        type: "infinite",
      },
    ],
    (oldData) => {
      const newData = oldData as InfiniteData<
        RouterOutputs["tweet"]["timeline"]
      >;

      const value = action === "like" ? 1 : -1;

      const newTweets = newData.pages.map((page) => {
        return {
          tweets: page.tweets.map((tweet) => {
            if (tweet.id === variables.tweetId) {
              return {
                ...tweet,
                likes: action === "like" ? [data.userId] : [],
                _count: {
                  likes: tweet._count.likes + value,
                },
              };
            }

            return tweet;
          }),
        };
      });
      return {
        ...newData,
        pages: newTweets,
      };
    }
  );
}

interface TweetProps {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
  queryClient: QueryClient;
  input: RouterInputs["tweet"]["timeline"];
}

const Tweet: React.FC<TweetProps> = ({ tweet, queryClient, input }) => {
  const likeTweet = trpc.tweet.like.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ queryClient, data, variables, action: "like", input });
    },
  }).mutateAsync;

  const unlikeTweet = trpc.tweet.unlike.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ queryClient, data, variables, action: "unlike", input });
    },
  }).mutateAsync;

  const hasLiked = tweet.likes.length > 0;

  return (
    <div className="mb-4 border-b-2 border-gray-500">
      <div className="flex p-2">
        <Image
          src={tweet.author.image!}
          alt={`${tweet.author.name} profile picture`}
          width={48}
          height={48}
          className="rounded-full"
        />

        <div className="ml-2">
          <div className="align-center flex">
            <p className="font-bold">
              <Link href={`/${tweet.author.name}`}>{tweet.author.name}</Link>
            </p>
            <p className="text-sm text-gray-300">
              {" "}
              - {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>

          <div>{tweet.text}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center p-2">
        <AiFillHeart
          // color={hasLiked ? "red" : "gray"}
          size="1.5rem"
          onClick={() => {
            if (hasLiked) {
              unlikeTweet({ tweetId: tweet.id });
              return;
            }
            likeTweet({ tweetId: tweet.id });
          }}
          className={`cursor-pointer hover:text-red-500 ${hasLiked ? "text-red-500" : "text-gray-500"} transition duration-150 ease-in-out` }
        />

        <span className="text-sm text-gray-500">{tweet._count.likes}</span>
      </div>
    </div>
  );
};

interface TimelineProps {
  where?: RouterInputs["tweet"]["timeline"]["where"];
}

const Timeline: React.FC<TimelineProps> = ({ where = {} }) => {
  const scrollPosition = useScrollPosition();
  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.timeline.useInfiniteQuery(
      {
        limit: LIMIT,
        where,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const queryClient = useQueryClient();

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  return (
    <Container>
      <div className="absolute top-0 left-0 p-4">
        <button
          onClick={() => signOut()}
          className="focus:shadow-outline rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
        >
          Sign Out
        </button>
      </div>
      <CreateTweet />

      <div className="border-l-2 border-r-2 border-t-2 border-gray-500">
        {tweets.map((tweet) => (
          <Tweet
            key={tweet.id}
            tweet={tweet}
            queryClient={queryClient}
            input={{
              where,
              limit: LIMIT,
            }}
          />
        ))}

        {!hasNextPage && (
          <p>Il n'ya pas des tweets a vous faire voir a ce moment...</p>
        )}

        {/* <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetching}
        >
          Load More Tweets
        </button> */}
      </div>
    </Container>
  );
};

export default Timeline;
