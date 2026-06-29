"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Member {
  userId: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface Workspace {
  workspaceId: string;
  name: string;
  plan: string;
  slackWebhookUrl?: string | null;
  teamsWebhookUrl?: string | null;
}

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingWebhooks, setSavingWebhooks] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [inviting, setInviting] = useState(false);

  const [slackUrl, setSlackUrl] = useState("");
  const [teamsUrl, setTeamsUrl] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("FREE");
  const [inviteEmail, setInviteEmail] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function fetchSettings() {
    try {
      const res = await fetch("/api/workspace/settings");
      if (res.ok) {
        const data = await res.json();
        setWorkspace(data.workspace);
        setMembers(data.members);
        setSlackUrl(data.workspace?.slackWebhookUrl ?? "");
        setTeamsUrl(data.workspace?.teamsWebhookUrl ?? "");
        setSelectedPlan(data.workspace?.plan ?? "FREE");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      const updatedPlan = params.get("plan");
      const isSandbox = params.get("sandbox") === "true";
      setSuccessMsg(
        isSandbox
          ? `[Developer Sandbox Mode] Workspace plan updated to ${updatedPlan}!`
          : `Plan upgraded to ${updatedPlan} successfully!`
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("canceled") === "true") {
      setError("Stripe Checkout was canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  async function handleUpdateWebhooks(e: React.FormEvent) {
    e.preventDefault();
    setSavingWebhooks(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/workspace/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_webhooks",
          slackWebhookUrl: slackUrl || null,
          teamsWebhookUrl: teamsUrl || null,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Webhook settings saved successfully!");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update webhooks.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSavingWebhooks(false);
    }
  }

  function handleUpdatePlan(plan: string) {
    setSavingPlan(true);
    window.location.href = `/api/billing/checkout?plan=${plan}`;
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/workspace/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite_member",
          inviteEmail,
        }),
      });

      if (res.ok) {
        setInviteEmail("");
        setSuccessMsg(`Successfully invited ${inviteEmail}!`);
        fetchSettings();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to invite member.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setInviting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-slate-400 font-sans">
        Loading workspace settings...
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-2xl bg-[#0a0a0d] min-h-screen text-white font-sans space-y-8 overflow-y-auto">
      <div>
        <h1 className="text-[18px] font-extrabold text-white tracking-tight mb-1">
          Workspace Settings
        </h1>
        <p className="text-[13px] text-slate-400">
          Manage your Flanke workspace credentials, plans, and team invites.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-950/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-950/20 text-xs text-emerald-400">
          {successMsg}
        </div>
      )}

      {/* Subscription Plan Card */}
      <div className="rounded-xl border border-white/10 bg-[#0e0e12]/60 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Billing Plan</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Choose your subscription tier limits.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "FREE", desc: "2 Comp. / 10 URLs" },
            { name: "PRO", desc: "10 Comp. / 50 URLs" },
            { name: "ENTERPRISE", desc: "Unlimited limits" },
          ].map((p) => (
            <button
              key={p.name}
              disabled={savingPlan}
              onClick={() => handleUpdatePlan(p.name)}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                selectedPlan === p.name
                  ? "border-[#7ccb9b] bg-[#7ccb9b]/5 shadow-md shadow-[#7ccb9b]/5"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="text-xs font-bold text-white">{p.name}</div>
              <div className="text-[9px] text-slate-400 mt-1">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Webhook Notifications Form */}
      <form onSubmit={handleUpdateWebhooks} className="rounded-xl border border-white/10 bg-[#0e0e12]/60 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sales Trigger Webhooks</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Integrate live notifications with Slack or MS Teams channels.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Slack Webhook URL
            </label>
            <input
              type="url"
              value={slackUrl}
              onChange={(e) => setSlackUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full rounded border border-white/15 bg-[#14141a] px-3 py-2 text-[12px] text-white placeholder:text-slate-600 outline-none focus:border-[#7ccb9b] transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              MS Teams Webhook URL
            </label>
            <input
              type="url"
              value={teamsUrl}
              onChange={(e) => setTeamsUrl(e.target.value)}
              placeholder="https://outlook.office.com/webhook/..."
              className="w-full rounded border border-white/15 bg-[#14141a] px-3 py-2 text-[12px] text-white placeholder:text-slate-600 outline-none focus:border-[#7ccb9b] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingWebhooks}
          className="rounded bg-gradient-to-r from-[#1c6a58] to-[#24826d] px-4 py-2 text-[12px] font-bold text-white hover:brightness-110 shadow-md shadow-[#1c6a58]/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {savingWebhooks ? "Saving webhooks..." : "Save Webhook Settings"}
        </button>
      </form>

      {/* Workspace Members Panel */}
      <div className="rounded-xl border border-white/10 bg-[#0e0e12]/60 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workspace Members</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Invite coworkers to collaborate in this workspace.</p>
        </div>

        <form onSubmit={handleInviteMember} className="flex gap-2">
          <input
            required
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="coworker@company.com"
            className="flex-1 rounded border border-white/15 bg-[#14141a] px-3 py-2 text-[12px] text-white placeholder:text-slate-600 outline-none focus:border-[#7ccb9b] transition-all"
          />
          <button
            type="submit"
            disabled={inviting}
            className="rounded bg-white/5 border border-white/10 px-4 py-2 text-[12px] font-bold text-slate-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            {inviting ? "Inviting..." : "Invite"}
          </button>
        </form>

        <div className="divide-y divide-white/10 border-t border-white/10 mt-3 pt-2">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-xs font-bold text-white">{m.email}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Joined {new Date(m.joinedAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${
                m.role === "OWNER" 
                  ? "border-[#7ccb9b]/20 bg-[#7ccb9b]/5 text-[#7ccb9b]" 
                  : "border-white/10 text-slate-400"
              }`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
