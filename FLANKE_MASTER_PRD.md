# Flanke — Master PRD
**Version:** 1.0.0  
**Status:** LOCKED — Jun 13, 2026  
**Hackathon:** H0: Hack the Zero Stack with Vercel v0 and AWS Databases  
**Track:** B2B — Monetizable B2B App  
**Deadline:** Jun 30, 2026 @ 01:00 WAT  
**Builder:** Tim (@winsznx)  
**Railway worker:** Persistent Node.js process (monitor daemon)  
**Frontend:** Vercel — Next.js 16.2 LTS  
**Database:** AWS DynamoDB (single-table, PAY_PER_REQUEST)  
**AI:** Gemini 2.5 Flash (primary) + Groq llama-3.3-70b (fallback)  

This document is the canonical contract between the product vision and every Claude Code build session. Claude Code reads this file at the start of every session. Deviations from this PRD are logged to DEVIATIONS.md. No mock data, no stubs, no demo modes anywhere in the codebase — everything is live and production-grade from day one.

---

## §1 — Product definition (WHAT / WHY / HOW)

### WHAT
Flanke is a real-time competitive intelligence workspace for B2B sales teams. It monitors competitor pricing pages, product changelogs, and careers pages on a continuous schedule, detects meaningful content changes, classifies each change into a named business signal using AI, and surfaces a structured event feed that tells a sales rep what changed, why it matters, and how important it is — before they walk into a deal.

### WHY
This product exists in 2026 and not 2020 for one reason: Amazon Aurora DSQL reached general availability in May 2025. Before that, building a globally consistent, multi-region competitive signal feed required either CockroachDB licensing or custom conflict-resolution code on top of DynamoDB Global Tables. Now it can be done inside the Vercel integration in an afternoon.

The market gap is documented and priced: Crayon and Klue start at $15,000–$40,000 per year and require dedicated implementation teams. Kompyte (now Semrush) is $300/year but is an SEO tool, not a sales intelligence tool. Between $300/year (wrong product) and $15,000/year (enterprise-only) there is no self-serve product built specifically for B2B sales teams in 2026. Flanke is that product. $49/workspace/month. No sales call. Sign up, paste a competitor URL, see changes in minutes.

The demand signal is real: a dev.to post published April 2026 describing a $12/month DIY Apify + n8n rig to track 50 competitors surfaced in organic search. That founder built something ugly because no clean product existed. Flanke is the clean product.

### HOW
DynamoDB single-table design with event-sourced access patterns. Every monitored page generates an immutable stream of change events stored as `PK=COMPETITOR#<id> SK=EVENT#<timestamp>#<uuid>`. This is the canonical DynamoDB access pattern — time-series, per-entity, never joined across entities, millisecond reads at arbitrary volume. No other database in the hackathon stack (Aurora PG, Aurora DSQL) is the correct answer for this workload. When judges with DynamoDB product backgrounds see this schema, they recognise their own product's canonical use case reflected back at them.

The AI layer (Gemini 2.5 Flash) classifies each detected change into one of 11 named signal types: PRICING_INCREASE, NEW_FEATURE_LAUNCHED, ENTERPRISE_TIER_ADDED, SALES_HIRING_SPIKE, MESSAGING_PIVOT, and six others. This is what separates Flanke from Visualping ($10.83/month, sends you "something changed") and from Crayon ($20K/year, requires an implementation team). Flanke gives a sales rep a one-sentence summary of what changed and why it matters, classified, scored 1–10, and queryable by signal type.

---

## §2 — Judging rubric alignment

| Criterion | Weight | How Flanke scores |
|---|---|---|
| Technical Implementation | 25% | Single-table DynamoDB schema with 3 GSIs, conditional writes for race-condition prevention, on-demand billing with deliberate GSI2 INCLUDE projection, word-level diff engine, dual-model AI fallback |
| Design | 25% | Data model dictates UI structure — competitor cards, event timeline, signal taxonomy, velocity score. Front-end is a direct expression of the DynamoDB schema |
| Impact & Real-World Applicability | 25% | Every B2B company with a competitor is the TAM. $49/month self-serve. Judges are B2B SaaS users who feel this pain personally |
| Originality | 25% | Market gap is documented ($300/yr wrong tool → $15K/yr enterprise gap). The insight is structural, not cosmetic |

**Bonus points (0.6 max):** 3 published content pieces on dev.to / builder.aws.com / LinkedIn covering DynamoDB event-sourcing pattern, Gemini classifier design, and the full build. 0.2 points each.

---

## §3 — Demo screenplay (Phase D — locked before code)

**Format:** Screen recording. Tim speaking to camera and screen simultaneously. Investor-pitch register. No slides. No script read aloud. Internalized and delivered.

**Duration:** 2 minutes 45 seconds. Under the 3-minute hard limit with 15 seconds of buffer.

### 0:00–0:18 — The problem (hook)
> "Your sales team walked into a deal last week. Your competitor had updated their pricing tier three days earlier — dropped their entry price by 30% and added a feature your rep thought you had exclusively. Nobody knew. You lost the deal."
> 
> [pause 1 second]
> 
> "That's not a sales problem. That's an intelligence problem. And every B2B company in the world has it."

### 0:18–0:28 — Product name + positioning
> "This is Flanke. Real-time competitive intelligence for sales teams who can't afford Crayon's $20,000 contract."

[Screen: Flanke dashboard — live, logged in, real data showing]

### 0:28–1:30 — Live demo (the hero moment)
> "I added three competitors this morning — Notion, Linear, and Loom. Flanke has been monitoring their pricing and changelog pages every hour."

[Click: competitor list — three cards visible, each showing velocity score and last event timestamp]

> "Here's what it found. Notion updated their pricing page two hours ago."

[Click: Notion card → event timeline — PRICING_INCREASE event at top, importance score 8/10]

> "Flanke detected the change, stripped out all the dynamic noise — timestamps, ads, cookie banners — and sent the actual content change to Gemini 2.5 Flash. Which classified it as a pricing increase, scored it an 8 out of 10, and wrote this summary:"

[Hover over event: summary card expands — "Notion raised the Plus plan from $8 to $10 per user per month, removing the annual discount for new signups."]

