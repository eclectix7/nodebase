// "use client";

import { useTRPC } from "@/trpc/client";
import { dehydrate, HydrationBoundary, useQuery } from "@tanstack/react-query";
import { caller, getQueryClient, trpc } from "@/trpc/server"; // server side only
import { Client } from "@/app/client";
import { Suspense } from "react";

const Page = async () => {
  // server side only
  // const Page = () => {
  // const users = await caller.getUsers(); // server side only
  // client-side version
  // const trpc = useTRPC();
  // const { data: users } = useQuery(trpc.getUsers.queryOptions());

  // build server-side data layer connection with client side usage
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.getUsers.queryOptions());

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      {/* {JSON.stringify(users)} */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Loading...</p>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};

export default Page;
