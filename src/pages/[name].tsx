import { useRouter } from "next/router";
import Timeline from "../components/Timeline";

const UserPage = () => {
  const router = useRouter();
  const name = router.query.name as string;

  return (
    <div>
      <Timeline
        where={{
          author: {
            name,
          },
        }}
      />

      <div className="absolute top-0 right-0 p-4">
        <button
          onClick={() => router.push("/")}
          className="focus:shadow-outline rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
        >
          Retourner
        </button>
      </div>
    </div>
  );
};

export default UserPage;
