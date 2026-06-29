/**
 * Flanke — HTTP fetcher with retry + bot detection. LOCKED (PRD §6, §14).
 * Uses Node.js 22 native fetch — no external HTTP libraries.
 */

const MAX_RETRIES = 3;
const TIMEOUT_MS = 10_000;
const BASE_BACKOFF_MS = 500;

/** Realistic desktop Chrome UA — reduces naive bot blocking. */
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/** Thrown when a page actively blocks scraping (403 / bot wall). Not retried. */
export class BotBlockError extends Error {
  readonly status: number;
  constructor(url: string, status: number) {
    super(`Bot block detected fetching ${url} (status ${status})`);
    this.name = "BotBlockError";
    this.status = status;
  }
}

/** Thrown after all retries are exhausted (timeouts / 5xx / network). */
export class FetchFailedError extends Error {
  constructor(url: string, cause: string) {
    super(`TIMEOUT_AFTER_RETRIES: ${url} — ${cause}`);
    this.name = "FetchFailedError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOnce(url: string): Promise<{ html: string; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    // 403 / 429 are treated as active blocking — do not retry.
    if (res.status === 403 || res.status === 429) {
      throw new BotBlockError(url, res.status);
    }

    const html = await res.text();
    return { html, status: res.status };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch a URL with exponential backoff (3 retries, 10s timeout per attempt).
 * Throws BotBlockError on 403/429 (caller marks URL BLOCKED), FetchFailedError otherwise.
 */
export async function fetchUrl(url: string): Promise<{ html: string; status: number }> {
  let lastError = "unknown error";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await fetchOnce(url);
      // Retry transient server errors; succeed on anything else.
      if (result.status >= 500) {
        lastError = `HTTP ${result.status}`;
      } else {
        return result;
      }
    } catch (err) {
      if (err instanceof BotBlockError) throw err;
      lastError = err instanceof Error ? err.message : String(err);
    }

    if (attempt < MAX_RETRIES - 1) {
      await sleep(BASE_BACKOFF_MS * 2 ** attempt);
    }
  }

  throw new FetchFailedError(url, lastError);
}
