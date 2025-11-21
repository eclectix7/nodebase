"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { fetchSlackRealtimeToken } from "@/features/executions/components/slack/actions";
import {
  SlackDialog,
  SlackFormValues,
} from "@/features/executions/components/slack/dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { SLACK_CHANNEL_NAME } from "@/inngest/channels/slack";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";

type SlackNodeData = {
  webhookUrl?: string;
  content?: string;
  username?: string;
};

type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
  const { setNodes } = useReactFlow();
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SLACK_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchSlackRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: SlackFormValues) => {
    console.log("handleSubmit - form values:", values);
    setNodes((nodes) => {
      console.log("handleSubmit - all nodes before update:", nodes);
      const updatedNodes = nodes.map((node) => {
        // find the relevant WF node to update
        if (node.id === props.id) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
          console.log("handleSubmit - updated node:", updatedNode);
          return updatedNode;
        }
        return node;
      });
      console.log("handleSubmit - all nodes after update:", updatedNodes);
      return updatedNodes;
    });
  };

  const nodeData = props.data;
  const description = nodeData?.content
    ? `Send: ${nodeData.content.slice(0, 50)}...`
    : "Not Configured";

  return (
    <>
      <SlackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/slack.svg"
        name="Slack"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        children={null}
      />
    </>
  );
});

SlackNode.displayName = "SlackNode";
