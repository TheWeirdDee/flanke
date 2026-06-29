import { getCompetitorUrls, getCompetitorWithEvents } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EventFeed from "@/components/event-feed";
import type { MonitoredUrlCard } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

const URL_TYPE_LABELS: Record<string, string> = {
  PRICING: "Pricing",
  CHANGELOG: "Changelog",
  CAREERS: "Careers",
  HOMEPAGE: "Homepage",
  CUSTOM: "Custom",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#7ccb9b",
  BLOCKED: "#f8a57d",
  PAUSED: "#64748b",
};

export default async function CompetitorDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  let competitor;
  let urls: MonitoredUrlCard[] = [];

  try {
    const [detail, urlList] = await Promise.all([
      getCompetitorWithEvents(id, 1),
      getCompetitorUrls(id),
    ]);
    competitor = detail.competitor;
    urls = urlList;
  } catch {
    // AWS not yet configured — show placeholder
    return <CompetitorPlaceholder />;
  }

  if (!competitor) notFound();

  if (competitor.workspaceId !== session.user.workspaceId) redirect("/feed");

  return (
    <div className="flex flex-col h-full bg-[#0a0a0d] text-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 px-5 py-4 bg-[#0a0a0d]/50 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[17px] font-semibold text-white">
              {competitor.name}
            </h1>
            <a
              href={competitor.domain}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-slate-400 hover:text-[#7ccb9b] transition-colors"
            >
              {competitor.domain}
            </a>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Velocity</span>
            <span className="text-[15px] font-bold text-white bg-white/5 border border-white/10 rounded px-2.5 py-1">
              {competitor.velocityScore}
            </span>
          </div>
        </div>

        {/* Monitored URLs */}
        {urls.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {urls.map((u) => (
              <span
                key={u.urlId}
                className="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2.5 py-1"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[u.status] ?? "#64748b" }}
                />
                <span className="text-[11px] text-slate-300 font-bold">
                  {URL_TYPE_LABELS[u.urlType] ?? u.urlType}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  ·{" "}
                  {u.checkIntervalMinutes === 60
                    ? "hourly"
                    : u.checkIntervalMinutes === 360
                      ? "6h"
                      : "daily"}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Event feed for this competitor */}
      <div className="flex-1 overflow-hidden">
        <EventFeed competitorId={id} showCompetitor={false} />
      </div>
    </div>
  );
}

function CompetitorPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6 bg-[#0a0a0d] text-white">
      <p className="text-[15px] text-slate-300 font-semibold">
        AWS not yet configured
      </p>
      <p className="text-[13px] text-slate-500 max-w-xs font-medium">
        Competitor data will appear here once DynamoDB is connected.
      </p>
    </div>
  );
}
