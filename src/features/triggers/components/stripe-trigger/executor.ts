import { NodeExecutor } from "@/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

type StripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    stripeTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );

  // no actual work, but we have to return Promise<WorkflowContext> with the data to maintain interface
  const result = await step.run("stripe-trigger", async () => context);

  await publish(
    stripeTriggerChannel().status({
      nodeId,
      status: "success",
    })
  );

  return result;
};
