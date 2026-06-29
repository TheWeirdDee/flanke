"use client";

import { useEffect, useState, useCallback } from "react";
import type { FeedEvent } from "@/types";
import EventItem from "./event-item";
import SignalFilter from "./signal-filter";
import { FILTER_GROUPS, type FilterGroup } from "@/lib/utils";

interface Props {
  competitorId?: string;
  showCompetitor?: boolean;
}

export default function EventFeed({ competitorId, showCompetitor = true }: Props) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterGroup>("ALL");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const url = competitorId
        ? `/api/competitors/${competitorId}`
        : "/api/events?limit=100";
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEvents(competitorId ? (data.recentEvents ?? []) : (data.events ?? []));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [competitorId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filtered =
    filter === "ALL"
      ? events
      : events.filter((e) => {
          const group = FILTER_GROUPS.find((g) => g.key === filter);
          return group?.types.includes(e.signalType) ?? false;
        });

  return (
    <div className="flex flex-col h-full bg-[#0a0a0d] text-white">
      {/* Filter bar */}
      <div className="flex-shrink-0 border-b border-white/10 px-5 py-3 bg-[#0c0c0e]/30">
        <SignalFilter active={filter} onChange={setFilter} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-[13px] text-slate-500 animate-pulse">Loading events…</div>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-[13px] text-slate-400">
              Could not load events.
            </p>
            <button
              onClick={fetchEvents}
              className="text-[13px] text-[#7ccb9b] hover:text-[#4ab97e] font-bold cursor-pointer transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-[15px] text-white font-semibold">No events yet</p>
            <p className="text-[13px] text-slate-400">
              {filter === "ALL"
                ? "Add a competitor and Flanke will start monitoring."
                : "No events match this signal filter."}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 &&
          filtered.map((event) => (
            <EventItem
              key={event.eventId}
              event={event}
              showCompetitor={showCompetitor}
            />
          ))
        }
      </div>
    </div>
  );
}
