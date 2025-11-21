import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "@/inngest/utils";
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";
import { geminiChannel } from "@/inngest/channels/gemini";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { discordChannel } from "@/inngest/channels/discord";
import { slackChannel } from "@/inngest/channels/slack";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0, // TODO for testing, remove
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      anthropicChannel(),
      discordChannel(),
      slackChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    // console.log("executeWorkflow/workflows/execute.workflow/", { event, step });
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      // nothing to try or retry
      throw new NonRetriableError("Workflow ID is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      }); // wf

      // console.log("executeWorkflow/29/", { nodes: workflow.nodes });

      // left out jic Db is not available
      // if (!workflow) {
      //   // nothing to try or retry
      //   throw new NonRetriableError("Workflow not found");
      // }

      return topologicalSort(workflow.nodes, workflow.connections);
    }); // nodes

    // get the userId of the wf owner
    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        },
      });
      return workflow.userId;
    });

    // initialize the context with any initial data from the trigger
    let context = event.data.initialData || {};

    // execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      // console.log("for/sortedNodes/", { node });

      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
        publish,
      });
    } // for

    return { workflowId, results: context };
  } // async(workflows/execute.workflow)
); // createFunction/executeWorkflow