> "One sentence. Ready for a sales rep. No manual research. No spreadsheet. No Slack thread three weeks later."

[Click: filter by signal type — select PRICING_INCREASE — feed filters to show only pricing events across all competitors]

> "I can filter by signal type across every competitor. All pricing changes. All hiring spikes — which tell you which features they're building. All messaging pivots — which tell you they're feeling pressure."

### 1:30–2:05 — Architecture + DB justification (for the judges)
> "Under the hood: AWS DynamoDB, single-table design. Every change event is stored as PK equals competitor ID, SK equals event timestamp. That's the canonical DynamoDB access pattern — time-series, per-entity, never joined. I never need a cross-competitor query. I need millisecond reads on a per-competitor timeline at any volume. On-demand billing means I pay for what I monitor, not for spare capacity."

[Screen: briefly show AWS console — DynamoDB table visible, PAY_PER_REQUEST confirmed]

> "The monitor worker runs on Railway — persistent Node.js process, not a serverless cron — checking 100 URLs every 60 seconds. The AI classifier has a dual-model fallback: Gemini 2.5 Flash primary, Groq llama-3.3-70b if Gemini rate-limits. The event is never dropped."

### 2:05–2:30 — Business model + market
> "Who buys this? Any B2B company with a sales team and a competitor. That's every B2B company. Crayon starts at $15,000 a year and requires a dedicated implementation owner. Flanke is $49 a month. No sales call. Sign up, paste a URL, see changes in minutes."

> "The market gap is real and priced. I'm not competing with Crayon — I'm serving the ten thousand companies who can't afford Crayon."

### 2:30–2:45 — Close
> "Flanke. Know what your competitors are doing before your sales team walks into the room."

[Screen: Flanke dashboard — live feed, competitor cards, clean UI — hold for 10 seconds]

[End]

---

## §4 — Company & product identity

**Company name:** Flanke  
**Tagline:** Know your enemy's next move.  
**Domain target:** flanke.co (or flanke.app)  
**ICP:** B2B SaaS companies with 10–500 employees, active sales teams, 3–20 direct competitors, no dedicated competitive intelligence function  
**Pricing:** $49/workspace/month (up to 10 competitors, 50 monitored URLs). $99/month Pro (unlimited). Free tier: 2 competitors, 10 URLs, daily checks only  
**Revenue model:** SaaS subscription, self-serve, no sales motion  


---

## §5 — Tech stack (pinned versions — no exceptions)

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16.2.0 | LTS — `create-next-app@latest` as of Jun 2026. NOT 14, NOT 15 |
| Runtime | Node.js | 22.x LTS | Railway + Vercel both target this |
| Language | TypeScript | 5.5.x | strict mode, no `any` |
| React | React | 19.0.0 | Required by Next.js 16 |
| Auth | NextAuth (Auth.js) | v5.0.0-beta.31 | App Router native. NOT v4 |
| Database | AWS DynamoDB | SDK v3.1068.x | `@aws-sdk/client-dynamodb` + `@aws-sdk/lib-dynamodb` |
| AI primary | Google Gemini | `gemini-2.5-flash` | `@google/generative-ai@0.21.0` |
| AI fallback | Groq | `llama-3.3-70b-versatile` | OpenAI-compatible REST endpoint |
| HTML parser | node-html-parser | 6.1.13 | Content stripping |
| Diff | diff | 7.0.0 | `@types/diff` for types |
| Styling | Tailwind CSS | 4.x | Bundled with Next.js 16 |
| Worker host | Railway | persistent process | NOT Vercel cron — no Pro plan required |
| Frontend host | Vercel | Hobby | Required by hackathon rules |
| Env management | dotenv | 16.x | `.env.local` for local, Railway + Vercel env vars for production |

### Excluded technologies (do not use)
- `prisma` — DynamoDB is not relational; Prisma adds no value here
- `mongoose` — same reason
- Any ORM — raw SDK only; judges evaluate the schema design, not ORM magic
- `express` / `fastify` — Next.js API routes handle all HTTP
- `redis` — no caching layer needed; DynamoDB on-demand handles burst
- `next/font` with external font downloads — use system font stack for speed
- Vercel cron — no Pro plan; Railway worker handles scheduling

---

## §6 — Repository structure

```
flanke/
├── MASTER_PRD.md              ← this file (read by Claude Code every session)
├── DEVIATIONS.md              ← architectural pivots + doc-verification drift
├── AGENT_PROGRESS.md          ← updated at every phase boundary
├── package.json               ← pinned versions
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── .env.local.example
│
├── app/                       ← Next.js 16 App Router
│   ├── layout.tsx
│   ├── page.tsx               ← landing page (unauthenticated)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx         ← auth guard + workspace context
│   │   ├── page.tsx           ← global feed (AP4)
│   │   ├── competitors/
│   │   │   ├── page.tsx       ← competitor list (AP1)
│   │   │   ├── new/page.tsx   ← add competitor form
│   │   │   └── [id]/page.tsx  ← competitor detail + event timeline (AP2, AP3)
│   │   └── settings/page.tsx  ← workspace settings
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── competitors/
│       │   ├── route.ts       ← GET (list) + POST (create)
│       │   └── [id]/
│       │       ├── route.ts   ← GET (detail) + DELETE
│       │       └── urls/route.ts ← POST (add URL to competitor)
│       ├── events/
│       │   ├── route.ts       ← GET workspace feed (AP4)
│       │   └── filter/route.ts ← GET by signal type (AP8)
│       └── monitor/
│           └── health/route.ts ← worker health check endpoint
│
├── lib/
│   ├── db/
│   │   ├── schema.ts          ← LOCKED — key builders + item interfaces
│   │   └── client.ts          ← LOCKED — DynamoDB singleton + DAL functions
│   ├── monitor/
│   │   ├── stripper.ts        ← LOCKED — HTML content stripper
│   │   ├── differ.ts          ← LOCKED — word-level diff engine
│   │   ├── fetcher.ts         ← LOCKED — HTTP client with retry + bot detection
│   │   ├── pipeline.ts        ← LOCKED — orchestrates one URL check cycle
│   │   └── worker.ts          ← LOCKED — Railway persistent worker main loop
│   └── ai/
│       └── classifier.ts      ← LOCKED — Gemini + Groq dual-model classifier
│
├── components/
│   ├── ui/                    ← primitive components (Button, Card, Badge, Input)
│   ├── competitor-card.tsx    ← competitor summary card with velocity score
│   ├── event-feed.tsx         ← live feed of change events
│   ├── event-item.tsx         ← single event row with signal badge + summary
│   ├── signal-filter.tsx      ← signal type filter pills
│   ├── add-competitor-form.tsx ← form to add competitor + URLs
│   └── velocity-badge.tsx     ← color-coded velocity score indicator
│
├── types/
│   └── index.ts               ← LOCKED — application-level type contracts
│
└── scripts/
    └── create-table.ts        ← LOCKED — one-shot DynamoDB table provisioner
```

