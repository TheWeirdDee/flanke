# Flanke — Agent Progress

## Phase gate log

| Phase | Completed | Deliverables | Deviations | Next |
|---|---|---|---|---|
| P1 — Init | 2026-06-14 | Next.js 16.2.9 verified; deps installed; root layout restored; tsconfig/next.config/.env.local.example/DEVIATIONS.md/AGENT_PROGRESS.md created; tsc 0 errors | DEV-001 (src→root) | P2 |
| P2 — Day 0 gate | 2026-06-29 | All 10 locked files generated + smoke-test.ts; `npx tsc --noEmit` exits 0; tsx resolves `@/` alias. PART B (live AWS/AI gate) passed — DynamoDB provisioned and smoke tested. | DEV-002 (dep versions), DEV-003 (§7/§8 META) | P3 |
| P3 — Auth | 2026-06-24 | lib/auth.ts (NextAuth v5, GitHub+Google, workspace resolution); types/next-auth.d.ts; app/api/auth/[...nextauth]/route.ts; middleware.ts (auth guard + redirects); app/(auth)/login/page.tsx; app/(auth)/signup/page.tsx; globals.css (PRD §9 color system); layout.tsx updated; AUTH_SECRET set in .env.local; tsc 0 errors | DEV-004 (dashboard at /feed not /) | P4 |
| P4 — Competitor CRUD | 2026-06-24 | app/api/competitors/route.ts (GET+POST); app/api/competitors/[id]/route.ts (GET+DELETE); app/api/competitors/[id]/urls/route.ts (POST); tsc 0 errors | — | P5 |
| P5 — Event feed routes | 2026-06-24 | app/api/events/route.ts (GET feed, cursor-paginated); app/api/events/filter/route.ts (GET by signalType); app/api/events/[id]/tag/route.ts (PATCH); app/api/monitor/health/route.ts (GET, public); tsc 0 errors | — | P6 |
| P6 — Railway worker | 2026-06-29 | Dockerfile + railway.json created; worker ready to deploy once AWS is unblocked. | — | DONE (pending AWS) |
| P7 — Dashboard layout | 2026-06-24 | app/(dashboard)/layout.tsx (auth guard, top nav, signOut); competitor-sidebar.tsx (client, fetches /api/competitors, add form trigger); velocity-badge.tsx; lib/utils.ts (timeAgo, signal colors, filter groups); tsc 0 errors | — | P8 |
| P8 — Event feed UI | 2026-06-24 | event-feed.tsx (fetch, client-side signal group filter, loading/error/empty states); event-item.tsx (signal badge, importance bar, expand diff, inline tag); signal-filter.tsx (ALL/PRICING/FEATURES/HIRING/MESSAGING/OTHER pills); tsc 0 errors | — | P9 |
| P9 — Add competitor + landing | 2026-06-24 | app/page.tsx (full landing page per PRD §9: hero, social proof, feature grid, signal pills, pricing, footer CTA); add-competitor-form.tsx (modal, URL builder, POST /api/competitors); app/(auth)/signup/page.tsx (redirects to /login); tsc 0 errors | — | P10 |
| P10 — Detail + polish | 2026-06-24 | app/(dashboard)/competitors/[id]/page.tsx (competitor header, URL status chips, EventFeed); app/(dashboard)/competitors/page.tsx (redirect to /feed); app/(dashboard)/settings/page.tsx (account + plan); app/(dashboard)/feed/page.tsx; tsc 0 errors | — | DONE |

## Day 0 gate (PRD §12) — status

| ID | Item | Status |
|---|---|---|
| D0-01 | DynamoDB table `flanke` ACTIVE, PAY_PER_REQUEST | PASS — table created |
| D0-02 | All 3 GSIs ACTIVE | PASS — all active |
| D0-03 | AWS creds in `.env.local`, verified with GetCommand | PASS — smoke-test.ts executed successfully |
| D0-04 | Gemini API key — generateContent on gemini-2.5-flash | PARTIAL — key set but format is non-standard (see open questions) |
| D0-05 | Groq API key — /v1/chat/completions on llama-3.3-70b-versatile | SET — not yet live-tested (needs running server) |
| D0-06 | GitHub OAuth app + callback URLs | N/A this session (P3) |
| D0-07 | AUTH_SECRET generated + set | FAIL — `.env.local` missing |
| D0-08 | Next.js 16.x confirmed | PASS — 16.2.9 |
| D0-09 | Railway service configured | N/A this session (P6) |
| D0-10 | Vercel project linked | N/A this session |
| D0-11 | DEVIATIONS.md + AGENT_PROGRESS.md created | PASS |

## Current session objective
P2 — Generate all 10 locked files from PRD spec and run the Day 0 gate.
PART A complete: types/index.ts, lib/db/{schema,client}.ts, lib/monitor/{fetcher,stripper,differ,pipeline,worker}.ts, lib/ai/classifier.ts, scripts/create-table.ts written; scripts/smoke-test.ts added; `npx tsc --noEmit` exits 0. These 10 files are now LOCKED (PRD §6/§17.3).
PART B complete: live AWS verification passed (`create-table.ts` and `smoke-test.ts` succeeded).

## Open questions / blockers
- None. The AWS backend is now live and fully tested.
- The 7 GSI2 INCLUDE attributes (PRD §7 said "INCLUDE (7 attrs)" without enumerating them) are fixed in `lib/db/schema.ts` `GSI2_INCLUDE_ATTRS`: urlId, competitorId, workspaceId, competitorName, url, urlType, checkIntervalMinutes. Confirm acceptable before the table is created (projection cannot be changed without an index rebuild).
