"use client";

import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  isNew: boolean;
}

const MOCK_NOTIFS: NotificationItem[] = [
  {
    id: "1",
    title: "NoteApp velocity score spiked to 94",
    desc: "A massive frequency of changes was detected on NoteApp landing pages, indicating a major positioning update.",
    time: "Just now",
    isNew: true,
  },
  {
    id: "2",
    title: "SyncDoc pricing change detected",
    desc: "SyncDoc raised their Plus Plan pricing from $8 to $10/user/mo.",
    time: "2 hours ago",
    isNew: true,
  },
  {
    id: "3",
    title: "DesignFly released native AI features",
    desc: "DesignFly published an update detailing their new AI Presentation builder & layout features.",
    time: "4 hours ago",
    isNew: false,
  },
  {
    id: "4",
    title: "CloudHost published enterprise pages",
    desc: "CloudHost launched SOC2 and HIPAA security pages, indicating an upmarket move.",
    time: "6 hours ago",
    isNew: false,
  },
];

export default function NotificationsPage() {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0d] text-white">
      {/* Page header */}
      <div className="flex-shrink-0 border-b border-white/10 px-5 py-4 bg-[#0a0a0d]/50 backdrop-blur-md flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-white">
            Workspace Notifications
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Real-time competitor event alerts.
          </p>
        </div>
        <Link 
          href="/feed" 
          className="text-xs font-bold text-[#7ccb9b] hover:text-[#4ab97e] transition-colors"
        >
          ← Back to feed
        </Link>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-w-3xl">
        {MOCK_NOTIFS.map((n) => (
          <div 
            key={n.id} 
            className={`p-4 rounded-xl border transition-all ${
              n.isNew 
                ? "bg-[#111116]/80 border-emerald-500/20 shadow-lg shadow-emerald-950/5" 
                : "bg-[#0d0d11]/40 border-white/5"
            }`}
          >
            <div className="flex justify-between items-start gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                {n.isNew && (
                  <span className="w-2 h-2 rounded-full bg-[#f8a57d]" />
                )}
                <h3 className="font-bold text-[14px] text-white">
                  {n.title}
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 flex-shrink-0">
                {n.time}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {n.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