**LOCKED files** — written in Phase 2 of this build session, verified, do not regenerate:
- `lib/db/schema.ts`, `lib/db/client.ts`, `lib/monitor/stripper.ts`
- `lib/monitor/differ.ts`, `lib/ai/classifier.ts`, `lib/monitor/fetcher.ts`
- `lib/monitor/pipeline.ts`, `lib/monitor/worker.ts`, `types/index.ts`
- `scripts/create-table.ts`

Claude Code must read these files and build around them. Do not rewrite them unless a DEVIATIONS.md entry explicitly authorises it.

---

## §7 — DynamoDB schema (canonical reference)

**Table name:** `flanke` (env: `DYNAMODB_TABLE_NAME`)  
**Billing:** `PAY_PER_REQUEST`  
**Primary key:** `PK` (String) + `SK` (String)  

### GSI definitions

| Index | Hash key | Range key | Projection | Purpose |
|---|---|---|---|---|
| GSI1 | GSI1PK | GSI1SK | ALL | Workspace feed + user membership |
| GSI2 | GSI2PK | GSI2SK | INCLUDE (7 attrs) | Monitor worker scheduling |
| GSI3 | GSI3PK | GSI3SK | ALL | Signal type filter per workspace |

### Key patterns (from `lib/db/schema.ts` — source of truth)

| Entity | PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK | GSI3PK | GSI3SK |
|---|---|---|---|---|---|---|---|---|
| Workspace | `WORKSPACE#<id>` | `META` | — | — | — | — | — | — |
| Competitor | `WORKSPACE#<wId>` | `COMPETITOR#<id>` | `COMPETITOR#<id>` | `META` | — | — | — | — |
| MonitoredURL | `COMPETITOR#<id>` | `URL#<urlId>` | `URL#<urlId>` | `META` | `STATUS#ACTIVE` | `NEXT_CHECK#<iso>` | — | — |
| Snapshot | `URL#<urlId>` | `SNAPSHOT#LATEST` | — | — | — | — | — | — |
| Event | `COMPETITOR#<id>` | `EVENT#<iso>#<uuid>` | `WORKSPACE#<wId>` | `EVENT#<iso>` | — | — | `WORKSPACE#<wId>` | `SIGNAL#<type>#<iso>` |
| UserMembership | `USER#<userId>` | `MEMBER#<wId>` | `WORKSPACE#<wId>` | `USER#<userId>` | — | — | — | — |

### Signal types (11 total — exhaustive)
`PRICING_INCREASE` · `PRICING_DECREASE` · `NEW_FEATURE_LAUNCHED` · `ENTERPRISE_TIER_ADDED` · `FREE_TIER_REMOVED` · `SALES_HIRING_SPIKE` · `ENGINEERING_HIRING_SPIKE` · `MESSAGING_PIVOT` · `NEW_INTEGRATION_ADDED` · `PRODUCT_DISCONTINUATION` · `UNKNOWN_CHANGE`

### Key architectural decisions (explain in demo video)
1. `EVENT#<isoTimestamp>#<uuid>` as SK — ISO timestamps sort lexicographically = chronologically. `ScanIndexForward: false` gives newest-first with zero post-processing.
2. GSI2 uses `INCLUDE` projection (7 attributes only) — worker reads this index on every cycle. Projecting ALL would double read cost on the most frequent query in the system.
3. Conditional snapshot write: `attribute_not_exists(PK) OR contentHash <> :newHash` — prevents duplicate events when two worker cycles overlap on the same URL.
4. `velocityScore` incremented atomically on every event write via `UpdateCommand ADD velocityScore :inc` — no read-modify-write race condition.


---

## §8 — API routes specification

All routes live in `app/api/`. All routes require authentication via NextAuth session middleware except `/api/auth/*` and `/api/monitor/health`.

### Authentication pattern (apply to every protected route)
```typescript
import { auth } from "@/lib/auth";
const session = await auth();
if (!session?.user?.workspaceId) return Response.json({ error: "Unauthorized" }, { status: 401 });
const { workspaceId, id: userId } = session.user;
```

### Route inventory

#### `GET /api/competitors`
- **Purpose:** List all competitors for the authenticated workspace (AP1)
- **DynamoDB call:** `getWorkspaceCompetitors(workspaceId)`
- **Response:** `{ competitors: CompetitorCard[] }`
- **Error states:** 401 (no session), 500 (DynamoDB error)

#### `POST /api/competitors`
- **Purpose:** Add a new competitor to the workspace
- **Body:** `{ name: string, domain: string, urls: Array<{ url: string, urlType: UrlType, checkIntervalMinutes: number }> }`
- **Validation:** domain must be valid URL, at least 1 URL required, max 20 URLs per competitor
- **DynamoDB writes:** COMPETITOR item + N MonitoredURL items, all in parallel via `Promise.all`
- **Sets:** `nextCheckAt = now` so worker picks it up immediately on next cycle
- **Response:** `{ competitor: CompetitorCard }`

