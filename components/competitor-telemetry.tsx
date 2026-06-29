"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";

export default function CompetitorTelemetry() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center text-xs text-slate-500 font-sans">
        Initializing telemetry data...
      </div>
    );
  }

  // Animating path variables
  const pathVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
    }
  };

  return (
    <div className="w-full h-full min-h-[460px] p-6 flex flex-col justify-between bg-[#07070a]/90 relative font-sans">
      
      {/* Telemetry Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Live Telemetry</span>
          <h3 className="text-white font-extrabold text-sm tracking-tight mt-0.5">noteapp.com/pricing</h3>
        </div>
        <div className="flex items-center gap-2 bg-[#7ccb9b]/10 border border-[#7ccb9b]/25 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7ccb9b] animate-ping" />
          <span className="text-[9px] font-bold text-[#7ccb9b] uppercase tracking-wider">Scraping Live</span>
        </div>
      </div>

      {/* Main Stats Area */}
      <div className="grid grid-cols-2 gap-4 my-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Velocity Score</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-[#7ccb9b] tracking-tight">94</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">+12%</span>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Crawl Frequency</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-white tracking-tight">Hourly</span>
            <span className="text-[8px] text-[#f8a57d] font-bold tracking-widest uppercase ml-1">Pro</span>
          </div>
        </div>
      </div>

      {/* Animating Spline Graph (Replaced raw svg spline from previous code, fully styled in Mint green) */}
      <div className="relative h-32 w-full bg-[#0a0a0f] border border-white/5 rounded-xl overflow-hidden flex items-center justify-center">
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <svg className="w-full h-full absolute inset-0 z-10" viewBox="0 0 400 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7ccb9b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7ccb9b" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Shaded Area */}
          <path
            d="M 0,100 Q 80,90 120,60 T 240,40 T 340,15 T 400,10 L 400,120 L 0,120 Z"
            fill="url(#mintGrad)"
          />
          {/* Animating spline path */}
          <motion.path
            d="M 0,100 Q 80,90 120,60 T 240,40 T 340,15 T 400,10"
            fill="none"
            stroke="#7ccb9b"
            strokeWidth="3"
            strokeLinecap="round"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />
          
          {/* Target points */}
          <circle cx="340" cy="15" r="4" fill="#7ccb9b" />
          <circle cx="340" cy="15" r="8" fill="#7ccb9b" fillOpacity="0.3" className="animate-pulse" />
        </svg>

        <span className="absolute bottom-2 right-3 z-20 text-[8px] font-mono text-slate-500 uppercase tracking-widest">30-Day Change Frequency</span>
      </div>

      {/* Change Log Timeline Mockup */}
      <div className="mt-4 space-y-2">
        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Detected Change Signals</span>
        
        <div className="flex items-start gap-2.5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl p-2.5 transition-colors">
          <span className="text-xs shrink-0 mt-0.5">🚨</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-extrabold text-[#f8a57d] uppercase tracking-wider">Pricing Shift</span>
              <span className="text-[8px] text-slate-500">10m ago</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-normal mt-0.5 truncate">
              Plus Plan pricing page increased from $8/mo to $10/mo.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl p-2.5 transition-colors">
          <span className="text-xs shrink-0 mt-0.5">✨</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-extrabold text-[#7ccb9b] uppercase tracking-wider">Feature Added</span>
              <span className="text-[8px] text-slate-500">2h ago</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-normal mt-0.5 truncate">
              Added new AI positioning templates to hero grid.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
