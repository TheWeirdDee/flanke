import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="px-6 py-8 max-w-xl bg-[#0a0a0d] text-white">
      <h1 className="text-[17px] font-bold text-white mb-1">
        Workspace settings
      </h1>
      <p className="text-[13px] text-slate-400 mb-8">
        Manage your Flanke workspace.
      </p>

      <div className="rounded-lg border border-white/10 bg-[#0d0d11]/50 divide-y divide-white/10">
        <div className="px-5 py-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">
            Account
          </p>
          <p className="text-[13px] text-white font-medium">{session.user.name}</p>
          <p className="text-[11px] text-slate-400">{session.user.email}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">
            Plan
          </p>
          <p className="text-[13px] text-white font-medium">Free</p>
          <p className="text-[11px] text-slate-400">
            2 competitors · 10 URLs · daily checks
          </p>
        </div>
      </div>
    </div>
  );
}