#### `GET /api/competitors/[id]`
- **Purpose:** Competitor detail with all monitored URLs (AP2)
- **DynamoDB calls:** query `PK=COMPETITOR#<id>` for all SK types (META + URL#* + EVENT#*)
- **Response:** `{ competitor: CompetitorCard, recentEvents: FeedEvent[] }`

#### `DELETE /api/competitors/[id]`
- **Purpose:** Remove competitor and all associated data
- **DynamoDB:** batch delete COMPETITOR item + all URL items. Events are retained (immutable audit trail)
- **Response:** `{ success: true }`

#### `POST /api/competitors/[id]/urls`
- **Purpose:** Add a monitored URL to an existing competitor
- **Body:** `{ url: string, urlType: UrlType, checkIntervalMinutes: number }`
- **Response:** `{ url: MonitoredUrlCard }`

#### `GET /api/events`
- **Purpose:** Global workspace feed — all events across all competitors, newest first (AP4)
- **Query params:** `limit` (default 100, max 200), `before` (ISO timestamp for pagination)
- **DynamoDB call:** GSI1 query `GSI1PK=WORKSPACE#<id>` SK begins_with `EVENT#`
- **Response:** `{ events: FeedEvent[], nextCursor: string | null }`

#### `GET /api/events/filter`
- **Purpose:** Filter events by signal type (AP8)
- **Query params:** `signalType` (required), `limit` (default 50)
- **DynamoDB call:** GSI3 query
- **Response:** `{ events: FeedEvent[] }`

#### `PATCH /api/events/[id]/tag`
- **Purpose:** Apply user tag to an event
- **Body:** `{ tag: string | null }`
- **DynamoDB:** UpdateCommand on the event item
- **Response:** `{ event: FeedEvent }`

#### `GET /api/monitor/health`
- **Purpose:** Health check for Railway worker (unauthenticated)
- **Response:** `{ status: "ok", workerVersion: string, lastCycleAt: string | null }`
- **Note:** Worker pings this endpoint after each cycle to update `lastCycleAt` in a SYSTEM item in DynamoDB

---

## §9 — Frontend specification

### Design language
**Name:** Pressurized minimalism  
**Principle:** The interface should feel like a war room, not a dashboard. Dark, precise, information-dense without clutter. Every element earns its place.

### Color system
```css
/* Base — near-black with warm undertone, not pure black */
--color-base: #0a0a0f;
--color-surface: #111118;
--color-surface-raised: #18181f;
--color-border: #ffffff14;
--color-border-strong: #ffffff26;

/* Accent — electric indigo, not purple, not blue */
--color-accent: #6366f1;
--color-accent-hover: #818cf8;
--color-accent-muted: #6366f120;

/* Signal type colors — each signal has a distinct color */
--signal-pricing-up: #f97316;    /* orange — money moving */
--signal-pricing-down: #22c55e;  /* green — opportunity */
--signal-feature: #6366f1;       /* indigo — product */
--signal-enterprise: #a855f7;    /* purple — tier change */
--signal-hiring: #eab308;        /* amber — headcount signal */
--signal-messaging: #ec4899;     /* pink — positioning shift */
--signal-unknown: #6b7280;       /* gray — unclassified */

/* Text */
--color-text-primary: #f1f5f9;
--color-text-secondary: #94a3b8;
--color-text-muted: #475569;

/* Importance score — interpolate between these */
--importance-low: #374151;       /* 1–3 */
--importance-mid: #92400e;       /* 4–6 */
--importance-high: #dc2626;      /* 7–10 */
```

### Typography
```css
font-family: "Inter", "SF Pro Display", system-ui, -apple-system, sans-serif;

/* Scale */
--text-xs: 11px;
--text-sm: 13px;
--text-base: 15px;
--text-lg: 17px;
--text-xl: 20px;
--text-2xl: 26px;
--text-3xl: 32px;

/* Weights: 400 (body), 500 (label), 600 (heading) */
```

### Layout
```
┌─────────────────────────────────────────────────────┐
│  FLANKE  [workspace name]              [user menu]  │  ← top nav, 48px
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  Competitors │  Event feed / competitor detail      │
│  sidebar     │                                      │
│  240px       │  Main content area                   │
│              │                                      │
│  [+ Add]     │                                      │
│              │                                      │
│  — Notion    │                                      │
│    ● 8 ev    │                                      │
│  — Linear    │                                      │
│    ● 3 ev    │                                      │
│  — Loom      │                                      │
│    ● 1 ev    │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### Component specifications

#### `<CompetitorCard>` (sidebar item)
- Competitor name (text-sm, font-500, text-primary)
- Domain (text-xs, text-muted)
- Velocity badge (colored dot + number — events in last 7 days)
- Last event time (text-xs, text-muted, relative: "2h ago")
- Click: navigates to competitor detail view
- Active state: left border accent color, surface-raised background

#### `<EventItem>`
- Signal type badge — colored pill with signal name (text-xs, uppercase, 500)
- Importance score bar — thin horizontal bar, color interpolated by score
- Competitor name + URL type (text-xs, text-muted)
- Summary text (text-sm, text-primary, full sentence from AI)
- Detected time (text-xs, text-muted, relative)
- Expand chevron → shows `diffAdded` / `diffRemoved` lines in monospace
- Tag button → opens inline tag input

#### `<SignalFilter>` (above feed)
- Row of pill buttons: ALL | PRICING | FEATURES | HIRING | MESSAGING | OTHER
- Active pill: accent background, white text
- Inactive pill: border only, muted text
- Click: filters feed via `GET /api/events/filter?signalType=`

#### `<VelocityBadge>`
- 0 events: gray dot
- 1–3 events: yellow dot
- 4–7 events: orange dot
- 8+ events: red dot (this competitor is moving fast)
- Number alongside dot

#### `<AddCompetitorForm>` (modal/slide-over)
- Company name input
- Domain input (validated as URL on blur)
- URL builder: type selector (PRICING / CHANGELOG / CAREERS / HOMEPAGE / CUSTOM) + URL input + check interval selector (hourly / every 6h / daily)
- Add URL button (up to 20 URLs per competitor)
- Submit → POST /api/competitors
- On success: close form, prepend competitor to sidebar, show toast

#### Landing page (`/`)
- Unauthenticated — no auth required
- Hero: "Know your enemy's next move." — large, centered, white on dark
- Sub: "Flanke monitors competitor pages, detects changes, and tells your sales team what it means. From $49/month."
- CTA: "Start free" → /signup
- Social proof row: "68% of B2B deals involve a direct competitor. Your team is prepared for 38% of them." (Crayon 2025 State of CI data)
- Feature grid (3 columns): Monitor / Classify / Act
- Pricing section: Free · Pro · (Enterprise coming soon)
- No animations — static, fast, professional


---

## §10 — NextAuth v5 configuration

**Provider:** GitHub OAuth (primary) + Google OAuth (secondary)  
**Session strategy:** JWT (stateless — no database session table needed)  
**Workspace resolution:** on first login, check `USER#<userId> MEMBER#*` in DynamoDB. If no membership exists, create a new workspace and membership atomically.

```typescript
// lib/auth.ts — canonical auth configuration
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { db, TABLE } from "./db/client";
import { Keys } from "./db/schema";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        // Resolve or create workspace on first sign-in
        const membership = await resolveWorkspace(user.id, user.email ?? "");
        token.workspaceId = membership.workspaceId;
        token.role = membership.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.workspaceId = token.workspaceId as string;
      session.user.role = token.role as "OWNER" | "MEMBER";
      return session;
    },
  },
});

async function resolveWorkspace(userId: string, email: string) {
  // Check for existing membership
  const existing = await db.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
    ExpressionAttributeValues: {
      ":pk": Keys.userMembership.pk(userId),
      ":prefix": "MEMBER#",
    },
    Limit: 1,
  }));

  if (existing.Items?.[0]) {
    return {
      workspaceId: existing.Items[0].workspaceId as string,
      role: existing.Items[0].role as "OWNER" | "MEMBER",
    };
  }

  // First login — create workspace + membership
  const workspaceId = randomUUID();
  const now = new Date().toISOString();

  await Promise.all([
    db.send(new PutCommand({
      TableName: TABLE,
      Item: {
        PK: Keys.workspace.pk(workspaceId),
        SK: Keys.workspace.sk(),
        entityType: "WORKSPACE",
        workspaceId,
        name: `${email.split("@")[0]}'s workspace`,
        slug: workspaceId.slice(0, 8),
        plan: "FREE",
        competitorCount: 0,
        createdAt: now,
        updatedAt: now,
      },
    })),
    db.send(new PutCommand({
      TableName: TABLE,
      Item: {
        PK: Keys.userMembership.pk(userId),
        SK: Keys.userMembership.sk(workspaceId),
        GSI1PK: Keys.userMembership.gsi1pk(workspaceId),
        GSI1SK: Keys.userMembership.gsi1sk(userId),
        entityType: "USER_MEMBERSHIP",
        userId,
        workspaceId,
        email,
        role: "OWNER",
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    })),
  ]);

  return { workspaceId, role: "OWNER" as const };
}
```

---

## §11 — Environment variables

### Vercel (frontend + API routes)
```bash
# NextAuth
AUTH_SECRET=<random 32-char string — `openssl rand -hex 32`>
AUTH_GITHUB_ID=<GitHub OAuth App client ID>
AUTH_GITHUB_SECRET=<GitHub OAuth App client secret>
AUTH_GOOGLE_ID=<Google Cloud OAuth client ID>
AUTH_GOOGLE_SECRET=<Google Cloud OAuth client secret>
NEXTAUTH_URL=https://flanke.vercel.app  # update after deploy

