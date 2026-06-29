import { auth } from "@/lib/auth";
import {
  createMonitoredUrl,
  getCompetitorWithEvents,
} from "@/lib/db/client";
import type { UrlType } from "@/types";

const VALID_URL_TYPES: UrlType[] = [
  "PRICING",
  "CHANGELOG",
  "CAREERS",
  "HOMEPAGE",
  "CUSTOM",
];

const VALID_INTERVALS = [60, 360, 1440];

function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.workspaceId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: competitorId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, urlType, checkIntervalMinutes } = body as Record<string, unknown>;

  if (!url || typeof url !== "string" || !isValidUrl(url))
    return Response.json({ error: "url must be a valid http/https URL" }, { status: 400 });

  if (!VALID_URL_TYPES.includes(urlType as UrlType))
    return Response.json({ error: `Invalid urlType: ${urlType}` }, { status: 400 });

  if (!VALID_INTERVALS.includes(checkIntervalMinutes as number))
    return Response.json(
      { error: "checkIntervalMinutes must be 60, 360, or 1440" },
      { status: 400 }
    );

  try {
    const { competitor } = await getCompetitorWithEvents(competitorId, 1);
    if (!competitor)
      return Response.json({ error: "Competitor not found" }, { status: 404 });
    if (competitor.workspaceId !== session.user.workspaceId)
      return Response.json({ error: "Unauthorized" }, { status: 403 });

    const monitoredUrl = await createMonitoredUrl(competitorId, {
      url: url as string,
      urlType: urlType as UrlType,
      checkIntervalMinutes: checkIntervalMinutes as number,
      workspaceId: session.user.workspaceId,
      competitorName: competitor.name,
    });

    return Response.json({ url: monitoredUrl }, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to add URL" }, { status: 500 });
  }
}
