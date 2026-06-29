import { getWorkspace } from "@/lib/db/client";

interface NotifyEventInput {
  workspaceId: string;
  competitorName: string;
  url: string;
  urlType: string;
  signalType: string;
  importanceScore: number;
  summary: string;
}

export async function dispatchWebhookNotifications(event: NotifyEventInput) {
  try {
    const workspace = await getWorkspace(event.workspaceId);
    if (!workspace) return;

    const { slackWebhookUrl, teamsWebhookUrl } = workspace as {
      slackWebhookUrl?: string | null;
      teamsWebhookUrl?: string | null;
    };

    if (slackWebhookUrl) {
      await sendSlackNotification(slackWebhookUrl, event);
    }
    if (teamsWebhookUrl) {
      await sendTeamsNotification(teamsWebhookUrl, event);
    }
  } catch (err) {
    console.error("[webhook-dispatcher] error:", err);
  }
}

async function sendSlackNotification(webhookUrl: string, event: NotifyEventInput) {
  const payload = {
    text: `🚨 *Flanke Competitor Alert: ${event.competitorName}*`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🚨 *Flanke Competitor Alert: ${event.competitorName}*\n*Page*: ${event.url} (${event.urlType})`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Signal*: \`${event.signalType}\`` },
          { type: "mrkdwn", text: `*Importance*: ${event.importanceScore}/10` },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*AI Summary*:\n>${event.summary}`,
        },
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[slack-notification] error:", err);
  }
}

async function sendTeamsNotification(webhookUrl: string, event: NotifyEventInput) {
  const payload = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: "1c6a58",
    summary: `Flanke Competitor Alert: ${event.competitorName}`,
    title: `🚨 Flanke Competitor Alert: ${event.competitorName}`,
    sections: [
      {
        activityTitle: `${event.competitorName} — Page Update Detected`,
        activitySubtitle: `${event.url} (${event.urlType})`,
        facts: [
          { name: "Signal Type", value: event.signalType },
          { name: "Importance Score", value: `${event.importanceScore}/10` },
        ],
        text: `**AI Summary**:\n\n${event.summary}`,
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[teams-notification] error:", err);
  }
}