# AWS DynamoDB
AWS_ACCESS_KEY_ID=<IAM user access key>
AWS_SECRET_ACCESS_KEY=<IAM user secret key>
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=flanke
```

### Railway (monitor worker only)
```bash
# Same AWS credentials as Vercel
AWS_ACCESS_KEY_ID=<same>
AWS_SECRET_ACCESS_KEY=<same>
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=flanke

# AI APIs
GEMINI_API_KEY=<Google AI Studio key — billing-disabled project>
GROQ_API_KEY=<console.groq.com — no credit card>

# Worker config
NODE_ENV=production
WORKER_POLL_INTERVAL_MS=60000
WORKER_CONCURRENCY=5
```

### IAM policy (minimum permissions for the AWS user)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:DescribeTable",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/flanke",
        "arn:aws:dynamodb:us-east-1:*:table/flanke/index/*"
      ]
    }
  ]
}
```

---

## §12 — Day 0 gate checklist

These items must be verified as TRUE before Phase F build begins. Claude Code must not proceed past P1 until all items are checked.

- [ ] **D0-01** DynamoDB table `flanke` exists in AWS console, status ACTIVE, billing PAY_PER_REQUEST — run `npx tsx scripts/create-table.ts`
- [ ] **D0-02** All 3 GSIs (GSI1, GSI2, GSI3) show status ACTIVE in AWS console
- [ ] **D0-03** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `DYNAMODB_TABLE_NAME` set in `.env.local` and verified with a `GetCommand` test call
- [ ] **D0-04** Gemini API key active — test with one `generateContent` call using `gemini-2.5-flash` model, confirm JSON response received
- [ ] **D0-05** Groq API key active — test with one `/v1/chat/completions` call using `llama-3.3-70b-versatile`, confirm JSON response received
- [ ] **D0-06** GitHub OAuth app created at github.com/settings/developers — callback URL set to `http://localhost:3000/api/auth/callback/github` for local, `https://flanke.vercel.app/api/auth/callback/github` for production
- [ ] **D0-07** `AUTH_SECRET` generated (`openssl rand -hex 32`) and set in `.env.local`
- [ ] **D0-08** Next.js 16.2.0 confirmed — `node_modules/next/package.json` version field reads `16.2.0` or later 16.x patch
- [ ] **D0-09** Railway project created, `flanke-worker` service configured, env vars set, `npm run worker` confirmed as start command
- [ ] **D0-10** Vercel project linked to repo, env vars set, first deployment succeeds (even if just landing page)
- [ ] **D0-11** `DEVIATIONS.md` and `AGENT_PROGRESS.md` files created in repo root


---

## §13 — Sequenced Claude Code build prompts

Each prompt is one concern. Claude Code completes it fully, reports deliverables, before the next prompt is issued. No prompt is issued until the previous one is confirmed working.

