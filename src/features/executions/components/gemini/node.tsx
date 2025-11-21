"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { fetchGeminiRealtimeToken } from "@/features/executions/components/gemini/actions";
import {
  GEMINI_MODELS,
  GeminiDialog,
  GeminiFormValues,
  GeminiModelName,
} from "@/features/executions/components/gemini/dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";

type GeminiNodeData = {
  variableName?: string;
  credentialId?: string;
  model?: GeminiModelName;
  systemPrompt?: string;
  userPrompt?: string;
};

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
  const { setNodes } = useReactFlow();
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GEMINI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: GeminiFormValues) => {
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
    ? `${nodeData.model || GEMINI_MODELS[0]}: ${nodeData.userPrompt.slice(
        0,
        50
      )}...`
    : "Not Configured";

  return (
    <>
      <GeminiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/gemini.svg"
        name="Gemini"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        children={null}
      />
    </>
  );
});

GeminiNode.displayName = "GeminiNode";
