import { auth } from "@/lib/auth";
import {
  createCompetitor,
  createMonitoredUrl,
  getWorkspaceCompetitors,
  getCompetitorUrls,
  db,
  TABLE,
} from "@/lib/db/client";
import { Keys } from "@/lib/db/schema";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
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

export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const competitors = await getWorkspaceCompetitors(session.user.workspaceId);
    return Response.json({ competitors });
  } catch {
    return Response.json({ error: "Failed to fetch competitors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId } = session.user;

  // 1. Fetch workspace plan details
  let workspace;
  try {
    const workspaceRes = await db.send(
      new GetCommand({
        TableName: TABLE,
        Key: {
          PK: Keys.workspace.pk(workspaceId),
          SK: Keys.workspace.sk(),
        },
      })
    );
    workspace = workspaceRes.Item;
  } catch (err) {
    return Response.json({ error: "Failed to verify workspace limits" }, { status: 500 });
  }

  if (!workspace) {
    return Response.json({ error: "Workspace not found" }, { status: 404 });
  }

  const plan = (workspace.plan || "FREE") as "FREE" | "PRO" | "ENTERPRISE";
  const competitorCount = typeof workspace.competitorCount === "number" ? workspace.competitorCount : 0;

  // Enforce competitor count limit
  if (plan === "FREE" && competitorCount >= 2) {
    return Response.json(
      { error: "Free tier is limited to 2 competitors. Please upgrade to Pro for more." },
      { status: 403 }
    );
  }
  if (plan === "PRO" && competitorCount >= 10) {
    return Response.json(
      { error: "Pro tier is limited to 10 competitors. Please upgrade to Enterprise." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, domain, urls } = body as {
    name?: unknown;
    domain?: unknown;
    urls?: unknown;
  };

  if (!name || typeof name !== "string" || name.trim().length === 0)
    return Response.json({ error: "name is required" }, { status: 400 });

  if (!domain || typeof domain !== "string" || !isValidUrl(domain))
    return Response.json({ error: "domain must be a valid http/https URL" }, { status: 400 });

  if (!Array.isArray(urls) || urls.length === 0)
    return Response.json({ error: "At least 1 URL is required" }, { status: 400 });

  if (urls.length > 20)
    return Response.json({ error: "Maximum 20 URLs per competitor" }, { status: 400 });

  // Enforce monitored URL count limits across the workspace
  try {
    const competitors = await getWorkspaceCompetitors(workspaceId);
    const urlPromises = competitors.map((c) => getCompetitorUrls(c.competitorId));
    const allUrls = (await Promise.all(urlPromises)).flat();
    const currentUrlCount = allUrls.length;

    if (plan === "FREE" && currentUrlCount + urls.length > 10) {
      return Response.json(
        {
          error: `Free tier is limited to 10 URLs total across all competitors. (Currently using ${currentUrlCount}, attempting to add ${urls.length}). Please upgrade to Pro.`,
        },
        { status: 403 }
      );
    }
    if (plan === "PRO" && currentUrlCount + urls.length > 50) {
      return Response.json(
        {
          error: `Pro tier is limited to 50 URLs total across all competitors. (Currently using ${currentUrlCount}, attempting to add ${urls.length}). Please contact sales for Enterprise.`,
        },
        { status: 403 }
      );
    }
  } catch {
    return Response.json({ error: "Failed to verify monitored URLs limit" }, { status: 500 });
  }

  for (const u of urls) {
    if (!u || typeof u !== "object")
      return Response.json({ error: "Each URL entry must be an object" }, { status: 400 });
    const { url, urlType, checkIntervalMinutes } = u as Record<string, unknown>;
    if (!url || typeof url !== "string" || !isValidUrl(url))
      return Response.json({ error: `Invalid url: ${url}` }, { status: 400 });
    if (!VALID_URL_TYPES.includes(urlType as UrlType))
      return Response.json({ error: `Invalid urlType: ${urlType}` }, { status: 400 });
    if (!VALID_INTERVALS.includes(checkIntervalMinutes as number))
      return Response.json(
        { error: "checkIntervalMinutes must be 60, 360, or 1440" },
        { status: 400 }
      );
  }

  try {
    const competitor = await createCompetitor(workspaceId, {
      name: name.trim(),
      domain: domain.trim(),
    });

    await Promise.all(
      (urls as Array<{ url: string; urlType: UrlType; checkIntervalMinutes: number }>).map((u) =>
        createMonitoredUrl(competitor.competitorId, {
          url: u.url,
          urlType: u.urlType,
          checkIntervalMinutes: u.checkIntervalMinutes,
          workspaceId,
          competitorName: competitor.name,
        })
      )
    );

    return Response.json({ competitor }, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create competitor" }, { status: 500 });
  }
}
