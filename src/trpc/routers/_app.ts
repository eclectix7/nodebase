import { inngest } from "@/inngest/client";
import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const appRouter = createTRPCRouter({
  testAi: protectedProcedure.mutation(async () => {
    try {
      // Check if API key is configured
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
        throw new Error(
          "Google AI API key is not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY environment variable."
        );
      }

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: "Write a 2 paragraph summary of special relativity",
      });
      return text;
    } catch (error) {
      console.error("Error in testAi mutation:", error);
      throw error;
    }
  }),

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
