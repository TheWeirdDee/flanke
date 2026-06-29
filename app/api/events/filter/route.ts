import { auth } from "@/lib/auth";
import { getEventsBySignalType } from "@/lib/db/client";
import type { SignalType } from "@/types";

const VALID_SIGNAL_TYPES: SignalType[] = [
  "PRICING_INCREASE",
  "PRICING_DECREASE",
  "NEW_FEATURE_LAUNCHED",
  "ENTERPRISE_TIER_ADDED",
  "FREE_TIER_REMOVED",
  "SALES_HIRING_SPIKE",
  "ENGINEERING_HIRING_SPIKE",
  "MESSAGING_PIVOT",
  "NEW_INTEGRATION_ADDED",
  "PRODUCT_DISCONTINUATION",
  "UNKNOWN_CHANGE",
];

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const signalType = searchParams.get("signalType") as SignalType | null;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  if (!signalType || !VALID_SIGNAL_TYPES.includes(signalType))
    return Response.json(
      { error: `signalType must be one of: ${VALID_SIGNAL_TYPES.join(", ")}` },
      { status: 400 }
    );

  try {
    const events = await getEventsBySignalType(
      session.user.workspaceId,
      signalType,
      limit
    );
    return Response.json({ events });
  } catch {
    return Response.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
