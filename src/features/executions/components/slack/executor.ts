import Handlebars from "handlebars";
import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { slackChannel } from "@/inngest/channels/slack";
import { decode } from "html-entities";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const str = JSON.stringify(context);
  const str2 = new Handlebars.SafeString(str);
  // console.log("helper/", { str, str2 });
  return str2;
});

type SlackData = {
  variableName?: string; // optional bc dne on creation
  webhookUrl: string;
  content: string;
  username?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  // console.log("slackExecutor/", { data, nodeId, context, step });
  // emit loading event
  await publish(
    slackChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.content) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Slack node: Content is missing");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  try {
    if (!data.webhookUrl) {
      await publish(
        slackChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("Slack node: Webhook URL is missing");
    }

    const result = await step.run("slack-webhook", async () => {
      await ky.post(data.webhookUrl!, {
        json: {
          content: content.slice(0, 2000),
          username,
        },
      });
      if (!data.variableName) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Slack node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    }); // webhook result

    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
}; // slackExecutor
