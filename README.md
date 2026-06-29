# Flanke — Live Competitor Intelligence Platform

Flanke is a real-time competitive intelligence platform designed for B2B sales teams. It continuously monitors competitor websites, processes raw HTML diffs using LLMs, classifies changes into business signals, and exposes them in a slick dashboard feed.

---

## ⚡ Core Features

1. **Automated Change Crawler**: Continually tracks competitor pages, checks snapshots, and uses hashing to isolate exact content diffs.
2. **AI Signal Classifier**: LLM processing maps diffs to 11 Direct Business Signals (e.g. `PRICING_INCREASE`, `NEW_FEATURE_LAUNCHED`, `ENTERPRISE_TIER_ADDED`) with severity scores (1–10).
3. **Alternating Grid Layout**: A premium Vercel/Railway style features section presenting mockups, flowcharts, alerts, and custom grid analytics.
4. **Custom Vector Spline Chart**: Rendered using direct math spline paths and opacity gradients to chart real-time velocity spikes.
5. **Subscription Tier Enforcement**: Active billing limits block workspaces on the Free tier after 2 competitors or 10 URLs, and Pro tier after 10 competitors or 50 URLs.
6. **"⚡ Load Demo Data" Onboarding**: Press a single button on a new workspace sidebar to instantly seed a mock competitor (`SyncDoc`) and detailed mock events for immediate testing.
7. **Workspace Notifications**: Bell indicator in top navigation leading to a dark notifications log tracking competitor updates.
8. **App favicon**: High-fidelity custom SVG logo favicon (`/icon.svg`) linked in layout metadata.

---

## ⚙️ Environment Configuration

Flanke uses environment variables for NextAuth, AWS DynamoDB access, and Gemini AI. 

Never commit real keys (like API secrets or AWS credentials) directly to GitHub. Instead, copy `.env.local.example` to `.env.local` in your local environment, and use **GitHub Secrets** for production pipelines.

### Environment Schema

| Variable | Description | Example / Notes |
| :--- | :--- | :--- |
| `AUTH_SECRET` | NextAuth encryption secret | Generate with `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` | GitHub OAuth client ID | From GitHub Developer Settings |
| `AUTH_GITHUB_SECRET` | GitHub OAuth client secret | From GitHub Developer Settings |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | From Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | From Google Cloud Console |
| `NEXTAUTH_URL` | Application root callback URL | `http://localhost:3000` |
| `AWS_ACCESS_KEY_ID` | AWS Credentials (IAM User) | From IAM Management console |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | From IAM Management console |
| `AWS_REGION` | DynamoDB AWS region | `us-east-1` |
| `DYNAMODB_TABLE_NAME` | Main Single Table name | `flanke` |
| `GEMINI_API_KEY` | Google Gemini API Key | For AI classification |

---

## 🔐 Managing Secrets Securely on GitHub

To deploy Flanke or run CI/CD actions without exposing sensitive values:
1. Go to your GitHub repository: `https://github.com/TheWeirdDee/flanke`
2. Navigate to **Settings > Secrets and variables > Actions**.
3. Click **New repository secret** and add your environment variables (e.g. `GEMINI_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
4. Link these secrets to your deployment platform (Vercel, Railway, etc.) inside the build configurations.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Env
```bash
cp .env.local.example .env.local
# Fill in your local AWS, Gemini, and Auth credentials
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the landing page and log in to the dashboard.

### 4. Seed Demo Data
Click the green **"⚡ Load Demo Data"** button on the empty dashboard sidebar to seed DynamoDB with test datasets instantly.
