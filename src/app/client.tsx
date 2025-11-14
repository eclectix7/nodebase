"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

// data passed through props. If server-side we don't have connection to the full dataset
// export const Client = ({ users }: { users: Record<string, any>[] }) => {
export const Client = () => {
  // build client-side connection with data layer we want to use (through HydrationBoundary)
  const trpc = useTRPC();
  const { data: users } = useSuspenseQuery(trpc.getUsers.queryOptions());

  return <div>Client {JSON.stringify(users)}</div>;
};
