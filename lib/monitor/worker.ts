/**
 * Flanke — Railway persistent monitor worker. LOCKED (PRD §6, §5).
 *
 * Long-lived Node.js process (NOT a serverless cron). Every poll interval it
 * queries GSI2 for all URLs due for a check and runs the pipeline on each with
 * bounded concurrency, then records lastCycleAt on the SYSTEM item.
 */

import "dotenv/config";

import { getDueUrls, updateSystemLastCycle } from "@/lib/db/client";
import { runUrlCheck } from "./pipeline";
import type { MonitoredUrl } from "@/types";

export const AGENT_VERSION = "1.0.0";
const PROCESS_NAME = "Flanke monitor worker";

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 60_000);
const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY ?? 5);
const MAX_URLS_PER_CYCLE = 100;

let running = true;

/** Run an async mapper over items with a fixed worker-pool concurrency. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  const pool = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  });

  await Promise.all(pool);
  return results;
}

async function runCycle(cycleNumber: number): Promise<void> {
  const now = new Date().toISOString();
  let due: MonitoredUrl[] = [];

  try {
    due = await getDueUrls(now, MAX_URLS_PER_CYCLE);
  } catch (err) {
    console.error(`[worker] cycle ${cycleNumber} — failed to query due URLs:`, err);
    return;
  }

  let eventsWritten = 0;
  let errors = 0;

  if (due.length > 0) {
    const results = await mapWithConcurrency(due, CONCURRENCY, runUrlCheck);
    for (const r of results) {
      if (r.eventWritten) eventsWritten++;
      if (r.errored) errors++;
    }
  }

  console.log(
    `[worker] cycle ${cycleNumber} — checked ${due.length} URLs, ` +
      `${eventsWritten} events written, ${errors} errors`,
  );

  try {
    await updateSystemLastCycle(new Date().toISOString(), AGENT_VERSION);
  } catch (err) {
    console.error(`[worker] cycle ${cycleNumber} — failed to update SYSTEM status:`, err);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  console.log(`[worker] ${PROCESS_NAME} v${AGENT_VERSION} starting`);
  console.log(`[worker] poll interval ${POLL_INTERVAL_MS}ms, concurrency ${CONCURRENCY}`);

  const shutdown = (signal: string): void => {
    console.log(`[worker] received ${signal} — shutting down after current cycle`);
    running = false;
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  let cycleNumber = 0;
  while (running) {
    cycleNumber++;
    const startedAt = Date.now();
    await runCycle(cycleNumber);

    const elapsed = Date.now() - startedAt;
    const wait = Math.max(0, POLL_INTERVAL_MS - elapsed);
    if (running && wait > 0) await sleep(wait);
  }

  console.log(`[worker] ${PROCESS_NAME} stopped`);
}

// Only auto-run when executed directly (not when imported by tests/tooling).
if (process.argv[1] && /worker(\.[cm]?[jt]s)?$/.test(process.argv[1])) {
  main().catch((err) => {
    console.error("[worker] fatal:", err);
    process.exit(1);
  });
}
