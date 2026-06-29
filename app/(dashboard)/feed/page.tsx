import EventFeed from "@/components/event-feed";

export default function FeedPage() {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0d] text-white">
      {/* Page header */}
      <div className="flex-shrink-0 border-b border-white/10 px-5 py-4 bg-[#0a0a0d]/50 backdrop-blur-md">
        <h1 className="text-[17px] font-semibold text-white">
          Intelligence feed
        </h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          All competitor change events, newest first.
        </p>
      </div>

      {/* Feed takes the remaining height */}
      <div className="flex-1 overflow-hidden">
        <EventFeed showCompetitor />
      </div>
    </div>
  );
}
