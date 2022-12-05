import { protectedProcedure, publicProcedure } from "./../trpc";
import { router } from "../trpc";
import { tweetSchema } from "../../../components/CreateTweet";
import { z } from "zod";

export const tweetRouter = router({
  createTweet: protectedProcedure
    .input(tweetSchema)
    .mutation(async ({ input, ctx }) => {
      const { prisma, session } = ctx;
      const { text } = input;

      const userId = session?.user?.id;

      const tweet = await prisma.tweet.create({
        data: {
          text,
          author: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }),

  timeline: publicProcedure
    .input(
      z.object({
        where: z
          .object({
            author: z
              .object({
                name: z.string().optional(),
              })
              .optional(),
          })
          .optional(),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { prisma } = ctx;
      const { cursor, limit, where } = input;
      const userId = ctx.session?.user?.id;

      const tweets = await prisma.tweet.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        include: {
          likes: {
            where: {
              userId,
            },
            select: {
              userId: true,
            },
          },
          author: {
            select: {
              name: true,
              id: true,
              image: true,
            },
          },

          _count: {
            select: {
              likes: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;

      if (tweets.length > limit) {
        const nextItem = tweets.pop() as typeof tweets[number];

        nextCursor = nextItem.id;
      }

      return {
        tweets,
        nextCursor,
      };
    }),

  like: protectedProcedure
    .input(
      z.object({
        tweetId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const { prisma } = ctx;
      return prisma.like.create({
        data: {
          tweet: {
            connect: {
              id: input.tweetId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }),

  unlike: protectedProcedure
    .input(
      z.object({
        tweetId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const { prisma } = ctx;
      return prisma.like.delete({
        where: {
          tweetId_userId: {
            tweetId: input.tweetId,
            userId,
          },
        },
      });
    }),
});
