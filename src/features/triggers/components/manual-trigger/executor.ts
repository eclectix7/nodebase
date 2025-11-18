import { NodeExecutor } from "@/features/executions/types";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  // TODO publish loading state

  // no actual work, but we have to return Promise<WorkflowContext> with the data to maintain interface
  const result = await step.run("manual-trigger", async () => context);

  // TODO publich success state for manual trigger

  return result;
};
