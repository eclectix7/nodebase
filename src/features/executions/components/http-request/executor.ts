import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
  variableName?: string; // optional bc dne on creation
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

  if (!data.variableName) {
    // TODO publish error state
    throw new NonRetriableError(
      "hre31 HTTP Request node: no variable name configured"
    );
  }

  const result = await step.run("http-request", async () => {
    const endpoint = data.endpoint!;
    const method = data.method || "GET";

    const options: KyOptions = {
      method,
    };

    // Add body for POST, PUT, PATCH methods
    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (data.body) {
        // TODO add template extraction
        options.body = data.body;
        options.headers = {
          "Content-Type": "application/json",
        };
      }
    }

    // Execute HTTP request for all methods (GET, POST, PUT, PATCH, DELETE)
    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };

    if (data.variableName) {
      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    }
    // backwards compatibility
    return {
      ...context,
      ...responsePayload,
    };
  });

  // no actual work, but we have to return Promise<WorkflowContext> with the data to maintain interface
  // const result = await step.run("http-request", async () => context);

  // TODO publich success state for manual trigger

  return result;
};
