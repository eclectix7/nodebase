"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import {
  FormType,
  HttpRequestDialog,
} from "@/features/executions/components/http-request/dialog";
import { StringFilter } from "@/generated/prisma/commonInputTypes";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

// TODO Settings not opening on select as expected when done @10:27:00
export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const { setNodes } = useReactFlow();
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "initial";

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: FormType) => {
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
              endpoint: values.endpoint,
              method: values.method,
              body: values.body,
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
        defaultEndpoint={nodeData.endpoint} // TODO simplify
        defaultMethod={nodeData.method}
        defaultBody={nodeData.body}
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
