"use client";

import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { useTRPC } from "@/trpc/client";
import { caller } from "@/trpc/server";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const testAi = useMutation(
    trpc.testAi.mutationOptions({
      onSuccess: (data) => {
        toast.success("AI test completed");
        console.log("AI response:", data);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to test AI");
        console.error("AI test error:", error);
      },
    })
  );

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success("Job queued");
      },
    })
  );

  const handleTestAi = () => {
    console.log("Test AI button clicked");
    testAi.mutate(undefined);
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      <div>protected</div>
      <div>{JSON.stringify(data)}</div>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Create Workflow
      </Button>
      <Button disabled={testAi.isPending} onClick={handleTestAi}>
        Test AI
      </Button>
      <div>{/* <LogoutButton /> */}</div>
    </div>
  );
};

export default Page;
