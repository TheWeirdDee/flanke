"use client";

import { useState } from "react";
import type { UrlType } from "@/types";

interface UrlEntry {
  url: string;
  urlType: UrlType;
  checkIntervalMinutes: 60 | 360 | 1440;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const URL_TYPES: { value: UrlType; label: string }[] = [
  { value: "PRICING", label: "Pricing" },
  { value: "CHANGELOG", label: "Changelog" },
  { value: "CAREERS", label: "Careers" },
  { value: "HOMEPAGE", label: "Homepage" },
  { value: "CUSTOM", label: "Custom" },
];

const INTERVALS: { value: 60 | 360 | 1440; label: string }[] = [
  { value: 60, label: "Hourly" },
  { value: 360, label: "Every 6h" },
  { value: 1440, label: "Daily" },
];

export default function AddCompetitorForm({ onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [urls, setUrls] = useState<UrlEntry[]>([
    { url: "", urlType: "PRICING", checkIntervalMinutes: 60 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addUrl() {
    if (urls.length >= 20) return;
    setUrls((prev) => [
      ...prev,
      { url: "", urlType: "CHANGELOG", checkIntervalMinutes: 60 },
    ]);
  }

  function removeUrl(i: number) {
    setUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateUrl(i: number, patch: Partial<UrlEntry>) {
    setUrls((prev) => prev.map((u, idx) => (idx === i ? { ...u, ...patch } : u)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), domain: domain.trim(), urls }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#0e0e12] border border-white/10 rounded-t-xl sm:rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-[15px] font-bold text-white">
            Add competitor
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-lg leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
              Company name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Notion"
              className="w-full rounded border border-white/15 bg-[#14141a] px-3 py-2 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-[#7ccb9b] transition-all"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
              Homepage URL
            </label>
            <input
              required
              type="url"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://notion.so"
              className="w-full rounded border border-white/15 bg-[#14141a] px-3 py-2 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-[#7ccb9b] transition-all"
            />
          </div>

          {/* URLs */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">
              Pages to monitor
            </label>
            <div className="space-y-2">
              {urls.map((entry, i) => (
                <div
                  key={i}
                  className="rounded border border-white/10 bg-[#14141a]/40 p-3 space-y-2"
                >
                  <div className="flex gap-2">
                    <select
                      value={entry.urlType}
                      onChange={(e) =>
                        updateUrl(i, { urlType: e.target.value as UrlType })
                      }
                      className="rounded border border-white/15 bg-[#14141a] px-2 py-1.5 text-[11px] text-slate-300 outline-none focus:border-[#7ccb9b] cursor-pointer"
                    >
                      {URL_TYPES.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={entry.checkIntervalMinutes}
                      onChange={(e) =>
                        updateUrl(i, {
                          checkIntervalMinutes: Number(e.target.value) as 60 | 360 | 1440,
                        })
                      }
                      className="rounded border border-white/15 bg-[#14141a] px-2 py-1.5 text-[11px] text-slate-300 outline-none focus:border-[#7ccb9b] cursor-pointer"
                    >
                      {INTERVALS.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrl(i)}
                        className="ml-auto text-slate-500 hover:text-[#f87171] text-sm transition-colors cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <input
                    required
                    type="url"
                    value={entry.url}
                    onChange={(e) => updateUrl(i, { url: e.target.value })}
                    placeholder="https://notion.so/pricing"
                    className="w-full rounded border border-white/15 bg-[#14141a] px-3 py-1.5 text-[11px] text-white placeholder:text-slate-600 outline-none focus:border-[#7ccb9b] transition-all"
                  />
                </div>
              ))}
            </div>

            {urls.length < 20 && (
              <button
                type="button"
                onClick={addUrl}
                className="mt-2 text-[11px] text-[#7ccb9b] hover:text-[#4ab97e] font-bold transition-colors cursor-pointer"
              >
                + Add another page
              </button>
            )}
          </div>

          {error && (
            <p className="text-[12px] text-[#f87171]">{error}</p>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-white/10 py-2 text-[13px] font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-gradient-to-r from-[#1c6a58] to-[#24826d] py-2 text-[13px] font-bold text-white hover:brightness-110 shadow-md shadow-[#1c6a58]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add competitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
