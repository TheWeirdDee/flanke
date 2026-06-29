/**
 * Flanke — single-URL check pipeline. LOCKED (PRD §6, §14).
 *
 * fetch → strip → diff → significance gate → classify → write event →
 * bump velocity → snapshot → reschedule.
 *
 * Never throws out of runUrlCheck: bot blocks mark the URL BLOCKED, any other
 * error is logged and the URL is rescheduled so the next cycle retries it.
 */

import { createHash } from "crypto";

import { fetchUrl, BotBlockError } from "./fetcher";
import { stripDynamic, MIN_SIGNIFICANT_WORD_CHANGE } from "./stripper";
import { diffContent } from "./differ";
import { classifyChange } from "@/lib/ai/classifier";
import {
  getLatestSnapshot,
  putSnapshotConditional,
  writeEventAndBumpVelocity,
  rescheduleUrl,
  markUrlBlocked,
} from "@/lib/db/client";
import type { MonitoredUrl } from "@/types";

function hash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function nextCheckIso(intervalMinutes: number): string {
  return new Date(Date.now() + intervalMinutes * 60_000).toISOString();
}

/** Result of one pipeline run, used by the worker for cycle accounting. */
export interface UrlCheckResult {
  eventWritten: boolean;
  blocked: boolean;
  errored: boolean;
}

export async function runUrlCheck(url: MonitoredUrl): Promise<UrlCheckResult> {
  const checkedAt = new Date().toISOString();
  const nextCheckAt = nextCheckIso(url.checkIntervalMinutes);

  try {
    const { html } = await fetchUrl(url.url);
    const stripped = stripDynamic(html);
    const newHash = hash(stripped);

    const previous = await getLatestSnapshot(url.urlId);

    // First-ever capture: store baseline, emit no event (avoids whole-page false positive).
    if (!previous) {
      await putSnapshotConditional(url.urlId, newHash, stripped);
      await rescheduleUrl(url.competitorId, url.urlId, nextCheckAt, checkedAt);
      return { eventWritten: false, blocked: false, errored: false };
    }

    // No change.
    if (previous.contentHash === newHash) {
      await rescheduleUrl(url.competitorId, url.urlId, nextCheckAt, checkedAt);
      return { eventWritten: false, blocked: false, errored: false };
    }

    const diff = diffContent(previous.content, stripped);

    // Significance gate (PRD §14).
    if (diff.wordChangeCount < MIN_SIGNIFICANT_WORD_CHANGE) {
      await putSnapshotConditional(url.urlId, newHash, stripped);
      await rescheduleUrl(url.competitorId, url.urlId, nextCheckAt, checkedAt);
      return { eventWritten: false, blocked: false, errored: false };
    }

    const classification = await classifyChange(
      diff.added,
      diff.removed,
      url.competitorName,
      url.urlType,
    );

    await writeEventAndBumpVelocity({
      competitorId: url.competitorId,
      workspaceId: url.workspaceId,
      competitorName: url.competitorName,
      urlId: url.urlId,
      urlType: url.urlType,
      signalType: classification.signalType,
      importanceScore: classification.importanceScore,
      summary: classification.summary,
      diffAdded: diff.added,
      diffRemoved: diff.removed,
    });

    await putSnapshotConditional(url.urlId, newHash, stripped);
    await rescheduleUrl(url.competitorId, url.urlId, nextCheckAt, checkedAt);

    return { eventWritten: true, blocked: false, errored: false };
  } catch (err) {
    if (err instanceof BotBlockError) {
      console.warn(`[pipeline] ${url.url} blocked — marking BLOCKED`);
      try {
        await markUrlBlocked(url.competitorId, url.urlId);
      } catch (markErr) {
        console.error(`[pipeline] failed to mark ${url.urlId} blocked:`, markErr);
      }
      return { eventWritten: false, blocked: true, errored: false };
    }

    console.error(`[pipeline] error checking ${url.url}:`, err);
    // Reschedule so a transient failure is retried next cycle; never throw.
    try {
      await rescheduleUrl(url.competitorId, url.urlId, nextCheckAt, checkedAt);
    } catch (reschedErr) {
      console.error(`[pipeline] failed to reschedule ${url.urlId}:`, reschedErr);
    }
    return { eventWritten: false, blocked: false, errored: true };
  }
}
