import { auth } from "@/lib/auth";
import { createCompetitor, createMonitoredUrl, writeEventAndBumpVelocity } from "@/lib/db/client";

export async function POST() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = session.user;

  try {
    // 1. Create competitor
    const competitor = await createCompetitor(workspaceId, {
      name: "SyncDoc",
      domain: "https://sync-doc.com",
    });

    // 2. Monitored URLs
    const pricingUrl = await createMonitoredUrl(competitor.competitorId, {
      url: "https://sync-doc.com/pricing",
      urlType: "PRICING",
      checkIntervalMinutes: 60,
      workspaceId,
      competitorName: competitor.name,
    });

    const changelogUrl = await createMonitoredUrl(competitor.competitorId, {
      url: "https://sync-doc.com/changelog",
      urlType: "CHANGELOG",
      checkIntervalMinutes: 60,
      workspaceId,
      competitorName: competitor.name,
    });

    // 3. Write Events
    await writeEventAndBumpVelocity({
      competitorId: competitor.competitorId,
      competitorName: competitor.name,
      workspaceId,
      urlId: pricingUrl.urlId,
      urlType: "PRICING",
      signalType: "PRICING_INCREASE",
      importanceScore: 8,
      summary: "Raised Plus Plan by 25% from $8 to $10/user/mo. Opportunity: Target SyncDoc customers searching for lower cost alternatives.",
      diffAdded: ["+ Plus Plan: $10 per user/month"],
      diffRemoved: ["- Plus Plan: $8 per user/month"],
    });

    await writeEventAndBumpVelocity({
      competitorId: competitor.competitorId,
      competitorName: competitor.name,
      workspaceId,
      urlId: changelogUrl.urlId,
      urlType: "CHANGELOG",
      signalType: "NEW_FEATURE_LAUNCHED",
      importanceScore: 7,
      summary: "Released native AI presentation features. Action: Target DesignFly accounts to pitch native slides features vs. pitch platforms.",
      diffAdded: ["+ Added: AI Presentation builder & layouts"],
      diffRemoved: [],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Demo seed error:", err);
    return Response.json({ error: "Failed to seed demo data" }, { status: 500 });
  }
}
