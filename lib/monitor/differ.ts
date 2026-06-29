/**
 * Flanke — word-level diff engine. LOCKED (PRD §6).
 * Built on the `diff` package; reports added/removed lines + total word delta.
 */

import { diffWords } from "diff";

export interface ContentDiff {
  added: string[];
  removed: string[];
  wordChangeCount: number;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

/** Split a change value into non-empty trimmed lines. */
function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Word-level diff between two content snapshots.
 * Returns only the lines that were actually added or removed and the total
 * count of changed words (added + removed) used to gate significance.
 */
export function diffContent(before: string, after: string): ContentDiff {
  const parts = diffWords(before, after);

  const added: string[] = [];
  const removed: string[] = [];
  let wordChangeCount = 0;

  for (const part of parts) {
    if (part.added) {
      added.push(...toLines(part.value));
      wordChangeCount += countWords(part.value);
    } else if (part.removed) {
      removed.push(...toLines(part.value));
      wordChangeCount += countWords(part.value);
    }
  }

  return { added, removed, wordChangeCount };
}
