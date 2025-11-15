import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";

const Page = async () => {
  await requireAuth();

  const data = await caller.getUsers();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      <p>protected</p>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
};

export default Page;
