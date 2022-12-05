import { tweetRouter } from './tweet';
import { router } from "../trpc";
import { authRouter } from "./auth";

export const appRouter = router({
  auth: authRouter,
  tweet: tweetRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