### P1 — Project initialisation + locked file integration
```
You are building Flanke, a competitive intelligence SaaS. Read MASTER_PRD.md fully before writing any code.

Task: initialise the Next.js 16.2 project and integrate the pre-built locked files.

Steps:
1. Run `npx create-next-app@latest . --typescript --tailwind --app --src-dir=no --import-alias="@/*"` in the repo root. Confirm Next.js version is 16.2.x after install.
2. Install additional dependencies from MASTER_PRD.md §5 that create-next-app does not include: @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @google/generative-ai diff node-html-parser next-auth@beta dotenv tsx
3. Copy the following files from their existing locations into the project (they are LOCKED — do not modify):
   - lib/db/schema.ts
   - lib/db/client.ts
   - lib/monitor/stripper.ts
   - lib/monitor/differ.ts
   - lib/monitor/fetcher.ts
   - lib/monitor/pipeline.ts
   - lib/monitor/worker.ts
   - lib/ai/classifier.ts
   - types/index.ts
   - scripts/create-table.ts
4. Create tsconfig.json with strict mode, path alias @/* → ./*
5. Create next.config.ts — no special config needed beyond defaults
6. Create .env.local.example with all variables from MASTER_PRD.md §11
7. Create DEVIATIONS.md and AGENT_PROGRESS.md in repo root (empty with headers)
8. Run `npx tsc --noEmit` — fix any type errors in the locked files only if they are import resolution issues. Do not change logic.

Deliverable: repo compiles with `npx tsc --noEmit` zero errors. Report exact Next.js version installed.
```

### P2 — DynamoDB table + Day 0 gate
```
Read MASTER_PRD.md §12 (Day 0 gate) and §7 (schema).

Task: run the Day 0 gate and confirm all 11 items are green.

Steps:
1. Run `npx tsx scripts/create-table.ts` — confirm table ACTIVE, all 3 GSIs ACTIVE
2. Write a smoke-test script at `scripts/smoke-test.ts` that:
   a. Writes a test WORKSPACE item to DynamoDB
   b. Writes a test COMPETITOR item
   c. Writes a test EVENT item with PK=COMPETITOR#test, SK=EVENT#<iso>#<uuid>
   d. Queries GSI1 for the event (workspace feed pattern)
   e. Deletes all 3 test items
   f. Logs PASS or FAIL for each step
3. Run `npx tsx scripts/smoke-test.ts` — all steps must pass
4. Test Gemini API key: one `generateContent` call to `gemini-2.5-flash` with prompt "respond with valid JSON: {\"test\": true}" — confirm JSON received
5. Test Groq API key: one fetch to Groq `/v1/chat/completions` with same prompt — confirm JSON received
6. Update AGENT_PROGRESS.md: mark P2 complete, log all D0 items as PASS/FAIL

Deliverable: smoke-test output showing all DynamoDB operations PASS, Gemini PASS, Groq PASS. D0 gate fully green.
```

### P3 — NextAuth v5 + workspace resolution
```
Read MASTER_PRD.md §10 (NextAuth config) and §8 (auth pattern for routes).

Task: implement authentication end-to-end.

Steps:
1. Create lib/auth.ts from the exact code in MASTER_PRD.md §10 — do not modify it
2. Create app/api/auth/[...nextauth]/route.ts that exports { handlers as GET, handlers as POST } from lib/auth
3. Create middleware.ts at repo root:
   - Protect all routes matching /dashboard/*, /api/competitors/*, /api/events/*
   - Redirect unauthenticated requests to /login
   - Exclude /api/auth/*, /api/monitor/health, / (landing page), /login, /signup
4. Create app/(auth)/login/page.tsx — minimal sign-in page with "Continue with GitHub" button calling signIn("github")
5. Create app/(auth)/signup/page.tsx — same as login (OAuth handles user creation)
6. Test: start dev server, navigate to /dashboard, confirm redirect to /login, sign in with GitHub, confirm workspace created in DynamoDB (run a GetItem on the USER# key)

Deliverable: auth flow works end-to-end. DynamoDB shows WORKSPACE and USER_MEMBERSHIP items after first login. Report the workspaceId created.
```

### P4 — API routes: competitors CRUD
```
Read MASTER_PRD.md §8 (API routes) and §7 (DynamoDB schema).

Task: implement the competitor management API routes.

Files to create:
- app/api/competitors/route.ts (GET + POST)
- app/api/competitors/[id]/route.ts (GET + DELETE)
- app/api/competitors/[id]/urls/route.ts (POST)

Rules:
- Every route validates session first (pattern from MASTER_PRD.md §8)
- POST /api/competitors: validate body, write COMPETITOR item + all URL items in parallel, set nextCheckAt = now on all URLs, return CompetitorCard shape
- GET /api/competitors: query PK=WORKSPACE#<id> SK begins_with COMPETITOR#, return CompetitorCard[]
- GET /api/competitors/[id]: query PK=COMPETITOR#<id> for META + URL# + EVENT# items, assemble CompetitorCard + FeedEvent[]
- DELETE /api/competitors/[id]: batch delete COMPETITOR + all URL items (query first to get all URL keys)
- No mock data anywhere. All responses come from real DynamoDB calls.

Test: use curl or a REST client to POST a test competitor with 2 URLs, GET it back, confirm DynamoDB items exist. 

Deliverable: all 4 routes return correct shapes. No TypeScript errors.
```

### P5 — API routes: event feed + signal filter
```
Read MASTER_PRD.md §8 (events routes) and lib/db/client.ts (getWorkspaceFeed, getEventsBySignalType).

Task: implement event feed routes.

Files to create:
- app/api/events/route.ts (GET — workspace feed via GSI1)
- app/api/events/filter/route.ts (GET — signal type filter via GSI3)
- app/api/events/[id]/tag/route.ts (PATCH — user tag)

Rules:
- GET /api/events: call getWorkspaceFeed(workspaceId, limit), support ?limit and ?before cursor
- GET /api/events/filter: validate signalType against SIGNAL_TYPES array from schema.ts, call getEventsBySignalType
- PATCH /api/events/[id]/tag: UpdateCommand on the event's PK+SK, set userTag attribute

Deliverable: routes return correct shapes. Signal filter rejects invalid signalType with 400.
```

