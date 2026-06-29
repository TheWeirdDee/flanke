"use client";

import Link from "next/link";
import Script from "next/script";
import StepsSection from "@/components/steps-section";
import VelocityChart from "@/components/velocity-chart";
import { motion } from "framer-motion";

const MINT  = "#7ccb9b";
const PINE  = "#1c6a58";
const CORAL = "#f8a57d";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060608] via-[#0b0c10] to-[#040405] text-white font-sans selection:bg-[#7ccb9b]/20 overflow-x-hidden">
      
      {/* Script for Lottie animations */}
      <Script 
        src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js" 
        type="module"
        strategy="afterInteractive"
      />

      {/* ── 1. NAV ─────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed w-full top-0 z-50 bg-[#060608]/75 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            {/* Logo consisting of two rectangular bars and a coral flame replacing the dot */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: PINE }}>
              <rect x="4" y="4" width="10" height="24" rx="2.5" fill="currentColor" />
              <rect x="18" y="12" width="10" height="16" rx="2.5" fill="currentColor" className="opacity-80" />
              <g transform="translate(17, 1)" style={{ color: CORAL }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </g>
            </svg>
            <span className="text-[20px] font-bold tracking-tight text-white">Flanke</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Product", href: "#features" },
              { label: "Solutions", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
              { label: "Resources", href: "#footer" }
            ].map(link => (
              <a key={link.label} href={link.href} className="text-[14px] font-bold text-slate-400 hover:text-white transition-colors">{link.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[14px] font-medium text-slate-400 hover:text-white transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/signup" className="rounded-md px-6 py-2.5 text-[14px] font-bold text-white transition-all bg-gradient-to-r from-[#1c6a58] to-[#24826d] hover:brightness-110 shadow-lg shadow-[#1c6a58]/20">
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── 2. HERO ────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-20 lg:pt-28 lg:pb-32 flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left Content */}
        <motion.div
          className="flex-1 max-w-[600px] z-10"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center rounded-2xl px-3 py-1 text-[10px] font-semibold uppercase tracking-widest mb-6 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 backdrop-blur-sm">
            Competitive Intelligence Platform
          </motion.div>

          {/* Large eye icon below badge has been removed as requested */}

          <motion.h1 variants={fadeUp} className="text-[42px] lg:text-[50px] leading-[1.1] font-extrabold tracking-tight mb-6 text-white">
            Your competitors are moving. <br/>
            <span className="text-slate-400">You're not watching.</span> <br/>
            <span className="inline-flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7ccb9b] to-[#4ab97e]">We can.</span>
              {/* Lottie eye animation next to 'we can' text is made bigger (96x96px) */}
              <span className="w-24 h-24 inline-block align-middle ml-2" dangerouslySetInnerHTML={{ __html: `<dotlottie-wc src="https://lottie.host/5a061fba-35b6-48ff-9582-da381d506cbe/Kgo9HKL584.lottie" style="width: 96px; height: 96px;" autoplay loop></dotlottie-wc>` }} />
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[17px] leading-relaxed text-slate-400 mb-10 max-w-[500px]">
            Flanke monitors competitor pages around the clock, detects every change, and classifies what it means — pricing pressure, feature threat, talent raid, messaging shift — before your next sales call.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <Link href="/signup" className="rounded-md px-8 py-3.5 text-[16px] font-bold text-white transition-all bg-gradient-to-r from-[#1c6a58] to-[#24826d] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#1c6a58]/30 shadow-lg shadow-[#1c6a58]/20">
              Start Monitoring Free
            </Link>
            <Link href="#pricing" className="rounded-md px-8 py-3.5 text-[16px] font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md">
              View Pricing
            </Link>
          </motion.div>
        </motion.div>

        {/* Right UI Briefing Panel */}
        <motion.div
          className="flex-1 relative w-full lg:h-[550px] hidden md:block"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle green background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-[100px] -z-10 bg-[#7ccb9b]/12" />
          
          <div className="absolute right-0 top-[5%] w-full max-w-[530px] rounded-3xl border border-white/10 bg-[#0a0a0d]/85 shadow-2xl shadow-black/80 backdrop-blur-xl p-6 z-20">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">Live Competitor Intel Briefing</h3>
                <p className="text-xs text-slate-400">AI-extracted sales enablement triggers</p>
              </div>
              <div className="flex items-center gap-2 bg-[#7ccb9b]/10 border border-[#7ccb9b]/25 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#7ccb9b] animate-pulse" />
                <span className="text-[10px] font-bold text-[#7ccb9b] tracking-wider uppercase">Live Feed</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Used generic/mock company names to avoid legal risks. Removed purple color highlights */}
              <BriefingRow 
                company="SyncDoc" 
                signal="Pricing Increase" 
                color={CORAL} 
                importance="8/10" 
                desc="Raised Plus Plan by 25% from $8 to $10/user/mo. Opportunity: Target SyncDoc customers searching for lower cost alternatives." 
                time="2h ago"
              />
              <BriefingRow 
                company="DesignFly" 
                signal="New AI Feature" 
                color={MINT} 
                importance="7/10" 
                desc="Released native AI presentation features. Action: Target DesignFly accounts to pitch native slides features vs. pitch platforms." 
                time="4h ago"
              />
              <BriefingRow 
                company="CloudHost" 
                signal="Enterprise Expansion" 
                color={CORAL} 
                importance="9/10" 
                desc="Published dedicated HIPAA and SOC2 enterprise pages. Clear trigger: CloudHost is actively moving upmarket." 
                time="6h ago"
              />
            </div>
          </div>
          
          {/* Floating Notification Card - Redesigned into a proper notification block */}
          <div className="absolute -left-10 top-[70%] w-[240px] rounded-xl border border-white/10 bg-[#0d0d11]/90 shadow-2xl shadow-black/85 backdrop-blur-xl p-3.5 z-30 animate-bounce-slow flex items-start gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0 text-[#7ccb9b]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 justify-between w-full">
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">Signal Alert</p>
                <span className="text-[9px] text-slate-500">Just now</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">NoteApp velocity score spiked to <strong className="text-[#7ccb9b]">94</strong>.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── 3. LOGOS ───────────────────────────────────────────────────────── */}
      {/* Grayscale invert removed to make logos visible as white/silver on dark background */}
      <motion.section
        className="py-10 border-y border-white/5 bg-black/20 text-slate-400"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold text-slate-500 mb-8 uppercase tracking-widest">Trusted by modern sales teams</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-60">
            {["Salesforce", "HubSpot", "Outreach", "Gong", "Apollo.io"].map(l => (
              <span key={l} className="text-2xl font-bold text-slate-300 tracking-tight">{l}</span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 4. HOW IT WORKS ────────────────────────────────────────────────── */}
      <StepsSection />

      {/* ── 5. ZIG ZAG FEATURES (REDESIGNED INTO ALTERNATING PANEL GRID MATCHING THE REFERENCE IMAGE) ── */}
      <section id="features" className="py-12 md:py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 border border-white/10 rounded-3xl bg-[#09090b]/40 backdrop-blur-md overflow-hidden">
          
          {/* Row 1, Left (Top-Left): Automated Monitoring */}
          <motion.div
            className="p-6 md:p-10 border-b border-white/10 md:border-r flex flex-col justify-between min-h-[460px] relative group"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
          >
            {/* Glow shadow with app color (Coral) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] bg-[#f8a57d]/8 opacity-40 pointer-events-none group-hover:opacity-80 transition-opacity duration-500" />
            
            <div className="z-10">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-400 mb-4 block">
                Automated Monitoring
              </span>
              <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
                Stop checking competitor websites manually.
              </h2>
              <p className="text-[14px] text-slate-400 leading-relaxed mb-6">
                Paste a URL once. Flanke's crawler runs 24/7, filters noise like timestamps, and finds the exact moment a competitor changes their pricing, features, or positioning.
              </p>
            </div>

            {/* Graphic below (Pricing diff mockup) */}
            <div className="mt-4 z-10 w-full flex justify-center">
              <div className="w-full max-w-md rounded-xl border border-white/10 shadow-2xl overflow-hidden bg-[#0d0d11]">
                <div className="bg-[#131317] border-b border-white/10 px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-[10px] text-slate-500 ml-2 font-mono">sync-doc.com/pricing</span>
                </div>
                <div className="p-4 bg-[#0a0a0c] font-mono text-[11px]">
                  <div className="flex items-start text-red-400 bg-red-950/20 border-l-2 border-red-500 px-2 py-1 mb-1 rounded line-through">
                    <span>-</span>
                    <span className="ml-4">Plus Plan: $8 per user/month</span>
                  </div>
                  <div className="flex items-start text-emerald-400 bg-emerald-950/20 border-l-2 border-emerald-500 px-2 py-1 rounded">
                    <span>+</span>
                    <span className="ml-4">Plus Plan: $10 per user/month</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Row 1, Right (Top-Right): AI Classification */}
          <motion.div
            className="p-6 md:p-10 border-b border-white/10 flex flex-col justify-between min-h-[460px] relative group"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
            transition={{ delay: 0.1 }}
          >
            {/* Glow shadow with app color (Mint) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] bg-[#7ccb9b]/8 opacity-40 pointer-events-none group-hover:opacity-80 transition-opacity duration-500" />

            <div className="z-10">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#7ccb9b] mb-4 block">
                AI Classification
              </span>
              <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
                AI turns page diffs into business intelligence.
              </h2>
              <p className="text-[14px] text-slate-400 leading-relaxed mb-6">
                Raw page changes are useless. Flanke uses LLMs to read the exact diff, determine what it means, assign it to one of 11 Direct Business Signals, and rate its importance.
              </p>
            </div>

            {/* Flow diagram graphic below */}
            <div className="mt-4 z-10 w-full flex items-center justify-center gap-3">
              {/* Left side: Diff Card */}
              <div className="bg-[#0e0e11] border border-white/10 rounded-xl p-3 w-[150px] shadow-lg">
                <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">RAW DIFF</div>
                <div className="text-[10px] font-mono text-red-400 line-through">-$8/mo</div>
                <div className="text-[10px] font-mono text-emerald-400">+$10/mo</div>
                <div className="mt-2.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-[8px] text-slate-400 font-bold uppercase">Classifying</span>
                </div>
              </div>

              {/* Connecting Arrow */}
              <div className="text-slate-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>

              {/* Right side: AI Classification Checklist table */}
              <div className="bg-[#0e0e11] border border-white/10 rounded-xl w-[190px] overflow-hidden shadow-lg">
                <div className="bg-[#131317] border-b border-white/10 px-3 py-1 flex justify-between items-center">
                  <span className="text-[9px] font-bold text-white tracking-wider uppercase">AI Classifier</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="p-2.5 space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                     <span className="text-slate-400">Signal</span>
                     <span className="text-orange-400 font-bold">Pricing ✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-slate-400">Severity</span>
                     <span className="text-white font-bold">8/10 ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Row 2 (Middle-Full): Competitor Analytics / Velocity Trend */}
          <motion.div
            className="col-span-1 md:col-span-2 border-b border-white/10 flex flex-col md:flex-row min-h-[400px] relative group overflow-hidden"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
          >
            {/* Glow shadow (Mint) */}
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[90px] bg-[#7ccb9b]/5 opacity-50 pointer-events-none group-hover:opacity-75 transition-opacity duration-500" />

            {/* Left Content Column */}
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-center z-10">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#7ccb9b] mb-4 block self-start">
                Competitor Analytics
              </span>
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                Preempt competitor threat velocity.
              </h2>
              <p className="text-[14px] text-slate-400 leading-relaxed max-w-md">
                Track change frequency and momentum over 30 days. Flanke calculates a real-time Velocity Score to alert your sales leadership of product updates before they launch.
              </p>
            </div>

            {/* Right Chart Column — Recharts Area Chart */}
            <div className="flex-1 min-h-[320px] border-t md:border-t-0 md:border-l border-white/10 relative bg-[#08080b]/55 overflow-hidden">
              <VelocityChart />
            </div>
          </motion.div>

          {/* Row 3, Left (Bottom-Left): Sales Enablement Alerts */}
          <motion.div
            className="p-6 md:p-10 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between min-h-[460px] relative group"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
          >
            {/* Glow shadow with app color (Mint) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] bg-[#7ccb9b]/8 opacity-40 pointer-events-none group-hover:opacity-80 transition-opacity duration-500" />

            <div className="z-10">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#7ccb9b] mb-4 block">
                Sales Alerts
              </span>
              <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
                Get notified where your team already works.
              </h2>
              <p className="text-[14px] text-slate-400 leading-relaxed mb-6">
                Receive real-time competitor triggers on Slack, Microsoft Teams, or custom webhooks, containing battlecards to counter messaging shifts instantly.
              </p>
            </div>

            {/* Graphic below (Slack notification preview) */}
            <div className="mt-4 z-10 w-full flex justify-center">
              <div className="w-full max-w-md rounded-xl border border-white/10 shadow-2xl overflow-hidden bg-[#0d0d11] p-4 text-[11px]">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                  <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center font-bold text-[9px] text-white">#</div>
                  <span className="font-bold text-slate-300">#competitor-intel</span>
                  <span className="text-slate-500">12:34 PM</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded bg-[#f8a57d] flex items-center justify-center font-black text-[10px] text-black">F</div>
                  <div>
                    <span className="font-bold text-white block">Flanke Bot <span className="text-[8px] bg-emerald-500/20 text-[#7ccb9b] px-1 rounded ml-1 font-normal">APP</span></span>
                    <p className="text-slate-300 mt-1">🚨 <strong>NoteApp</strong> increased prices. Target clients on lower alternatives.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Row 3, Right (Bottom-Right): Instant Battlecards */}
          <motion.div
            className="p-6 md:p-10 flex flex-col justify-between min-h-[460px] relative group"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}
            transition={{ delay: 0.1 }}
          >
            {/* Glow shadow with app color (Coral) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] bg-[#f8a57d]/8 opacity-40 pointer-events-none group-hover:opacity-80 transition-opacity duration-500" />

            <div className="z-10">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-400 mb-4 block">
                Instant Battlecards
              </span>
              <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
                Empower reps to handle competitor pricing pressure.
              </h2>
              <p className="text-[14px] text-slate-400 leading-relaxed mb-6">
                Flanke extracts landing card intelligence and automatically compiles strengths, weaknesses, and counter-tactics so your team stays ahead in every deal.
              </p>
            </div>

            {/* Graphic below (Battlecard visual) */}
            <div className="mt-4 z-10 w-full flex justify-center">
              <div className="bg-[#0e0e11] border border-white/10 rounded-xl w-full max-w-[280px] overflow-hidden shadow-lg">
                <div className="bg-[#131317] border-b border-white/10 px-3 py-2 flex justify-between items-center">
                  <span className="text-[9px] font-bold text-white tracking-wider uppercase">BATTLECARD: DesignCo</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f8a57d]" />
                </div>
                <div className="p-3 space-y-2 text-[10px]">
                  <div className="p-2 rounded bg-red-950/10 border border-red-500/10">
                    <span className="font-bold text-red-400">Weakness:</span>
                    <p className="text-slate-400 text-[9px] mt-0.5">They lack native compliance templates for healthcare.</p>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/10 border border-emerald-500/10">
                    <span className="font-bold text-[#7ccb9b]">Positioning:</span>
                    <p className="text-slate-400 text-[9px] mt-0.5">Highlight Flanke's live workspace compliance monitoring.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </section>

      {/* ── 6. PRICING ─────────────────────────────────────────────────────── */}
      <motion.section id="pricing" className="py-16 md:py-32 bg-[#060608] border-t border-white/5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-10 md:mb-20"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Pricing that scales with you</h2>
            <p className="text-lg text-slate-400">Start monitoring your biggest threats for free. Upgrade when you need hourly checks and team collaboration.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            {/* Starter Plan */}
            <motion.div variants={fadeUp} className="bg-[#0d0d11]/70 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl hover:border-white/20 hover:bg-[#121217]/85 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-slate-400 font-medium">/mo</span>
              </div>
              <p className="text-sm text-slate-400 mb-8 h-10">Perfect for founders keeping an eye on the market.</p>
              <ul className="space-y-4 mb-8 text-sm font-medium text-slate-300">
                <li className="flex gap-3"><span style={{ color: MINT }}>✓</span> 2 Competitors</li>
                <li className="flex gap-3"><span style={{ color: MINT }}>✓</span> 10 URLs monitored</li>
                <li className="flex gap-3"><span style={{ color: MINT }}>✓</span> Daily frequency</li>
              </ul>
              <Link href="/signup" className="block w-full py-3 rounded-md text-center font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                Start Free
              </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div variants={fadeUp} className="rounded-3xl p-8 shadow-2xl border border-emerald-500/20 shadow-emerald-950/20 transform md:-translate-y-4 relative bg-gradient-to-b from-[#1c6a58] to-[#144f41]">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wider py-1 px-3 rounded-full bg-[#f8a57d] text-white">
                Most Popular
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-2 mb-4 text-white">
                <span className="text-4xl font-extrabold">$49</span>
                <span className="font-medium opacity-80">/mo</span>
              </div>
              <p className="text-sm mb-8 h-10 text-emerald-100/75">For sales teams who need real-time intelligence.</p>
              <ul className="space-y-4 mb-8 text-sm font-medium text-white">
                <li className="flex gap-3"><span style={{ color: MINT }}>✓</span> 10 Competitors</li>
                <li className="flex gap-3"><span style={{ color: MINT }}>✓</span> 50 URLs monitored</li>
                <li className="flex gap-3"><span style={{ color: MINT }}>✓</span> Hourly frequency</li>
                <li className="flex gap-3"><span style={{ color: MINT }}>✓</span> Priority AI processing</li>
              </ul>
              <Link href="/signup" className="block w-full py-3 rounded-md text-center font-bold transition-all bg-white hover:bg-slate-50 hover:shadow-xl hover:shadow-emerald-950/30" style={{ color: PINE }}>
                Get Pro
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div variants={fadeUp} className="bg-[#0d0d11]/70 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl hover:border-white/20 hover:bg-[#121217]/85 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-extrabold text-white">$99</span>
                <span className="text-slate-400 font-medium">/mo</span>
              </div>
              <p className="text-sm text-slate-400 mb-8 h-10">For large organizations with complex needs.</p>
              <ul className="space-y-4 mb-8 text-sm font-medium text-slate-300">
                <li className="flex gap-3"><span style={{ color: PINE }}>✓</span> Unlimited Competitors</li>
                <li className="flex gap-3"><span style={{ color: PINE }}>✓</span> Unlimited URLs</li>
                <li className="flex gap-3"><span style={{ color: PINE }}>✓</span> Custom Webhooks</li>
              </ul>
              <Link href="/login" className="block w-full py-3 rounded-md text-center font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                Contact Sales
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </motion.section>

      {/* ── 7. FOOTER ──────────────────────────────────────────────────────── */}
      <footer id="footer" className="bg-[#040405] border-t border-white/10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            
            {/* Brand Col */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-6 hover:opacity-90 transition-opacity">
                {/* Logo consisting of two rectangular bars and a coral flame replacing the dot */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: PINE }}>
                  <rect x="4" y="4" width="10" height="24" rx="2.5" fill="currentColor" />
                  <rect x="18" y="12" width="10" height="16" rx="2.5" fill="currentColor" className="opacity-80" />
                  <g transform="translate(17, 1)" style={{ color: CORAL }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                    </svg>
                  </g>
                </svg>
                <span className="text-lg font-bold text-white">Flanke</span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-8">
                The real-time competitive intelligence platform for B2B sales teams. Never lose a deal to a competitor's secret move again.
              </p>
              
              {/* Newsletter */}
              <div className="max-w-sm">
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Subscribe to newsletter</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="Enter your email" className="flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 backdrop-blur-md" />
                  <button className="text-white px-5 py-2.5 rounded-md text-sm font-bold transition-all bg-gradient-to-r from-[#1c6a58] to-[#24826d] hover:brightness-110 shadow-lg shadow-[#1c6a58]/20">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© 2026 Flanke. All rights reserved.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 cursor-pointer">In</div>
              <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 cursor-pointer">X</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── HELPER COMPONENTS ───────────────────────────────────────────────── */
function BriefingRow({ company, signal, color, importance, desc, time }: any) {
  return (
    <div className="p-4 rounded-2xl bg-[#121216]/50 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-[#16161c]/70 hover:border-white/10 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white text-sm tracking-tight">{company}</span>
          <span className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: color }}>
            {signal}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Importance: <strong className="text-white">{importance}</strong></span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>
      <p className="text-[12px] leading-relaxed text-slate-300 font-medium">
        {desc}
      </p>
    </div>
  );
}

function MockupCard({ type, color, company, desc, time }: any) {
  return (
    <div className="p-4 rounded-xl bg-[#121215]/60 border border-white/10 backdrop-blur-sm shadow-md">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border" style={{ color: color, backgroundColor: `${color}15`, borderColor: `${color}25` }}>
          {type}
        </span>
        <span className="text-xs text-slate-500">{time}</span>
      </div>
      <p className="font-bold text-white text-sm">{company}</p>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
  );
}


