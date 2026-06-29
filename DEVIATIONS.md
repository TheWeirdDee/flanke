# Flanke — Deviations from Master PRD

## Architectural Pivots

### DEV-001 — Scaffold corrected from `src/` layout to root layout
**Date:** 2026-06-14
**File:** app/, tsconfig.json
**PRD says:** §6 repository structure places `app/`, `lib/`, `types/`, `scripts/` at the repo root; P1 specifies `--src-dir=no` and import alias `@/*` → `./*`.
**Reality:** The existing scaffold (`create-next-app`) had been generated with a `src/` directory (`src/app/...`) and tsconfig alias `@/*` → `./src/*`. This is incompatible with the locked-file paths (`lib/db/schema.ts`, `types/index.ts`, etc.) which live at the repo root.
**Resolution:** Moved `src/app/*` to `app/` at the repo root, removed `src/`, and set the tsconfig path alias to `@/*` → `./*` to match the contract.
**Authorised by:** ARCHITECTURAL_PIVOT (restores PRD §6 layout)

### DEV-003 — Competitor META resolved via GSI1, not base `PK=COMPETITOR#<id>`
**Date:** 2026-06-14
**File:** lib/db/client.ts (getCompetitorWithEvents, deleteCompetitor)
**PRD says:** §8 (`GET /api/competitors/[id]`) describes "query `PK=COMPETITOR#<id>` for all SK types (META + URL#* + EVENT#*)".
**Reality:** §7 — the declared source of truth — stores the Competitor item at `PK=WORKSPACE#<wId>` / `SK=COMPETITOR#<id>`, with `GSI1PK=COMPETITOR#<id>` / `GSI1SK=META`. The competitor META is therefore NOT under base `PK=COMPETITOR#<id>` (that partition holds only URL# and EVENT# items).
**Resolution:** Followed §7 (source of truth per PRD §17.2). META is fetched via a GSI1 query (`GSI1PK=COMPETITOR#<id>, GSI1SK=META`); URLs/events are queried on the base partition separately. Net access pattern is equivalent; only the §8 prose is slightly inaccurate.
**Authorised by:** ARCHITECTURAL_PIVOT (resolves an internal PRD §7/§8 inconsistency in favour of §7)

## Doc-Verification Drift

### DEV-002 — Installed dependency versions newer than §5 pins
**Date:** 2026-06-14
**File:** package.json
**PRD says:** §5 pins `diff@7.0.0`, `node-html-parser@6.1.13`, `@google/generative-ai@0.21.0`, `dotenv@16.x`.
**Reality:** P1/P2 install lists were unpinned, so npm resolved latest majors: `diff@^9.0.0`, `node-html-parser@^7.1.0`, `@google/generative-ai@^0.24.1`, `dotenv@^17.4.2`. APIs used (`diffWords`, `parse`/`querySelectorAll`/`structuredText`, `GoogleGenerativeAI`, `dotenv/config`) are compatible across these majors and `tsc --noEmit` passes.
**Resolution:** Left as installed; flagged for awareness. Pin to exact §5 versions on request.
**Authorised by:** DOC_DRIFT

### DEV-004 — Dashboard root route moved from `/` to `/feed`
**Date:** 2026-06-24
**File:** app/(dashboard)/, middleware.ts
**PRD says:** §6 places `app/(dashboard)/page.tsx` (global event feed) at URL `/` via a route group.
**Reality:** `app/page.tsx` (landing page, unauthenticated) also resolves to `/`. Next.js does not allow two pages at the same URL — one would silently shadow the other. The PRD's intent is clearly that `/` shows the landing page to unauthenticated users and the feed to authenticated users, but this requires two separate routes.
**Resolution:** Dashboard default route is `/feed` (`app/(dashboard)/feed/page.tsx`). After sign-in, users are redirected to `/feed`. Middleware redirects authenticated users away from `/login` and `/signup` to `/feed`. Landing page remains at `/`. All other route group structure (`/competitors`, `/settings`) is unchanged from §6.
**Authorised by:** ARCHITECTURAL_PIVOT (resolves Next.js route collision; no functional change to UX)

## Format for each entry
### DEV-NNN — [Short title]
**Date:** YYYY-MM-DD
**File:** path/to/file.ts
**PRD says:** [what the PRD documented]
**Reality:** [what is actually true]
**Resolution:** [what was done]
**Authorised by:** [ARCHITECTURAL_PIVOT | DOC_DRIFT]
