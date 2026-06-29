/**
 * Flanke — application-level type contracts.
 * LOCKED (PRD §6). Types and constants only — no runtime logic.
 */

// ─────────────────────────────────────────────
// Signal taxonomy (PRD §7 — 11 exhaustive values)
// ─────────────────────────────────────────────
export const SIGNAL_TYPES = [
  "PRICING_INCREASE",
  "PRICING_DECREASE",
  "NEW_FEATURE_LAUNCHED",
  "ENTERPRISE_TIER_ADDED",
  "FREE_TIER_REMOVED",
  "SALES_HIRING_SPIKE",
  "ENGINEERING_HIRING_SPIKE",
  "MESSAGING_PIVOT",
  "NEW_INTEGRATION_ADDED",
  "PRODUCT_DISCONTINUATION",
  "UNKNOWN_CHANGE",
] as const;

export type SignalType = (typeof SIGNAL_TYPES)[number];

// ─────────────────────────────────────────────
// Enumerations
// ─────────────────────────────────────────────
export type UrlType = "PRICING" | "CHANGELOG" | "CAREERS" | "HOMEPAGE" | "CUSTOM";

export type UrlStatus = "ACTIVE" | "BLOCKED" | "ERROR";

export type UserRole = "OWNER" | "MEMBER";

export type Plan = "FREE" | "PRO";

// ─────────────────────────────────────────────
// Persisted entities
// ─────────────────────────────────────────────
export interface Workspace {
  workspaceId: string;
  name: string;
  slug: string;
  plan: Plan;
  competitorCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Competitor {
  competitorId: string;
  workspaceId: string;
  name: string;
  domain: string;
  velocityScore: number;
  lastEventAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * The monitoring-time shape of a URL — exactly the attributes the worker
 * needs to run a pipeline cycle. Mirrors the GSI2 INCLUDE projection (7 attrs)
 * from PRD §7 so a GSI2 query returns a complete, usable object.
 */
export interface MonitoredUrl {
  urlId: string;
  competitorId: string;
  workspaceId: string;
  competitorName: string;
  url: string;
  urlType: UrlType;
  checkIntervalMinutes: number;
}

export interface Snapshot {
  urlId: string;
  contentHash: string;
  content: string;
  capturedAt: string;
}

export interface UserMembership {
  userId: string;
  workspaceId: string;
  email: string;
  role: UserRole;
  joinedAt: string;
}

// ─────────────────────────────────────────────
// API / UI view models
// ─────────────────────────────────────────────
export interface CompetitorCard {
  competitorId: string;
  workspaceId: string;
  name: string;
  domain: string;
  velocityScore: number;
  lastEventAt: string | null;
  createdAt: string;
}

export interface MonitoredUrlCard {
  urlId: string;
  competitorId: string;
  url: string;
  urlType: UrlType;
  checkIntervalMinutes: number;
  status: UrlStatus;
  lastCheckedAt: string | null;
  nextCheckAt: string;
}

export interface FeedEvent {
  eventId: string;
  competitorId: string;
  competitorName: string;
  workspaceId: string;
  urlId: string;
  urlType: UrlType;
  signalType: SignalType;
  importanceScore: number;
  summary: string;
  diffAdded: string[];
  diffRemoved: string[];
  detectedAt: string;
  userTag: string | null;
}

// ─────────────────────────────────────────────
// AI classifier result
// ─────────────────────────────────────────────
export interface Classification {
  signalType: SignalType;
  importanceScore: number;
  summary: string;
}

// ─────────────────────────────────────────────
// Input shapes (DAL / API)
// ─────────────────────────────────────────────
export interface CreateUrlInput {
  url: string;
  urlType: UrlType;
  checkIntervalMinutes: number;
}

export interface CreateCompetitorData {
  name: string;
  domain: string;
}

export interface CreateMonitoredUrlData {
  workspaceId: string;
  competitorName: string;
  url: string;
  urlType: UrlType;
  checkIntervalMinutes: number;
}

export interface WriteEventInput {
  competitorId: string;
  workspaceId: string;
  competitorName: string;
  urlId: string;
  urlType: UrlType;
  signalType: SignalType;
  importanceScore: number;
  summary: string;
  diffAdded: string[];
  diffRemoved: string[];
}

export interface SystemStatus {
  workerVersion: string;
  lastCycleAt: string | null;
}
