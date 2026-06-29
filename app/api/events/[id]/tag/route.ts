import { auth } from "@/lib/auth";
import { tagEvent } from "@/lib/db/client";
import { Keys } from "@/lib/db/schema";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/events/[id]/tag
// Body: { tag: string | null, competitorId: string, detectedAt: string }
// competitorId + detectedAt are needed to reconstruct the DynamoDB composite key.
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.workspaceId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { tag, competitorId, detectedAt } = body as Record<string, unknown>;

  if (tag !== null && typeof tag !== "string")
    return Response.json({ error: "tag must be a string or null" }, { status: 400 });

  if (!competitorId || typeof competitorId !== "string")
    return Response.json({ error: "competitorId is required" }, { status: 400 });

  if (!detectedAt || typeof detectedAt !== "string")
    return Response.json({ error: "detectedAt is required" }, { status: 400 });

  const eventSk = Keys.event.sk(detectedAt as string, eventId);

  try {
    const event = await tagEvent(
      competitorId as string,
      eventSk,
      tag as string | null
    );
    if (!event)
      return Response.json({ error: "Event not found" }, { status: 404 });

    // Verify the event belongs to the authenticated workspace
    if (event.workspaceId !== session.user.workspaceId)
      return Response.json({ error: "Unauthorized" }, { status: 403 });

    return Response.json({ event });
  } catch {
    return Response.json({ error: "Failed to tag event" }, { status: 500 });
  }
}
