import { inngest } from "@/inngest/client";
import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";

export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    console.log("getUsers/", { userId: ctx.auth.user.id });
    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world", // must match function name
      data: {
        email: "tests",
      },
    });

    return { success: true, message: "Job queued" };
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
