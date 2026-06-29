/**
 * Flanke — HTML content stripper. LOCKED (PRD §6, §14).
 *
 * Removes non-content tags and 7 classes of dynamic noise that would
 * otherwise produce false-positive diffs. Output is normalized visible text.
 */

import { parse } from "node-html-parser";

/** Minimum changed words before a diff is considered significant (PRD §14). */
export const MIN_SIGNIFICANT_WORD_CHANGE = 3;

/** Tags removed entirely — they carry no comparable page content. */
const STRIP_TAGS = ["script", "style", "noscript", "iframe", "svg"];

/** Selectors for cookie / consent / ad / analytics containers (dynamic patterns 2,3). */
const NOISE_SELECTORS = [
  '[id*="cookie" i]',
  '[class*="cookie" i]',
  '[id*="consent" i]',
  '[class*="consent" i]',
  '[id*="gdpr" i]',
  '[class*="gdpr" i]',
  '[id*="ad-" i]',
  '[class*="ad-" i]',
  '[class*="advert" i]',
  '[id*="advert" i]',
  '[class*="banner" i]',
];

/**
 * Seven dynamic text patterns scrubbed from the extracted text so that
 * volatile values never register as content changes (PRD §14).
 */
const DYNAMIC_TEXT_PATTERNS: RegExp[] = [
  // 1. ISO timestamps + common date/time strings
  /\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?\b/gi,
  /\b\d{1,2}:\d{2}(:\d{2})?\s?(am|pm)?\b/gi,
  // 4. session tokens
  /\bsession[_-]?(id|token)?[=:]\s*[A-Za-z0-9._-]{8,}\b/gi,
  // 5. CSRF tokens
  /\b(csrf|xsrf)[_-]?token[=:]\s*[A-Za-z0-9._-]{8,}\b/gi,
  // 6. random IDs — UUIDs and long hex blobs
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
  /\b[0-9a-f]{24,}\b/gi,
  // 7. analytics pixel / tracking query strings left inline in text
  /\b(utm_[a-z]+|gclid|fbclid)=[^\s&]+/gi,
];

/**
 * Strip all dynamic noise from raw HTML and return normalized visible text.
 */
export function stripDynamic(html: string): string {
  const root = parse(html, {
    comment: false,
    blockTextElements: { script: false, style: false, noscript: false },
  });

  // Remove non-content tags entirely.
  for (const tag of STRIP_TAGS) {
    for (const el of root.querySelectorAll(tag)) {
      el.remove();
    }
  }

  // 2 & 3 — remove cookie/consent/ad/analytics containers.
  for (const selector of NOISE_SELECTORS) {
    try {
      for (const el of root.querySelectorAll(selector)) {
        el.remove();
      }
    } catch {
      // node-html-parser may not support every attribute selector; ignore.
    }
  }

  // 7 — drop analytics/tracking pixel images.
  for (const img of root.querySelectorAll("img")) {
    const src = (img.getAttribute("src") ?? "").toLowerCase();
    if (/(pixel|analytics|track|beacon|collect|\.gif\?)/.test(src)) {
      img.remove();
    }
  }

  // Extract visible text, then scrub dynamic text patterns.
  let text = root.structuredText ?? root.text ?? "";
  for (const pattern of DYNAMIC_TEXT_PATTERNS) {
    text = text.replace(pattern, "");
  }

  // Normalize whitespace: collapse runs, trim lines, drop empties.
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");
}
