import { inngest } from "./client";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflows/execute.workflow" },
  async ({ event, step }) => {
    console.log("executeWorkflow/workflows/execute.workflow/", { event, step });
    await step.sleep("test", "5s");
  } // async(workflows/execute.workflow)
); // createFunction/executeWorkflow
