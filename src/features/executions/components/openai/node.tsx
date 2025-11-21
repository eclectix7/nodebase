"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { fetchOpenAiRealtimeToken } from "@/features/executions/components/openai/actions";
import {
  OPENAI_MODELS,
  OpenAiDialog,
  OpenAiFormValues,
  OpenAiModelName,
} from "@/features/executions/components/openai/dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";

type OpenAiNodeData = {
  variableName?: string;
  credentialId?: string;
  model?: OpenAiModelName;
  systemPrompt?: string;
  userPrompt?: string;
};

type OpenAiNodeType = Node<OpenAiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenAiNodeType>) => {
  const { setNodes } = useReactFlow();
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenAiRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: OpenAiFormValues) => {
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
  const description = nodeData?.userPrompt
    ? `${nodeData.model || OPENAI_MODELS[0]}: ${nodeData.userPrompt.slice(
        0,
        50
      )}...`
    : "Not Configured";

  return (
    <>
      <OpenAiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/openai.svg"
        name="OpenAI"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        children={null}
      />
    </>
  );
});

OpenAiNode.displayName = "OpenAiNode";
