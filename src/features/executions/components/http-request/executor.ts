import Handlebars from "handlebars";
import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

Handlebars.registerHelper("json", (context) => {
  const str = JSON.stringify(context);
  const str2 = new Handlebars.SafeString(str);
  // console.log("helper/", { str, str2 });
  return str2;
});

type HttpRequestData = {
  variableName: string; // optional bc dne on creation
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO publish loading state
  // console.log("httpRequestExecutor/", { data, nodeId, context, step });

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

  if (!data.method) {
    // TODO publish error state
    throw new NonRetriableError(
      "hre46 HTTP Request node: no method name configured"
    );
  }

  const result = await step.run("http-request", async () => {
    // Problems pt2 ~1:38:00
    // parse the endpoint for handlebars templates that match the previous calls' json paths
    const endpoint = Handlebars.compile(data.endpoint)(context);
    // console.log("endpoint/", { endpoint });
    const method = data.method;

    const options: KyOptions = {
      method,
    };

    // Add body for POST, PUT, PATCH methods
    if (["POST", "PUT", "PATCH"].includes(method)) {
      // console.log("body/pre/", { body: data.body });
      // parse the node for handlebars templates that match the previous calls' json path
      if (data.body) {
        const resolved = Handlebars.compile(data.body || "{}")(context);
        console.log("body/", { pre: data.body, resolved });
        // options.body = data.body;
        options.body = resolved;
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

    return {
      ...context,
      [data.variableName]: responsePayload,
    };
  });

  // no actual work, but we have to return Promise<WorkflowContext> with the data to maintain interface
  // const result = await step.run("http-request", async () => context);

  // TODO publich success state for manual trigger

  return result;
};
