import { auth } from "@/lib/auth";
import { getWorkspaceFeed } from "@/lib/db/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 200);
  const before = searchParams.get("before") ?? undefined;

  try {
    const { events, nextCursor } = await getWorkspaceFeed(
      session.user.workspaceId,
      limit,
      before
    );
    return Response.json({ events, nextCursor });
  } catch {
    return Response.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