### P6 — Railway worker deployment
```
Read MASTER_PRD.md §5 (Railway worker) and lib/monitor/worker.ts.

Task: deploy the monitor worker to Railway.

Steps:
1. Create Dockerfile at repo root:
   FROM node:22-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --production
   COPY . .
   RUN npx tsc --outDir dist
   CMD ["node", "dist/lib/monitor/worker.js"]
2. Create railway.json:
   { "build": { "builder": "DOCKERFILE" }, "deploy": { "startCommand": "node dist/lib/monitor/worker.js", "restartPolicyType": "ON_FAILURE", "restartPolicyMaxRetries": 3 } }
3. Confirm all Railway env vars are set (from MASTER_PRD.md §11 Railway section)
4. Deploy to Railway — confirm worker starts, logs "[worker] Vaultboard monitor worker v1.0.0 starting" (note: binary name is worker, product name in logs will say Vaultboard — update to Flanke in worker.ts AGENT_VERSION string)
5. Create app/api/monitor/health/route.ts — unauthenticated GET, query a SYSTEM item from DynamoDB to get lastCycleAt, return { status: "ok", lastCycleAt }
6. Add a test competitor via the API, wait 60s, confirm the worker runs a cycle and logs the result

Deliverable: Railway worker running continuously. Health endpoint returns 200. Confirm with Railway logs showing at least one completed cycle.
```

### P7 — Dashboard UI: layout + competitor sidebar
```
Read MASTER_PRD.md §9 (frontend spec) fully before writing any component.

Task: build the authenticated dashboard layout and competitor sidebar.

Files to create:
- app/(dashboard)/layout.tsx — sidebar + main area shell, auth guard
- app/(dashboard)/page.tsx — global feed (shell only, feed component in P8)
- components/competitor-card.tsx — sidebar item component
- components/velocity-badge.tsx — colored dot + count
- components/ui/button.tsx, card.tsx, badge.tsx — primitive components

Rules:
- Use CSS variables from MASTER_PRD.md §9 color system — define them in app/globals.css
- Font: Inter via next/font/google (only accepted external font)
- Sidebar: 240px fixed, dark surface, competitor list fetched from GET /api/competitors on mount
- Each CompetitorCard: name, domain, velocity badge, last event time
- Active competitor highlighted with left border in --color-accent
- "+ Add Competitor" button at top of sidebar — opens modal (modal built in P9)
- Layout is responsive: sidebar collapses to bottom nav on mobile
- No mock data — sidebar fetches real data from API

Deliverable: dashboard layout renders with real competitor data from DynamoDB. Sidebar shows competitors with velocity badges. TypeScript clean.
```

### P8 — Dashboard UI: event feed + signal filter
```
Read MASTER_PRD.md §9 (EventItem, SignalFilter specs).

Task: build the event feed and signal filtering.

Files to create:
- components/event-feed.tsx — container, fetches from /api/events, polls every 30s
- components/event-item.tsx — single event row
- components/signal-filter.tsx — pill filter row

Rules:
- EventItem shows: signal badge (colored by type per §9 color system), importance bar, competitor name, URL type, summary, time, expand chevron, tag button
- Expand chevron: shows diffAdded lines in green monospace, diffRemoved in red monospace
- Importance bar: thin 4px-tall bar, full width of card, color interpolated per §9
- SignalFilter: ALL + 6 category pills. Click calls /api/events/filter and replaces feed content
- Feed polls every 30 seconds via setInterval (no websocket needed for hackathon)
- No mock data — all events come from real DynamoDB via API

Deliverable: feed shows real events from DynamoDB. Signal filter works. Importance bar renders correctly. Expand/collapse works.
```

### P9 — Add competitor form + landing page
```
Read MASTER_PRD.md §9 (AddCompetitorForm, landing page specs).

Task: build the competitor creation flow and landing page.

Files to create:
- components/add-competitor-form.tsx — slide-over modal
- app/page.tsx — landing page (unauthenticated)

Rules:
- AddCompetitorForm: company name, domain, URL builder (add up to 20 URLs), submit POSTs to /api/competitors, on success closes and prepends to sidebar
- URL builder: urlType selector + URL input + interval selector per URL row, "+ Add URL" button
- Validate domain format before submit
- Landing page: hero text exactly from §3 demo screenplay positioning, feature grid, pricing section, CTA → /login
- Landing page uses same dark color system as dashboard
- No animations on landing page — static and fast

Deliverable: competitor creation works end-to-end. New competitor appears in sidebar immediately. Landing page renders at /.
```

### P10 — Competitor detail page + final polish
```
Read MASTER_PRD.md §8 (GET /api/competitors/[id]) and §9 (layout).

Task: build competitor detail view and do submission polish.

Files to create:
- app/(dashboard)/competitors/[id]/page.tsx — competitor detail with URL list + event timeline

Steps:
1. Competitor detail: shows all monitored URLs with status badges (ACTIVE/BLOCKED/ERROR), check interval, last checked time
2. Event timeline for this competitor only (not global feed) — fetches from GET /api/competitors/[id]
3. Update AGENT_PROGRESS.md with full build completion
4. Verify Vercel deployment is live and all routes work
5. Screenshot: AWS Console showing DynamoDB table flanke with PAY_PER_REQUEST billing and all 3 GSIs ACTIVE — save as docs/aws-console-screenshot.png (required for hackathon submission)
6. Run through demo screenplay from MASTER_PRD.md §3 against the live production URL — confirm every action in the script works

Deliverable: competitor detail page works. Production URL functions end-to-end. AWS console screenshot saved. Demo run-through confirms all script actions work.
```

---

## §14 — Failure states & recovery (implemented in locked files)

