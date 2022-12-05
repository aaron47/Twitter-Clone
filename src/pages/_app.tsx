import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "../styles/globals.css";
import Container from "../components/Container";
import LoggedOutBanner from "../components/LoggedOutBanner";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
        <main>
          <Component {...pageProps} />
        </main>

      <LoggedOutBanner />
      <ReactQueryDevtools initialIsOpen={false} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
