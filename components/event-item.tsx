"use client";

import { useState } from "react";
import type { FeedEvent } from "@/types";
import { timeAgo, SIGNAL_COLOR, SIGNAL_LABEL, importanceColor } from "@/lib/utils";

interface Props {
  event: FeedEvent;
  showCompetitor?: boolean;
}

export default function EventItem({ event, showCompetitor = true }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [tag, setTag] = useState(event.userTag ?? "");
  const [savedTag, setSavedTag] = useState(event.userTag);
  const [saving, setSaving] = useState(false);

  const signalColor = SIGNAL_COLOR[event.signalType];
  const signalLabel = SIGNAL_LABEL[event.signalType];
  const hasDiff = event.diffAdded.length > 0 || event.diffRemoved.length > 0;

  async function saveTag() {
    setSaving(true);
    try {
      await fetch(`/api/events/${event.eventId}/tag`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag: tag.trim() || null,
          competitorId: event.competitorId,
          detectedAt: event.detectedAt,
        }),
      });
      setSavedTag(tag.trim() || null);
      setTagging(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-b border-white/10 px-5 py-4 hover:bg-white/5 transition-colors bg-[#0a0a0d] text-white">
      {/* Row 1: signal badge + importance bar + time */}
      <div className="flex items-center gap-3 mb-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
          style={{
            color: signalColor,
            background: `${signalColor}12`,
            border: `1px solid ${signalColor}25`,
          }}
        >
          {signalLabel}
        </span>

        {/* Importance bar */}
        <div className="flex-1 max-w-[80px] h-1 rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(event.importanceScore / 10) * 100}%`,
              backgroundColor: importanceColor(event.importanceScore),
            }}
          />
        </div>
        <span className="text-[11px] text-slate-500 font-bold">
          {event.importanceScore}/10
        </span>

        <span className="ml-auto text-[11px] text-slate-500 flex-shrink-0">
          {timeAgo(event.detectedAt)}
        </span>
      </div>

      {/* Row 2: meta */}
      {showCompetitor && (
        <p className="text-[11px] text-slate-500 font-medium mb-1.5">
          {event.competitorName} · {event.urlType}
        </p>
      )}

      {/* Row 3: summary */}
      <p className="text-[13px] text-slate-200 leading-relaxed font-medium">
        {event.summary}
      </p>

      {/* Row 4: tag + expand */}
      <div className="flex items-center gap-3 mt-2.5">
        {/* Tag */}
        {tagging ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTag();
                if (e.key === "Escape") setTagging(false);
              }}
              placeholder="Add tag…"
              className="rounded border border-white/15 bg-[#0d0d12] px-2 py-0.5 text-[11px] text-white placeholder:text-slate-600 outline-none focus:border-[#7ccb9b] w-28"
            />
            <button
              onClick={saveTag}
              disabled={saving}
              className="text-[11px] text-[#7ccb9b] hover:text-[#4ab97e] font-bold cursor-pointer"
            >
              {saving ? "…" : "Save"}
            </button>
            <button
              onClick={() => setTagging(false)}
              className="text-[11px] text-slate-500 hover:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setTagging(true)}
            className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {savedTag ? (
              <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-slate-300 font-bold hover:border-[#7ccb9b] transition-all">
                {savedTag}
              </span>
            ) : (
              "+ Tag"
            )}
          </button>
        )}

        {/* Expand diff */}
        {hasDiff && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {expanded ? "Hide diff" : "Show diff"}
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Diff view */}
      {expanded && hasDiff && (
        <div className="mt-3 rounded border border-white/10 bg-[#070709] p-3 font-mono text-[11px] leading-relaxed space-y-1 overflow-x-auto">
          {event.diffAdded.map((line, i) => (
            <div key={`a${i}`} className="text-[#7ccb9b]">
              + {line}
            </div>
          ))}
          {event.diffRemoved.map((line, i) => (
            <div key={`r${i}`} className="text-[#f87171]">
              − {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
