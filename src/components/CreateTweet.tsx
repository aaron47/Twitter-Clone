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
      setError(e["errors"][0].message);
      setInterval(() => {
        setError("");
      }, 6000);
      return;
    }

    mutateAsync({ text: tweet });
  };

  return (
    <>
      {error && <p className="p-4 text-xl italic text-red-500">{error}</p>}
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="mb-4 flex w-full flex-col rounded-md border-2 p-4"
      >
        <textarea
          onChange={(e) => setTweet(e.target.value)}
          placeholder="Que'ce qui se passe?"
          className="w-full resize-none rounded-md p-4 shadow-md outline-blue-500"
        />

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="focus:shadow-outline rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
          >
            Tweet
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateTweet;
