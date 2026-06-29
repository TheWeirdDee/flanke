"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CompetitorCard } from "@/types";
import VelocityBadge from "./velocity-badge";
import AddCompetitorForm from "./add-competitor-form";
import { timeAgo } from "@/lib/utils";

export default function CompetitorSidebar() {
  const pathname = usePathname();
  const [competitors, setCompetitors] = useState<CompetitorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchCompetitors = useCallback(async () => {
    try {
      const res = await fetch("/api/competitors");
      if (!res.ok) return;
      const data = await res.json();
      setCompetitors(data.competitors ?? []);
    } catch {
      // silently fail — empty sidebar
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  return (
    <>
      <aside className="w-60 flex-shrink-0 border-r border-white/10 bg-[#0c0c0e] flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">
            Competitors
          </span>
          <button
            onClick={() => setShowForm(true)}
            className="text-[11px] text-[#7ccb9b] hover:text-[#4ab97e] font-bold transition-colors cursor-pointer"
          >
            + Add
          </button>
        </div>

        {/* Feed link */}
        <Link
          href="/feed"
          className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-all ${
            pathname === "/feed"
              ? "border-l-2 border-[#7ccb9b] bg-white/5 text-white"
              : "border-l-2 border-transparent text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="text-[#7ccb9b]">⚡</span>
          All events
        </Link>

        {/* Competitors list */}
        <div className="flex-1 overflow-y-auto py-1">
          {loading && (
            <div className="px-4 py-3 text-[11px] text-slate-500">
              Loading…
            </div>
          )}

          {!loading && competitors.length === 0 && (
            <div className="px-4 py-4 text-center space-y-3">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                No competitors yet.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="w-full text-center text-xs font-bold py-1.5 rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Add Competitor
              </button>
              <div className="text-slate-600 text-[10px]">or</div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/demo-seed", { method: "POST" });
                    if (res.ok) fetchCompetitors();
                  } catch {}
                }}
                className="w-full text-center text-xs font-bold py-1.5 rounded bg-gradient-to-r from-[#1c6a58] to-[#24826d] text-white hover:brightness-110 shadow-md shadow-[#1c6a58]/20 transition-all cursor-pointer"
              >
                ⚡ Load Demo Data
              </button>
            </div>
          )}

          {competitors.map((c) => {
            const isActive = pathname === `/competitors/${c.competitorId}`;
            return (
              <Link
                key={c.competitorId}
                href={`/competitors/${c.competitorId}`}
                className={`flex flex-col gap-1 px-4 py-2.5 transition-all ${
                  isActive
                    ? "border-l-2 border-[#7ccb9b] bg-white/5"
                    : "border-l-2 border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[13px] font-medium truncate ${
                      isActive ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {c.name}
                  </span>
                  <VelocityBadge score={c.velocityScore} />
                </div>
                <span className="text-[11px] text-slate-500 truncate">
                  {c.lastEventAt ? timeAgo(c.lastEventAt) : "No events yet"}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>

      {showForm && (
        <AddCompetitorForm
          onClose={() => setShowForm(false)}
          onSuccess={fetchCompetitors}
        />
      )}
    </>
  );
}
