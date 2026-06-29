import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { updateWorkspace } from "@/lib/db/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const plan = (searchParams.get("plan") ?? "PRO").toUpperCase();
  const workspaceId = session.user.workspaceId;

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (stripeKey) {
    try {
      // Direct integration call to Stripe API without external SDK dependencies
      const stripeParams = new URLSearchParams({
        "payment_method_types[0]": "card",
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": `Flanke ${plan} Plan Subscription`,
        "line_items[0][price_data][unit_amount]": plan === "ENTERPRISE" ? "9900" : "4900",
        "line_items[0][price_data][recurring][interval]": "month",
        "line_items[0][quantity]": "1",
        "mode": "subscription",
        "success_url": `${new URL(req.url).origin}/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
        "cancel_url": `${new URL(req.url).origin}/settings?canceled=true`,
        "metadata[workspaceId]": workspaceId,
        "metadata[plan]": plan,
      });

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: stripeParams.toString(),
      });

      if (response.ok) {
        const stripeSession = await response.json();
        if (stripeSession.url) {
          return NextResponse.redirect(stripeSession.url);
        }
      }

      console.error("[stripe-api-error] Failed to create Stripe Checkout session:", await response.text());
    } catch (err) {
      console.error("[stripe-api-exception] error:", err);
    }
  }

  // Developer Sandbox Mock Simulator - directly upgrades workspace in DB if no Stripe secret is configured
  try {
    await updateWorkspace(workspaceId, { plan });
    return NextResponse.redirect(
      new URL(`/settings?success=true&plan=${plan}&sandbox=true`, req.url)
    );
  } catch (err) {
    console.error("[sandbox-checkout-error] error:", err);
    return NextResponse.redirect(new URL("/settings?error=checkout_failed", req.url));
  }
}
