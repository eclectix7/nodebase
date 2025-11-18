import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO publish loading state
  console.log("httpRequestExecutor/", { data, nodeId, context, step });

  if (!data.endpoint) {
    // TODO publish error state
    throw new NonRetriableError(
      "hre22 HTTP Request node: no endpoint configured"
    );
  }

  const result = await step.run("http-request", async () => {
    const endpoint = data.endpoint!;
    const method = data.method || "GET";

    const options: KyOptions = {
      method,
    };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (data.body) {
        // TODO add template extraction
        options.body = data.body;
      }

      const response = await ky(endpoint, options);
      const contentType = response.headers.get("content-type");
      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      return {
        ...context,
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };
    }
  });

  // no actual work, but we have to return Promise<WorkflowContext> with the data to maintain interface
  // const result = await step.run("http-request", async () => context);

  // TODO publich success state for manual trigger

  return result;
};
