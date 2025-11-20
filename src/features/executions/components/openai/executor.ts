import Handlebars from "handlebars";
import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { openAiChannel } from "@/inngest/channels/openai";
import { OpenAiModelName } from "@/features/executions/components/openai/dialog";

Handlebars.registerHelper("json", (context) => {
  const str = JSON.stringify(context);
  const str2 = new Handlebars.SafeString(str);
  // console.log("helper/", { str, str2 });
  return str2;
});

type OpenAiData = {
  variableName?: string; // optional bc dne on creation
  model?: OpenAiModelName | string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openaiExecutor: NodeExecutor<OpenAiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  // console.log("openaiExecutor/", { data, nodeId, context, step });
  // emit loading event
  await publish(
    openAiChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAi node: Variable name is missing");
  }

  if (!data.userPrompt) {
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAi node: User prompt is missing");
  }

  // TODO Throw if credentials missing

  // if (!data.variableName) {
  //   await publish(
  //     openAiChannel().status({
  //       nodeId,
  //       status: "error",
  //     })
  //   );
  //   throw new NonRetriableError("OpenAi node: Variable name is missing");
  // }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  // TODO fetch credentials
  const credentials = process.env.OPENAI_API_KEY;

  const openai = createOpenAI({
    apiKey: credentials,
  });

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai(data.model || "gpt-5.1"),
      system: systemPrompt,
      prompt: userPrompt,
      // used for Sentry data tracking
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      openAiChannel().status({
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
      openAiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
}; // openaiExecutor
