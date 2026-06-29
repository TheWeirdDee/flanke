# Flanke — Gaps Analysis Report

This document outlines the differences (gaps) between the current application state and the full production specification defined in `FLANKE_MASTER_PRD.md`, alongside recommendations for future features.

---

## 1. Core Implementation Status

| Feature Area | PRD Section | Current Implementation | Gaps / Future Enhancements |
| :--- | :--- | :--- | :--- |
| **Landing & Theme** | §5 | Slick dark mode glassmorphic interface with aligned brand vector logo and scroll-anchors. | Fully compliant. |
| **Competitor Monitoring** | §7.1 | UI supports adding and listing competitors. | The scraper agent pipeline is fully mocked for development. In production, connect this to a headless browser service (e.g. Playwright / Puppeteer) to handle modern JS-heavy SPAs. |
| **Change Differ** | §7.3 | Database supports delta diff storage. | Production code should strip transient attributes (random IDs, CSRF tokens, page timestamps) to reduce crawl diff noise. |
| **Pricing Plan Rules** | §11 | Hard checks enforce Starter (2 competitors, 10 URLs) and Pro (10 competitors, 50 URLs) limits. | Integrations with **Stripe** or other payment checkout services are not yet connected for live credit card processing. |
| **Sales Alerts / Triggers** | §8 | Notifications subpage `/feed/notifications` tracks signals. | Live **Slack** and **Microsoft Teams** Webhook dispatchers must be wired to hit target endpoints in production. |
| **Workspace Roles** | §12 | Single user workspaces created automatically on authentication. | Multi-member invite flows (Workspace Settings > Invite Member) are not yet implemented. |

---

## 2. Recommendations for Production Path

1. **Crawler Headless Browser Integration**: Connect `lib/monitor/fetcher.ts` to a serverless scraping API or proxy rotation network to bypass Cloudflare/bot detectors on enterprise target pages.
2. **Atomic Scheduler Scalability**: The current worker is optimized for server environments. For horizontal scale, distribute checked URL jobs using AWS SQS or Redis.
3. **Stripe Billing Integration**: Add checkout paths for `/signup` redirecting to Stripe billing portals, updating the workspace database `plan` property on payment webhooks.
