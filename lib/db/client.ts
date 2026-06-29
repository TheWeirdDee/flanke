/**
 * Flanke — DynamoDB DocumentClient singleton + data-access layer.
 * LOCKED (PRD §6, §7).
 *
 * Architectural decisions enforced here:
 *  - Event SK = EVENT#<iso>#<uuid>; ScanIndexForward:false → newest-first (PRD §7.1)
 *  - Conditional snapshot write: attribute_not_exists(PK) OR contentHash <> :newHash (PRD §7.3)
 *  - velocityScore incremented atomically via ADD on every event write (PRD §7.4)
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  GetCommand,
  DeleteCommand,
  BatchWriteCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

import {
  Keys,
  TABLE_NAME,
  GSI1,
  GSI2,
  GSI3,
  SK_PREFIX,
  GSI_PREFIX,
  STATUS_ACTIVE_GSI2PK,
  ENTITY,
} from "./schema";
import type {
  CompetitorCard,
  CreateCompetitorData,
  CreateMonitoredUrlData,
  FeedEvent,
  MonitoredUrl,
  MonitoredUrlCard,
  Snapshot,
  SignalType,
  SystemStatus,
  UrlType,
  WriteEventInput,
} from "@/types";

// ─────────────────────────────────────────────
// Singleton client
// ─────────────────────────────────────────────
export const TABLE = process.env.DYNAMODB_TABLE_NAME ?? TABLE_NAME;

const baseClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export const db = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
  },
});

// ─────────────────────────────────────────────
// Typed item readers (avoid `any` on SDK responses)
// ─────────────────────────────────────────────
type Item = Record<string, unknown>;

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNullableString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((e): e is string => typeof e === "string") : [];
}

function items(result: { Items?: Item[] }): Item[] {
  return result.Items ?? [];
}

// ─────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────
function toCompetitorCard(item: Item): CompetitorCard {
  return {
    competitorId: asString(item.competitorId),
    workspaceId: asString(item.workspaceId),
    name: asString(item.name),
    domain: asString(item.domain),
    velocityScore: asNumber(item.velocityScore),
    lastEventAt: asNullableString(item.lastEventAt),
    createdAt: asString(item.createdAt),
  };
}

function toFeedEvent(item: Item): FeedEvent {
  return {
    eventId: asString(item.eventId),
    competitorId: asString(item.competitorId),
    competitorName: asString(item.competitorName),
    workspaceId: asString(item.workspaceId),
    urlId: asString(item.urlId),
    urlType: asString(item.urlType, "CUSTOM") as UrlType,
    signalType: asString(item.signalType, "UNKNOWN_CHANGE") as SignalType,
    importanceScore: asNumber(item.importanceScore, 1),
    summary: asString(item.summary),
    diffAdded: asStringArray(item.diffAdded),
    diffRemoved: asStringArray(item.diffRemoved),
    detectedAt: asString(item.detectedAt),
    userTag: asNullableString(item.userTag),
  };
}

function toMonitoredUrl(item: Item): MonitoredUrl {
  return {
    urlId: asString(item.urlId),
    competitorId: asString(item.competitorId),
    workspaceId: asString(item.workspaceId),
    competitorName: asString(item.competitorName),
    url: asString(item.url),
    urlType: asString(item.urlType, "CUSTOM") as UrlType,
    checkIntervalMinutes: asNumber(item.checkIntervalMinutes, 60),
  };
}

function toMonitoredUrlCard(item: Item): MonitoredUrlCard {
  return {
    urlId: asString(item.urlId),
    competitorId: asString(item.competitorId),
    url: asString(item.url),
    urlType: asString(item.urlType, "CUSTOM") as UrlType,
    checkIntervalMinutes: asNumber(item.checkIntervalMinutes, 60),
    status: asString(item.status, "ACTIVE") as MonitoredUrlCard["status"],
    lastCheckedAt: asNullableString(item.lastCheckedAt),
    nextCheckAt: asString(item.nextCheckAt),
  };
}

function toSnapshot(item: Item): Snapshot {
  return {
    urlId: asString(item.urlId),
    contentHash: asString(item.contentHash),
    content: asString(item.content),
    capturedAt: asString(item.capturedAt),
  };
}

// ─────────────────────────────────────────────
// Read access patterns
// ─────────────────────────────────────────────

/** AP1 — all competitors in a workspace. */
export async function getWorkspaceCompetitors(workspaceId: string): Promise<CompetitorCard[]> {
  const res = await db.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": Keys.competitor.pk(workspaceId),
        ":prefix": SK_PREFIX.competitor,
      },
    }),
  );
  return items(res).map(toCompetitorCard);
}

