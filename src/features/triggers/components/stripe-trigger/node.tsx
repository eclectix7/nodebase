import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { BaseTriggerNode } from "@/features/triggers/components/base-trigger-node";
import { stripeTriggerRealtimeToken } from "@/features/triggers/components/stripe-trigger/actions";
import { StripeTriggerDialog } from "@/features/triggers/components/stripe-trigger/dialog";
import { STRIPE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/stripe-trigger";
import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";

export const StripeTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: STRIPE_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: stripeTriggerRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);
  return (
    <>
      <StripeTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon="/logos/stripe.svg"
        name="Stripe Trigger"
        description="When Stripe event is captured"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});
