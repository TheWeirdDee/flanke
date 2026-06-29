"use client";

const STEPS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
    title: "1. Add Competitors",
    desc: "Simply paste your competitor URLs. Setup takes less than 60 seconds per company.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    title: "2. AI Processing",
    desc: "Our LLMs read every single content diff and classify the business meaning behind the change.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "3. Live Intel Feed",
    desc: "Your sales team gets a real-time feed of signals to use in their next competitive deal.",
  },
];

export default function StepsSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-32 px-6 lg:px-8 bg-transparent border-b border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Competitive Intel in 3 simple steps
          </h2>
          <p className="text-lg text-slate-400">
            No complex integrations. No messy scrapers. Just actionable intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div 
              key={i} 
              className="bg-[#0e0e11]/45 border border-white/10 rounded-3xl p-8 transition-all duration-300 hover:bg-[#121216]/60 hover:border-white/20 hover:shadow-2xl hover:shadow-[#000]/60 hover:-translate-y-1 backdrop-blur-md"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "#7ccb9b18", color: "#7ccb9b" }}>
                {step.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
              <p className="text-slate-400 leading-relaxed text-[15px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