| Failure | Location | Recovery |
|---|---|---|
| Fetch timeout | `fetcher.ts` | Exponential backoff, 3 retries, log TIMEOUT_AFTER_RETRIES |
| Bot block / 403 | `fetcher.ts` | Mark URL BLOCKED in DynamoDB, do not retry |
| False positive diff | `stripper.ts` | Strip 7 dynamic patterns before hash; `MIN_SIGNIFICANT_WORD_CHANGE=3` gate |
| DynamoDB throttle | `client.ts` | On-demand auto-scales; SDK retries with jitter |
| Gemini rate limit | `classifier.ts` | Groq fallback; then UNKNOWN_CHANGE safe default |
| Worker race condition | `client.ts` | Conditional write `attribute_not_exists OR hash <> new` |
| Auth failure | middleware + routes | 401 → redirect to /login, no data leak |
| Worker cold start | `worker.ts` | Idempotent job — safe to re-run; next cycle catches missed URLs |

---

## §15 — Submission checklist

- [ ] Text description written — explains DynamoDB event-sourcing choice and why it's architecturally correct
- [ ] Demo video recorded — follows §3 screenplay exactly, under 3 minutes, uploaded to YouTube (public)
- [ ] Vercel project URL live and accessible without login for the landing page
- [ ] Vercel Team ID copied from vercel.com → Settings → General
- [ ] Architecture diagram exported as PNG (matches Phase 1 system diagram)
- [ ] AWS Console screenshot: DynamoDB table `flanke`, PAY_PER_REQUEST, all 3 GSIs ACTIVE
- [ ] 3 content pieces published (dev.to / LinkedIn / builder.aws.com) with #H0Hackathon hashtag and hackathon entry disclosure:
  - Piece 1: "How I designed a DynamoDB single-table schema for competitive intelligence events"
  - Piece 2: "Dual-model AI fallback: Gemini 2.5 Flash + Groq for zero-downtime classification"
  - Piece 3: "Building Flanke: a self-serve competitive intelligence tool for B2B sales teams on AWS + Vercel"
- [ ] Devpost submission form filled with all required fields
- [ ] Code freeze observed — no new features after Jun 27, 2026 23:59 WAT

---

## §16 — Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Bot blocking on major competitor URLs at demo time | Medium | High | Pre-add Notion/Linear/Loom URLs 48h before recording — verify they return 200 |
| Gemini free tier exhausted during demo | Low | High | Groq fallback is automatic; demo uses pre-existing events not live classification |
| DynamoDB cold partition on demo (first query slow) | Low | Medium | Run a warm-up query before recording |
| NextAuth v5 beta breaking change | Low | High | Pin `next-auth@5.0.0-beta.31` exactly — do not `npm update` |
| Railway worker restart during demo | Low | Medium | Health endpoint shows last cycle time; demo focuses on existing events not live detection |
| Vercel deployment fails | Low | High | Keep local `npm run dev` as backup for demo if needed |


---

## §17 — Permanent build rules (Claude Code must follow every session)

1. **No mocks, no stubs, no demo modes.** Every API call hits real DynamoDB. Every event in the feed came from a real monitor cycle. Every classification came from Gemini or Groq. If a feature requires live data that does not exist yet, the correct response is to run the worker against a real URL, wait, and use the real output.

2. **Read MASTER_PRD.md at the start of every session.** The PRD is the contract. If the PRD and the existing code disagree, the PRD wins unless a DEVIATIONS.md entry explicitly authorises the deviation.

3. **LOCKED files are not touched.** `lib/db/schema.ts`, `lib/db/client.ts`, `lib/monitor/*.ts`, `lib/ai/classifier.ts`, `types/index.ts`, `scripts/create-table.ts` — read them, build around them, do not rewrite them. If a locked file has a genuine bug, surface it in DEVIATIONS.md before fixing.

4. **DEVIATIONS.md discipline.** Two categories: (a) Architectural Pivot — something fundamentally different from the PRD, requires a one-paragraph explanation of why; (b) Doc-Verification Drift — an SDK or API behaves differently from what the PRD documents. Both are logged with date, file, what changed, and why.

5. **AGENT_PROGRESS.md updated at every phase boundary.** Format: phase number, date, deliverables completed, any DEVIATIONS logged, next phase objective.

6. **TypeScript strict mode — no `any`.** If a type is unknown, model it explicitly. `unknown` with a type guard is always preferred over `any`.

7. **Next.js 16.2 LTS.** Not 14. Not 15. If `create-next-app` installs a different version, fix it before proceeding.

8. **No inline styles in JSX.** All styling via Tailwind utility classes or CSS variables in globals.css.

9. **Every API route handles its own error states.** No unhandled promise rejections. Every route returns a typed response or a `{ error: string }` with an appropriate HTTP status.

10. **Before recording the demo:** run through §3 screenplay against the live production URL. Confirm every action in the script works. Add any pre-warm steps needed (e.g. confirm 3 competitors exist with recent events).

---

## §18 — AGENT_PROGRESS.md template

```markdown
# Flanke — Agent Progress

## Phase gate log

| Phase | Completed | Deliverables | Deviations | Next |
|---|---|---|---|---|
| P1 — Init | | | | P2 |
| P2 — Day 0 gate | | | | P3 |
| P3 — Auth | | | | P4 |
| P4 — Competitor CRUD | | | | P5 |
| P5 — Event feed routes | | | | P6 |
| P6 — Railway worker | | | | P7 |
| P7 — Dashboard layout | | | | P8 |
| P8 — Event feed UI | | | | P9 |
| P9 — Add competitor + landing | | | | P10 |
| P10 — Detail + polish | | | | DONE |

## Current session objective
[Update at start of each Claude Code session]

## Open questions
[Any ambiguities surfaced during build — resolve before proceeding]
```

---

## §19 — DEVIATIONS.md template

```markdown
# Flanke — Deviations from Master PRD

## Architectural Pivots
[Fundamental changes from the PRD design — explain why]

## Doc-Verification Drift
[SDK / API behaviour that differs from PRD documentation]

## Format for each entry
### DEV-001 — [Short title]
**Date:** YYYY-MM-DD  
**File:** path/to/file.ts  
**PRD says:** [what the PRD documented]  
**Reality:** [what is actually true]  
**Resolution:** [what was done]  
**Authorised by:** [ARCHITECTURAL_PIVOT | DOC_DRIFT]
```

