import { FormEvent, useState } from "react";
import { trpc } from "../utils/trpc";
import { z } from "zod";

export const tweetSchema = z.object({
  text: z
    .string({
      required_error: "Tweet text is required",
    })
    .min(10)
    .max(280),
});

const CreateTweet = () => {
  const [tweet, setTweet] = useState("");
  const [error, setError] = useState("");

  const { mutateAsync } = trpc.tweet.createTweet.useMutation({
    onSuccess: () => {
      setTweet("");
      utils.tweet.timeline.invalidate();
    },
  });
  const utils = trpc.useContext();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      tweetSchema.parse({ text: tweet });
    } catch (e: any) {
      setError(e);
      return;
    }

    mutateAsync({ text: tweet });
  };

  return (
    <>
      {error && JSON.stringify(error)}
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="mb-4 flex w-full flex-col rounded-md border-2 p-4"
      >
        <textarea
          onChange={(e) => setTweet(e.target.value)}
          className="w-full p-4 shadow"
        />

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-white"
          >
            Tweet
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateTweet;
