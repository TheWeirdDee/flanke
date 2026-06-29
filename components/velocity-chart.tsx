"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CHART_DATA = [
  { day: "D1", score: 24 },
  { day: "D5", score: 38 },
  { day: "D10", score: 30 },
  { day: "D15", score: 55 },
  { day: "D20", score: 48 },
  { day: "D25", score: 78 },
  { day: "D28", score: 70 },
  { day: "D30", score: 94 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090c]/95 border border-emerald-500/25 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md">
        <span className="text-[9px] font-bold text-slate-500 block tracking-wider uppercase">
          WORKSPACE METRIC
        </span>
        <span className="text-white font-black text-xs block mt-1">
          VELOCITY SCORE
        </span>
        <span className="text-[#7ccb9b] font-mono text-[11px] block font-bold mt-0.5">
          {payload[0].value} / 100 SPIKE
        </span>
      </div>
    );
  }
  return null;
};

export default function VelocityChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-sans">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[260px] p-4 relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={CHART_DATA}
          margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7ccb9b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#7ccb9b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(124, 203, 155, 0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            stroke="rgba(255, 255, 255, 0.2)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis hide={true} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(124, 203, 155, 0.2)" }} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#7ccb9b"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#velocityGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
