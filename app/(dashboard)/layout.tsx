import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import CompetitorSidebar from "@/components/competitor-sidebar";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#060608] text-white font-sans selection:bg-[#7ccb9b]/20">
      {/* Top nav — 48px */}
      <header className="h-12 flex-shrink-0 border-b border-white/10 flex items-center justify-between px-4 bg-[#060608]/85 backdrop-blur-md z-30">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
            {/* Brand Logo with green bars and coral flame */}
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" style={{ color: "#1c6a58" }}>
              <rect x="4" y="4" width="10" height="24" rx="2.5" fill="currentColor" />
              <rect x="18" y="12" width="10" height="16" rx="2.5" fill="currentColor" className="opacity-80" />
              <g transform="translate(16, -1)" style={{ color: "#f8a57d" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </g>
            </svg>
            <span className="text-[15px] font-bold tracking-tight text-white">
              Flanke
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications bell icon link */}
          <Link 
            href="/feed/notifications" 
            className="text-slate-400 hover:text-white transition-colors relative flex items-center justify-center p-1"
            title="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {/* Floating indicator */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f8a57d] border border-[#060608]" />
          </Link>

          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? ""}
              width={26}
              height={26}
              className="rounded-full border border-white/10"
            />
          )}
          <span className="text-[13px] text-slate-300 font-medium hidden sm:inline">
            {session.user.name}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-medium cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <CompetitorSidebar />
        <main className="flex-1 overflow-y-auto bg-[#0a0a0d] text-white">
          {children}
        </main>
      </div>
    </div>
  );
}
