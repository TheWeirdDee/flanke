/**
 * Flanke — DynamoDB smoke test (PRD §12 Day 0 gate, P2 step 3).
 *
 * Exercises the canonical write + GSI1 feed-read + cleanup path against the
 * live `flanke` table, logging PASS/FAIL per step. Exits non-zero on any FAIL.
 *
 * Run: npx tsx scripts/smoke-test.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PutCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

import { db, TABLE } from "@/lib/db/client";
import { Keys, GSI1, GSI_PREFIX, ENTITY } from "@/lib/db/schema";

const wId = `smoke-${randomUUID()}`;
const competitorId = "test";
const now = new Date().toISOString();
const eventId = randomUUID();

let failed = false;

function pass(step: string): void {
  console.log(`PASS — ${step}`);
}

function fail(step: string, err: unknown): void {
  failed = true;
  console.error(`FAIL — ${step}:`, err);
}

async function step(label: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    pass(label);
  } catch (err) {
    fail(label, err);
  }
}

async function main(): Promise<void> {
  console.log(`Smoke test against table "${TABLE}" (workspace ${wId})`);

  await step("a) write WORKSPACE item", async () => {
    await db.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: Keys.workspace.pk(wId),
          SK: Keys.workspace.sk(),
          entityType: ENTITY.WORKSPACE,
          workspaceId: wId,
          name: "Smoke Test Workspace",
          slug: wId.slice(0, 8),
          plan: "FREE",
          competitorCount: 0,
          createdAt: now,
          updatedAt: now,
        },
      }),
    );
  });

  await step("b) write COMPETITOR item", async () => {
    await db.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: Keys.competitor.pk(wId),
          SK: Keys.competitor.sk(competitorId),
          GSI1PK: Keys.competitor.gsi1pk(competitorId),
          GSI1SK: Keys.competitor.gsi1sk(),
          entityType: ENTITY.COMPETITOR,
          competitorId,
          workspaceId: wId,
          name: "Smoke Competitor",
          domain: "example.com",
          velocityScore: 0,
          lastEventAt: null,
          createdAt: now,
          updatedAt: now,
        },
      }),
    );
  });

  await step("c) write EVENT item (PK=COMPETITOR#test, SK=EVENT#<iso>#<uuid>)", async () => {
    await db.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: Keys.event.pk(competitorId),
          SK: Keys.event.sk(now, eventId),
          GSI1PK: Keys.event.gsi1pk(wId),
          GSI1SK: Keys.event.gsi1sk(now),
          GSI3PK: Keys.event.gsi3pk(wId),
          GSI3SK: Keys.event.gsi3sk("UNKNOWN_CHANGE", now),
          entityType: ENTITY.EVENT,
          eventId,
          competitorId,
          competitorName: "Smoke Competitor",
          workspaceId: wId,
          urlId: "smoke-url",
          urlType: "CUSTOM",
          signalType: "UNKNOWN_CHANGE",
          importanceScore: 1,
          summary: "Smoke test event.",
          diffAdded: ["added line"],
          diffRemoved: [],
          detectedAt: now,
          userTag: null,
        },
      }),
    );
  });

  await step("d) query GSI1 for the event (workspace feed pattern)", async () => {
    const res = await db.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: GSI1,
        KeyConditionExpression: "GSI1PK = :pk AND begins_with(GSI1SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": Keys.event.gsi1pk(wId),
          ":prefix": GSI_PREFIX.event,
        },
        ScanIndexForward: false,
      }),
    );
    const found = (res.Items ?? []).some((i) => i.eventId === eventId);
    if (!found) throw new Error("event not returned from GSI1 query");
  });

  await step("e) delete all 3 test items", async () => {
    await Promise.all([
      db.send(
        new DeleteCommand({
          TableName: TABLE,
          Key: { PK: Keys.workspace.pk(wId), SK: Keys.workspace.sk() },
        }),
      ),
      db.send(
        new DeleteCommand({
          TableName: TABLE,
          Key: { PK: Keys.competitor.pk(wId), SK: Keys.competitor.sk(competitorId) },
        }),
      ),
      db.send(
        new DeleteCommand({
          TableName: TABLE,
          Key: { PK: Keys.event.pk(competitorId), SK: Keys.event.sk(now, eventId) },
        }),
      ),
    ]);
  });

  console.log(failed ? "\nSMOKE TEST: FAIL" : "\nSMOKE TEST: PASS");
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error("smoke-test fatal:", err);
  process.exit(1);
});