/** AP2/AP3 — competitor META (via GSI1) + most-recent events (base table). */
export async function getCompetitorWithEvents(
  competitorId: string,
  eventLimit = 50,
): Promise<{ competitor: CompetitorCard | null; recentEvents: FeedEvent[] }> {
  const [metaRes, eventRes] = await Promise.all([
    db.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: GSI1,
        KeyConditionExpression: "GSI1PK = :pk AND GSI1SK = :sk",
        ExpressionAttributeValues: {
          ":pk": Keys.competitor.gsi1pk(competitorId),
          ":sk": Keys.competitor.gsi1sk(),
        },
        Limit: 1,
      }),
    ),
    db.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": Keys.event.pk(competitorId),
          ":prefix": SK_PREFIX.event,
        },
        ScanIndexForward: false,
        Limit: eventLimit,
      }),
    ),
  ]);

  const metaItem = items(metaRes)[0];
  return {
    competitor: metaItem ? toCompetitorCard(metaItem) : null,
    recentEvents: items(eventRes).map(toFeedEvent),
  };
}

/** All monitored URLs for a competitor (detail page). */
export async function getCompetitorUrls(competitorId: string): Promise<MonitoredUrlCard[]> {
  const res = await db.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": Keys.monitoredUrl.pk(competitorId),
        ":prefix": SK_PREFIX.url,
      },
    }),
  );
  return items(res).map(toMonitoredUrlCard);
}

/** AP4 — global workspace feed via GSI1, newest-first, cursor-paginated. */
export async function getWorkspaceFeed(
  workspaceId: string,
  limit = 100,
  before?: string,
): Promise<{ events: FeedEvent[]; nextCursor: string | null }> {
  const capped = Math.min(Math.max(limit, 1), 200);

  const keyCondition = before
    ? "GSI1PK = :pk AND GSI1SK < :cursor"
    : "GSI1PK = :pk AND begins_with(GSI1SK, :prefix)";

  const values: Record<string, string> = before
    ? { ":pk": Keys.event.gsi1pk(workspaceId), ":cursor": Keys.event.gsi1sk(before) }
    : { ":pk": Keys.event.gsi1pk(workspaceId), ":prefix": GSI_PREFIX.event };

  const res = await db.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: GSI1,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: values,
      ScanIndexForward: false,
      Limit: capped,
    }),
  );

  const events = items(res).map(toFeedEvent);
  const nextCursor =
    events.length === capped && events.length > 0 ? events[events.length - 1].detectedAt : null;

  return { events, nextCursor };
}

/** AP8 — events filtered by signal type via GSI3, newest-first. */
export async function getEventsBySignalType(
  workspaceId: string,
  signalType: SignalType,
  limit = 50,
): Promise<FeedEvent[]> {
  const capped = Math.min(Math.max(limit, 1), 200);
  const res = await db.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: GSI3,
      KeyConditionExpression: "GSI3PK = :pk AND begins_with(GSI3SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": Keys.event.gsi3pk(workspaceId),
        ":prefix": `${GSI_PREFIX.signal}${signalType}#`,
      },
      ScanIndexForward: false,
      Limit: capped,
    }),
  );
  return items(res).map(toFeedEvent);
}

/** Latest snapshot for a URL (pipeline reads this before diffing). */
export async function getLatestSnapshot(urlId: string): Promise<Snapshot | null> {
  const res = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: Keys.snapshot.pk(urlId), SK: Keys.snapshot.sk() },
    }),
  );
  return res.Item ? toSnapshot(res.Item as Item) : null;
}

/** Worker scheduling query — URLs due for a check, via GSI2 (PRD §7.2). */
export async function getDueUrls(now: string, limit = 100): Promise<MonitoredUrl[]> {
  const res = await db.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: GSI2,
      KeyConditionExpression: "GSI2PK = :pk AND GSI2SK <= :now",
      ExpressionAttributeValues: {
        ":pk": STATUS_ACTIVE_GSI2PK,
        ":now": Keys.monitoredUrl.gsi2sk(now),
      },
      ScanIndexForward: true,
      Limit: limit,
    }),
  );
  return items(res).map(toMonitoredUrl);
}

// ─────────────────────────────────────────────
// Write access patterns
// ─────────────────────────────────────────────

