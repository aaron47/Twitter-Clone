import { signIn, useSession } from "next-auth/react";
import Container from "./Container";

const LoggedOutBanner = () => {
  const { data: session } = useSession();

  if (session) {
    return null;
  }

  return (
    <div className="fixed bottom-0 w-full bg-white p-4 ">
      <Container classNames="bg-transparent">
        <div className="flex items-center justify-between">
          <p className="mb-2 text-base font-bold text-gray-700">
            Ne manquez pas!
          </p>
          <button
            onClick={() => signIn()}
            className="focus:shadow-outline rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
          >
            Se connecter avec Discord
          </button>
        </div>
      </Container>
    </div>
  );
};

export default LoggedOutBanner;
