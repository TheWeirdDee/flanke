import { auth } from "@/lib/auth";
import {
  deleteCompetitor,
  getCompetitorUrls,
  getCompetitorWithEvents,
} from "@/lib/db/client";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.workspaceId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const [{ competitor, recentEvents }, urls] = await Promise.all([
      getCompetitorWithEvents(id),
      getCompetitorUrls(id),
    ]);

    if (!competitor)
      return Response.json({ error: "Competitor not found" }, { status: 404 });

    // Ensure the competitor belongs to the authenticated workspace
    if (competitor.workspaceId !== session.user.workspaceId)
      return Response.json({ error: "Unauthorized" }, { status: 403 });

    return Response.json({ competitor, recentEvents, urls });
  } catch {
    return Response.json({ error: "Failed to fetch competitor" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.workspaceId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Verify ownership before deleting
    const { competitor } = await getCompetitorWithEvents(id, 1);
    if (!competitor)
      return Response.json({ error: "Competitor not found" }, { status: 404 });
    if (competitor.workspaceId !== session.user.workspaceId)
      return Response.json({ error: "Unauthorized" }, { status: 403 });

    await deleteCompetitor(id);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to delete competitor" }, { status: 500 });
  }
}
