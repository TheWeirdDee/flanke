/**
 * Flanke — DynamoDB key builders. LOCKED (PRD §6, §7).
 * Pure string builders only — no AWS SDK imports.
 *
 * Key patterns match PRD §7 exactly:
 *
 * | Entity        | PK                  | SK                     | GSI1PK            | GSI1SK        | GSI2PK         | GSI2SK              | GSI3PK            | GSI3SK                 |
 * | Workspace     | WORKSPACE#<id>      | META                   | —                 | —             | —              | —                   | —                 | —                      |
 * | Competitor    | WORKSPACE#<wId>     | COMPETITOR#<id>        | COMPETITOR#<id>   | META          | —              | —                   | —                 | —                      |
 * | MonitoredURL  | COMPETITOR#<id>     | URL#<urlId>            | URL#<urlId>       | META          | STATUS#ACTIVE  | NEXT_CHECK#<iso>    | —                 | —                      |
 * | Snapshot      | URL#<urlId>         | SNAPSHOT#LATEST        | —                 | —             | —              | —                   | —                 | —                      |
 * | Event         | COMPETITOR#<id>     | EVENT#<iso>#<uuid>     | WORKSPACE#<wId>   | EVENT#<iso>   | —              | —                   | WORKSPACE#<wId>   | SIGNAL#<type>#<iso>    |
 * | UserMembership| USER#<userId>       | MEMBER#<wId>           | WORKSPACE#<wId>   | USER#<userId> | —              | —                   | —                 | —                      |
 */

import { SIGNAL_TYPES } from "@/types";

export { SIGNAL_TYPES };

/** Sort-key prefixes for begins_with queries. */
export const SK_PREFIX = {
  competitor: "COMPETITOR#",
  url: "URL#",
  event: "EVENT#",
  member: "MEMBER#",
} as const;

/** GSI sort-key prefixes. */
export const GSI_PREFIX = {
  event: "EVENT#",
  nextCheck: "NEXT_CHECK#",
  signal: "SIGNAL#",
} as const;

/** Entity discriminators stored on every item as `entityType`. */
export const ENTITY = {
  WORKSPACE: "WORKSPACE",
  COMPETITOR: "COMPETITOR",
  MONITORED_URL: "MONITORED_URL",
  SNAPSHOT: "SNAPSHOT",
  EVENT: "EVENT",
  USER_MEMBERSHIP: "USER_MEMBERSHIP",
  SYSTEM: "SYSTEM",
} as const;

/** Active-URL scheduling partition value (GSI2PK). */
export const STATUS_ACTIVE_GSI2PK = "STATUS#ACTIVE";

export const Keys = {
  workspace: {
    pk: (id: string): string => `WORKSPACE#${id}`,
    sk: (): string => "META",
  },

  competitor: {
    pk: (workspaceId: string): string => `WORKSPACE#${workspaceId}`,
    sk: (id: string): string => `COMPETITOR#${id}`,
    gsi1pk: (id: string): string => `COMPETITOR#${id}`,
    gsi1sk: (): string => "META",
  },

  monitoredUrl: {
    pk: (competitorId: string): string => `COMPETITOR#${competitorId}`,
    sk: (urlId: string): string => `URL#${urlId}`,
    gsi1pk: (urlId: string): string => `URL#${urlId}`,
    gsi1sk: (): string => "META",
    gsi2pk: (): string => STATUS_ACTIVE_GSI2PK,
    gsi2sk: (iso: string): string => `NEXT_CHECK#${iso}`,
  },

  snapshot: {
    pk: (urlId: string): string => `URL#${urlId}`,
    sk: (): string => "SNAPSHOT#LATEST",
  },

  event: {
    pk: (competitorId: string): string => `COMPETITOR#${competitorId}`,
    sk: (iso: string, uuid: string): string => `EVENT#${iso}#${uuid}`,
    gsi1pk: (workspaceId: string): string => `WORKSPACE#${workspaceId}`,
    gsi1sk: (iso: string): string => `EVENT#${iso}`,
    gsi3pk: (workspaceId: string): string => `WORKSPACE#${workspaceId}`,
    gsi3sk: (signalType: string, iso: string): string => `SIGNAL#${signalType}#${iso}`,
  },

  userMembership: {
    pk: (userId: string): string => `USER#${userId}`,
    sk: (workspaceId: string): string => `MEMBER#${workspaceId}`,
    gsi1pk: (workspaceId: string): string => `WORKSPACE#${workspaceId}`,
    gsi1sk: (userId: string): string => `USER#${userId}`,
  },

  /** Singleton worker-health record (not in PRD §7 table; operational only). */
  system: {
    pk: (): string => "SYSTEM",
    sk: (): string => "WORKER#STATUS",
  },
} as const;

/** Table/GSI names — single source of truth for create-table + DAL. */
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? "flanke";
export const GSI1 = "GSI1";
export const GSI2 = "GSI2";
export const GSI3 = "GSI3";

/** GSI2 INCLUDE projection — 7 non-key attributes (PRD §7 decision 2). */
export const GSI2_INCLUDE_ATTRS = [
  "urlId",
  "competitorId",
  "workspaceId",
  "competitorName",
  "url",
  "urlType",
  "checkIntervalMinutes",
] as const;