/** Create a COMPETITOR item; bumps workspace competitorCount atomically. */
export async function createCompetitor(
  workspaceId: string,
  data: CreateCompetitorData,
): Promise<CompetitorCard> {
  const competitorId = randomUUID();
  const now = new Date().toISOString();

  const card: CompetitorCard = {
    competitorId,
    workspaceId,
    name: data.name,
    domain: data.domain,
    velocityScore: 0,
    lastEventAt: null,
    createdAt: now,
  };

  await db.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE,
            Item: {
              PK: Keys.competitor.pk(workspaceId),
              SK: Keys.competitor.sk(competitorId),
              GSI1PK: Keys.competitor.gsi1pk(competitorId),
              GSI1SK: Keys.competitor.gsi1sk(),
              entityType: ENTITY.COMPETITOR,
              competitorId,
              workspaceId,
              name: data.name,
              domain: data.domain,
              velocityScore: 0,
              lastEventAt: null,
              createdAt: now,
              updatedAt: now,
            },
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },
        {
          Update: {
            TableName: TABLE,
            Key: { PK: Keys.workspace.pk(workspaceId), SK: Keys.workspace.sk() },
            UpdateExpression: "ADD competitorCount :one SET updatedAt = :now",
            ExpressionAttributeValues: { ":one": 1, ":now": now },
          },
        },
      ],
    }),
  );

  return card;
}

/** Create a MONITORED_URL item; nextCheckAt=now so the worker picks it up immediately. */
export async function createMonitoredUrl(
  competitorId: string,
  data: CreateMonitoredUrlData,
): Promise<MonitoredUrlCard> {
  const urlId = randomUUID();
  const now = new Date().toISOString();

  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: Keys.monitoredUrl.pk(competitorId),
        SK: Keys.monitoredUrl.sk(urlId),
        GSI1PK: Keys.monitoredUrl.gsi1pk(urlId),
        GSI1SK: Keys.monitoredUrl.gsi1sk(),
        GSI2PK: Keys.monitoredUrl.gsi2pk(),
        GSI2SK: Keys.monitoredUrl.gsi2sk(now),
        entityType: ENTITY.MONITORED_URL,
        urlId,
        competitorId,
        workspaceId: data.workspaceId,
        competitorName: data.competitorName,
        url: data.url,
        urlType: data.urlType,
        checkIntervalMinutes: data.checkIntervalMinutes,
        status: "ACTIVE",
        nextCheckAt: now,
        lastCheckedAt: null,
        createdAt: now,
        updatedAt: now,
      },
      ConditionExpression: "attribute_not_exists(PK)",
    }),
  );

  return {
    urlId,
    competitorId,
    url: data.url,
    urlType: data.urlType,
    checkIntervalMinutes: data.checkIntervalMinutes,
    status: "ACTIVE",
    lastCheckedAt: null,
    nextCheckAt: now,
  };
}

/**
 * Delete a competitor + all its MonitoredURL and Snapshot items.
 * Events are retained (immutable audit trail — PRD §8). Decrements workspace count.
 */
export async function deleteCompetitor(competitorId: string): Promise<void> {
  // Resolve the competitor META item (carries workspaceId + base PK/SK) via GSI1.
  const metaRes = await db.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: GSI1,
      KeyConditionExpression: "GSI1PK = :pk AND GSI1SK = :sk",
      ExpressionAttributeValues: {
        ":pk": Keys.competitor.gsi1pk(competitorId),
        ":sk": Keys.competitor.gsi1sk(),
      },
      Limit: 1,
    }),
  );
  const meta = items(metaRes)[0];
  if (!meta) return;
  const workspaceId = asString(meta.workspaceId);

  // All URL items for this competitor.
  const urlsRes = await db.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": Keys.monitoredUrl.pk(competitorId),
        ":prefix": SK_PREFIX.url,
      },
    }),
  );
  const urlItems = items(urlsRes);

  const deleteRequests = [
    { DeleteRequest: { Key: { PK: asString(meta.PK), SK: asString(meta.SK) } } },
    ...urlItems.flatMap((u) => {
      const urlId = asString(u.urlId);
      return [
        { DeleteRequest: { Key: { PK: asString(u.PK), SK: asString(u.SK) } } },
        { DeleteRequest: { Key: { PK: Keys.snapshot.pk(urlId), SK: Keys.snapshot.sk() } } },
      ];
    }),
  ];

  // BatchWrite allows max 25 items per request.
  for (let i = 0; i < deleteRequests.length; i += 25) {
    await db.send(
      new BatchWriteCommand({
        RequestItems: { [TABLE]: deleteRequests.slice(i, i + 25) },
      }),
    );
  }

  if (workspaceId) {
    await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: Keys.workspace.pk(workspaceId), SK: Keys.workspace.sk() },
        UpdateExpression: "ADD competitorCount :dec SET updatedAt = :now",
        ExpressionAttributeValues: { ":dec": -1, ":now": new Date().toISOString() },
      }),
    );
  }
}

/**
 * Conditional snapshot write (PRD §7.3).
 * Writes only when no snapshot exists OR the content hash changed.
 * Returns true if the snapshot was written (content is new), false otherwise.
 */
