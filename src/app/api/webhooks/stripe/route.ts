import { sendWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    // TODO add signing secret check
    // See Pt2 ~4:28:00

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query parameter: workflowId",
        },
        { status: 400 }
      );
    }
    const body = await request.json();

    /**
     * stripe listen --forward-to {URL} copied from node dialog
     */

    // "one" stripe event triggers multiple, so we need to restrict to the one we actually want.
    // E.g. "payment_intent.succeeded" emits 3 other events BEFORE being sent
    // CLI trigger command: stripe trigger payment_intent.succeeded
    if (body?.type !== "payment_intent.succeeded") {
      return; // not the event we're looking for
    }

    // Stripe events not uniform.
    // Available Event data can vary

    const stripeData = {
      // available downstream data
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,
      amount: body?.data?.object?.amount,
      currency: body?.data?.object?.currency,
    };

    // trigger an Inngest job
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: stripeData,
      },
    });
    // send success response
    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process Stripe event",
      },
      { status: 500 }
    );
  }
}
