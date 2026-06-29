"use client";

import { FILTER_GROUPS, type FilterGroup } from "@/lib/utils";

interface Props {
  active: FilterGroup;
  onChange: (group: FilterGroup) => void;
}

export default function SignalFilter({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {FILTER_GROUPS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
            active === key
              ? "bg-gradient-to-r from-[#1c6a58] to-[#24826d] text-white shadow-sm shadow-[#1c6a58]/20"
              : "border border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
