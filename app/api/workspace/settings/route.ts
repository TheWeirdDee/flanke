import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getWorkspace, updateWorkspace, getWorkspaceMembers, addWorkspaceMember } from "@/lib/db/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = session.user.workspaceId;
  try {
    const [workspace, members] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceMembers(workspaceId),
    ]);

    return NextResponse.json({ workspace, members });
  } catch (err) {
    console.error("[workspace-settings-get] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = session.user.workspaceId;

  try {
    const body = await req.json();
    const { action, slackWebhookUrl, teamsWebhookUrl, plan, inviteEmail } = body;

    if (action === "update_webhooks") {
      await updateWorkspace(workspaceId, { slackWebhookUrl, teamsWebhookUrl });
      return NextResponse.json({ success: true });
    }

    if (action === "update_plan") {
      if (!plan || !["FREE", "PRO", "ENTERPRISE"].includes(plan.toUpperCase())) {
        return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
      }
      await updateWorkspace(workspaceId, { plan: plan.toUpperCase() });
      return NextResponse.json({ success: true });
    }

    if (action === "invite_member") {
      if (!inviteEmail || !inviteEmail.includes("@")) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }
      await addWorkspaceMember(workspaceId, inviteEmail);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[workspace-settings-post] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
