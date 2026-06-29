import type { SignalType } from "@/types";

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const SIGNAL_COLOR: Record<SignalType, string> = {
  PRICING_INCREASE: "var(--signal-pricing-up)",
  PRICING_DECREASE: "var(--signal-pricing-down)",
  NEW_FEATURE_LAUNCHED: "var(--signal-feature)",
  ENTERPRISE_TIER_ADDED: "var(--signal-enterprise)",
  FREE_TIER_REMOVED: "var(--signal-pricing-up)",
  SALES_HIRING_SPIKE: "var(--signal-hiring)",
  ENGINEERING_HIRING_SPIKE: "var(--signal-hiring)",
  MESSAGING_PIVOT: "var(--signal-messaging)",
  NEW_INTEGRATION_ADDED: "var(--signal-feature)",
  PRODUCT_DISCONTINUATION: "var(--signal-messaging)",
  UNKNOWN_CHANGE: "var(--signal-unknown)",
};

export const SIGNAL_LABEL: Record<SignalType, string> = {
  PRICING_INCREASE: "Pricing ↑",
  PRICING_DECREASE: "Pricing ↓",
  NEW_FEATURE_LAUNCHED: "New Feature",
  ENTERPRISE_TIER_ADDED: "Enterprise",
  FREE_TIER_REMOVED: "Free Tier",
  SALES_HIRING_SPIKE: "Sales Hiring",
  ENGINEERING_HIRING_SPIKE: "Eng Hiring",
  MESSAGING_PIVOT: "Messaging",
  NEW_INTEGRATION_ADDED: "Integration",
  PRODUCT_DISCONTINUATION: "Discontinued",
  UNKNOWN_CHANGE: "Unknown",
};

export type FilterGroup = "ALL" | "PRICING" | "FEATURES" | "HIRING" | "MESSAGING" | "OTHER";

export const FILTER_GROUPS: { key: FilterGroup; label: string; types: SignalType[] }[] = [
  { key: "ALL", label: "All", types: [] },
  {
    key: "PRICING",
    label: "Pricing",
    types: ["PRICING_INCREASE", "PRICING_DECREASE", "ENTERPRISE_TIER_ADDED", "FREE_TIER_REMOVED"],
  },
  {
    key: "FEATURES",
    label: "Features",
    types: ["NEW_FEATURE_LAUNCHED", "NEW_INTEGRATION_ADDED", "PRODUCT_DISCONTINUATION"],
  },
  {
    key: "HIRING",
    label: "Hiring",
    types: ["SALES_HIRING_SPIKE", "ENGINEERING_HIRING_SPIKE"],
  },
  { key: "MESSAGING", label: "Messaging", types: ["MESSAGING_PIVOT"] },
  { key: "OTHER", label: "Other", types: ["UNKNOWN_CHANGE"] },
];

export function importanceColor(score: number): string {
  if (score <= 3) return "var(--importance-low)";
  if (score <= 6) return "var(--importance-mid)";
  return "var(--importance-high)";
}
