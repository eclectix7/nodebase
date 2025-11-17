import { BaseTriggerNode } from "@/features/triggers/components/base-trigger-node";
import { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { memo } from "react";

export const ManualTriggerNode = memo((props: NodeProps) => {
  return (
    <>
      <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="When clicking 'Execute workflow'"
        // status={nodeStatus} TODO
        // onSettings={handleOpenSettings} TODO
        // onDoubleClick={handleOpenSettings} TODO
      />
    </>
  );
});
