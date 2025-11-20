import Handlebars from "handlebars";
import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { AnthropicModelName } from "@/features/executions/components/anthropic/dialog";

Handlebars.registerHelper("json", (context) => {
  const str = JSON.stringify(context);
  const str2 = new Handlebars.SafeString(str);
  // console.log("helper/", { str, str2 });
  return str2;
});

type AnthropicData = {
  variableName?: string; // optional bc dne on creation
  model?: AnthropicModelName | string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  // console.log("anthropicExecutor/", { data, nodeId, context, step });
  // emit loading event
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Anthropic node: Variable name is missing");
  }

  if (!data.userPrompt) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Anthropic node: User prompt is missing");
  }

  // TODO Throw if credentials missing

  // if (!data.variableName) {
  //   await publish(
  //     anthropicChannel().status({
  //       nodeId,
  //       status: "error",
  //     })
  //   );
  //   throw new NonRetriableError("Anthropic node: Variable name is missing");
  // }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  // TODO fetch credentials
  const credentials = process.env.ANTHROPIC_API_KEY;

  const anthropic = createAnthropic({
    apiKey: credentials,
  });

  try {
    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic(data.model || "claude-sonnet-4-5"),
        system: systemPrompt,
        prompt: userPrompt,
        // used for Sentry data tracking
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      anthropicChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: {
        response: text,
      },
    };
  } catch (error) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
}; // anthropicExecutor