export async function putSnapshotConditional(
  urlId: string,
  newHash: string,
  content: string,
): Promise<boolean> {
  try {
    await db.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: Keys.snapshot.pk(urlId),
          SK: Keys.snapshot.sk(),
          entityType: ENTITY.SNAPSHOT,
          urlId,
          contentHash: newHash,
          content,
          capturedAt: new Date().toISOString(),
        },
        ConditionExpression: "attribute_not_exists(PK) OR contentHash <> :newHash",
        ExpressionAttributeValues: { ":newHash": newHash },
      }),
    );
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === "ConditionalCheckFailedException") {
      return false;
    }
    throw err;
  }
}

/**
 * Write an event and atomically bump the competitor's velocityScore (PRD §7.4).
 * Returns the persisted FeedEvent.
 */
export async function writeEventAndBumpVelocity(input: WriteEventInput): Promise<FeedEvent> {
  const eventId = randomUUID();
  const detectedAt = new Date().toISOString();

  const event: FeedEvent = {
    eventId,
    competitorId: input.competitorId,
    competitorName: input.competitorName,
    workspaceId: input.workspaceId,
    urlId: input.urlId,
    urlType: input.urlType,
    signalType: input.signalType,
    importanceScore: input.importanceScore,
    summary: input.summary,
    diffAdded: input.diffAdded,
    diffRemoved: input.diffRemoved,
    detectedAt,
    userTag: null,
  };

  await db.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE,
            Item: {
              PK: Keys.event.pk(input.competitorId),
              SK: Keys.event.sk(detectedAt, eventId),
              GSI1PK: Keys.event.gsi1pk(input.workspaceId),
              GSI1SK: Keys.event.gsi1sk(detectedAt),
              GSI3PK: Keys.event.gsi3pk(input.workspaceId),
              GSI3SK: Keys.event.gsi3sk(input.signalType, detectedAt),
              entityType: ENTITY.EVENT,
              ...event,
            },
          },
        },
        {
          Update: {
            TableName: TABLE,
            Key: {
              PK: Keys.competitor.pk(input.workspaceId),
              SK: Keys.competitor.sk(input.competitorId),
            },
            UpdateExpression: "ADD velocityScore :inc SET lastEventAt = :at, updatedAt = :at",
            ExpressionAttributeValues: { ":inc": 1, ":at": detectedAt },
          },
        },
      ],
    }),
  );

  return event;
}

/** Reschedule a URL after a successful check cycle. */
export async function rescheduleUrl(
  competitorId: string,
  urlId: string,
  nextCheckAt: string,
  checkedAt: string,
): Promise<void> {
  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: Keys.monitoredUrl.pk(competitorId), SK: Keys.monitoredUrl.sk(urlId) },
      UpdateExpression:
        "SET GSI2SK = :gsi2sk, nextCheckAt = :next, lastCheckedAt = :checked, updatedAt = :checked",
      ExpressionAttributeValues: {
        ":gsi2sk": Keys.monitoredUrl.gsi2sk(nextCheckAt),
        ":next": nextCheckAt,
        ":checked": checkedAt,
      },
    }),
  );
}

/**
 * Mark a URL BLOCKED and remove it from the GSI2 scheduling index so the
 * worker stops checking it (PRD §14 — bot block / 403).
 */
export async function markUrlBlocked(competitorId: string, urlId: string): Promise<void> {
  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: Keys.monitoredUrl.pk(competitorId), SK: Keys.monitoredUrl.sk(urlId) },
      UpdateExpression:
        "SET #status = :blocked, updatedAt = :now REMOVE GSI2PK, GSI2SK",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":blocked": "BLOCKED", ":now": new Date().toISOString() },
    }),
  );
}

/** Apply (or clear) a user tag on an event. */
export async function tagEvent(
  competitorId: string,
  eventSk: string,
  tag: string | null,
): Promise<FeedEvent | null> {
  const res = await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: Keys.event.pk(competitorId), SK: eventSk },
      UpdateExpression: "SET userTag = :tag",
      ExpressionAttributeValues: { ":tag": tag },
      ConditionExpression: "attribute_exists(PK)",
      ReturnValues: "ALL_NEW",
    }),
  );
  return res.Attributes ? toFeedEvent(res.Attributes as Item) : null;
}

// ─────────────────────────────────────────────
// Worker health (SYSTEM item)
// ─────────────────────────────────────────────
export async function updateSystemLastCycle(
  lastCycleAt: string,
  workerVersion: string,
): Promise<void> {
  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        PK: Keys.system.pk(),
        SK: Keys.system.sk(),
        entityType: ENTITY.SYSTEM,
        workerVersion,
        lastCycleAt,
      },
    }),
  );
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const res = await db.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: Keys.system.pk(), SK: Keys.system.sk() },
    }),
  );
  const item = res.Item as Item | undefined;
  return {
    workerVersion: asString(item?.workerVersion, "unknown"),
    lastCycleAt: item ? asNullableString(item.lastCycleAt) : null,
  };
}
