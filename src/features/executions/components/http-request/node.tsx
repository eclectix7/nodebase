"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { fetchHttpRequestRealtimeToken } from "@/features/executions/components/http-request/actions";
import {
  HttpRequestFormValues,
  HttpRequestDialog,
} from "@/features/executions/components/http-request/dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import {
  HTTP_REQUEST_CHANNEL_NAME,
  httpRequestChannel,
} from "@/inngest/channels/http-request";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";

type HttpRequestNodeData = {
  variableName?: string; // optional bc dne on creation
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

// TODO Settings not opening on select as expected when done @10:27:00
export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const { setNodes } = useReactFlow();
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: HTTP_REQUEST_CHANNEL_NAME,
    // channel: httpRequestChannel().name,
    topic: "status",
    refreshToken: fetchHttpRequestRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: HttpRequestFormValues) => {
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
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not Configured";

  return (
    <>
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        name="HTTP Request"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        children={null}
      />
    </>
  );
});

HttpRequestNode.displayName = "HttpRequestNode";
