# AI Build Log & Handoff — Elexon Consumption Insights & Anomaly Detection

> **Read this first.** This file is the single source of truth for what this app is,
> what was changed and *why*, how it's deployed, and how to safely redeploy or extend it.
> It's written for a future AI/LLM (or engineer) picking up this directory cold.
> Last updated: **2026-07-27**.

---

## 1. What this is (30-second orientation)

A **Databricks App** demo built for **Elexon** (GB electricity settlement). It presents a
governed view of half-hourly smart-meter consumption with real-time anomaly detection,
purpose-based access, Delta Sharing, and natural-language Q&A (Genie).

- **Live URL:** https://elexon-insights-detection-app-7474654808133980.aws.databricksapps.com
- **Workspace:** `fevm-elexon-app-for-settlement-acc.cloud.databricks.com` (CLI profile `elexon`)
- **App name (Databricks Apps):** `elexon-insights-detection-app`
- **GitHub:** `git@github.com:jason-miles/elexon-reporting-settlement-accuracy-app.git` (branch `main`)
- **Data is 100% synthetic.** No real Elexon / smart-meter data. Catalog: `elexon_app_for_settlement_acc_catalog`.

### Frontend tabs (8)
`Overview` · `Business Overview` · `Architecture` · `Streaming Anomalies` · `Reports & Actions` ·
`Governance & Consent` · `Data Sharing` · `Ask a Question`

The **Architecture** tab (`frontend/src/pages/Architecture.tsx`) is a static explainer: a
Databricks Well-Architected reference-architecture poster (Data Sources → Ingest & ETL →
Storage/Medallion → Serving & Orchestration → Databricks App, over a unified-governance
foundation) plus the six WAF pillars mapped to this app. Pure presentation — no data deps.

Only **Reports & Actions** is backed by live data (see §4). The rest use mock data in
`frontend/src/utils/mockData.ts` — this is intentional for a demo; the pipeline notebooks
(`notebooks/00–06`) populate the real gold tables if you want to wire them up.

---

## 2. Architecture (as it stands today)

```
Browser ──HTTPS──> Databricks App (OAuth-gated)
                     │
                     ▼
              FastAPI (frontend/main.py, uvicorn)
                ├─ serves the pre-built React SPA (frontend/dist/)
                └─ /api/reports  ── SQL warehouse ──> gold.case_reports (Delta)
                     (runs as the app service principal)
```

- **Frontend:** React 18 + TypeScript + Vite + Recharts + React Router 6. Routes are
  **code-split** (`React.lazy`); Recharts is isolated into its own chunk loaded only on the
  two chart pages (Overview, Streaming Anomalies).
- **Backend:** FastAPI (`frontend/main.py`). Serves `dist/` with SPA fallback **and** the
  `/api/reports` case store. Uses the Databricks SDK `WorkspaceClient()` which auto-auths as
  the app's service principal, and runs **parameterized** SQL against a SQL warehouse.
- **Runtime:** `uvicorn` **only** — the SPA is built locally and shipped as static files.
  There is deliberately **no server-side `npm` step** (see §6 for why that matters).

### Key files
| Path | Purpose |
|---|---|
| `frontend/main.py` | FastAPI backend: static serving + `/api/reports` CRUD/actions |
| `frontend/app.yaml` | Databricks App descriptor — `command:` runs uvicorn; `env:` sets catalog/schema/warehouse |
| `frontend/requirements.txt` | `fastapi`, `uvicorn[standard]`, `databricks-sdk` |
| `frontend/src/pages/ReportsActions.tsx` | The live tab; fetches/persists via API, falls back to mock offline |
| `frontend/src/utils/reportsApi.ts` | Thin fetch client for `/api/reports` |
| `frontend/src/components/PageHero.tsx` | Shared cinematic dark hero used by every page |
| `frontend/src/components/PageLoader.tsx` | Shimmer skeleton shown during lazy route loads |
| `deploy.sh` | **Hands-off deploy** — build → sync → deploy → provision table → grant SP (see §5) |
| `notebooks/00_setup.py` | Creates catalog/schemas/tables incl. `gold.case_reports`, seeds synthetic data |

---

## 3. Change history & rationale (why things are the way they are)

This section explains the *reasoning*, so you don't undo a deliberate decision. Newest first.
Full commit list: `git log --oneline` (42 commits).

### UI modernization
- **Cinematic Overview + shared `PageHero`** (`da2a7d0`, `b68600f`) — the app needed to read
  well for both technical and executive audiences. Overview got a dark gradient hero with an
  animated glow, a live consumption sparkline, count-up KPI tiles (with **real** sparklines
  derived from `mockTimeSeries`, not hardcoded arrays — `b2be450`), and a "Business impact at a
  glance" strip. `PageHero` was then extracted and applied to every page for consistency.
- **Darker background** — `--elexon-off-white` was darkened for stronger white-card contrast.
- **Loading skeletons** (`bfd36bf`) — replaced a bare spinner with a shimmer skeleton that
  mimics page shape, so lazy-route loads don't flash. Respects `prefers-reduced-motion`.

### Reports & Actions became a real feature (`bfd36bf`, `a9f7ffb`)
- Was originally browser-only state (lost on refresh). Now persists to the Unity Catalog Delta
  table **`gold.case_reports`** via the FastAPI backend. The tab shows a live-vs-demo callout
  and **gracefully falls back to mock data** when the API is unreachable (local `npm run dev`).
- `actions` is a JSON-encoded activity trail (`[{ts, actor, action, note}]`) stored in one
  column — simplest single-table model, no join table.
- **Server-authoritative IDs**: `RPT-####` from `MAX(seq)+1`. (Known limitation: races under
  true concurrency — fine for a demo; use IDENTITY/UUID if this goes multi-user.)

### Performance & security
- **Route code-splitting** (`183947c`) — initial JS dropped **608KB → 171KB** (56KB gzip);
  Recharts (~377KB) loads only on chart pages. The 500KB chunk warning is gone.
- **Prod sourcemaps disabled** (`b2be450`) — `vite.config.ts sourcemap: false`; dist dropped
  ~3.1MB → ~700KB and stopped shipping readable source.
- **favicon + meta** (`b2be450`) — Elexon-logo favicon, description, theme-color, OG tags.
- **Parameterized SQL** (`a9f7ffb`) — all backend SQL uses named `:markers` bound via the SDK
  (`StatementParameterListItem`); user input is never concatenated. The old quote-escaping
  helper was removed.
- **Action latency cut** (`a9f7ffb`) — `add_action` went 3 warehouse round-trips → 2 by
  returning the row from known state instead of re-SELECTing.
- **npm audit** — safe patches applied. Remaining vulns are **dev-only** (vite/esbuild, never
  ship to prod) or **non-exploitable** react-router paths that need a breaking v7 major.
  A v7 upgrade was trialed and **reverted** — it added risk without clearing the vulns.
  *Do not "fix" these blindly; they were assessed and consciously left.*

### Directory consolidation (`aed8e66`)
- This folder used to be `…-part-3`. Two dead siblings (`part-1` empty stub, `part-2`
  presentation) were consolidated: part-2's deck now lives in `presentation/` here; part-1 was
  discarded. The old `re-deploy/` nested copies were removed. See `../re-deploy/` for the
  redeploy zip + docs.

---

## 4. The `gold.case_reports` table

Created by `notebooks/00_setup.py` (and idempotently by `deploy.sh`). Schema:

```sql
report_id STRING NOT NULL, title STRING, category STRING, linked_anomaly STRING,
mpan_id STRING, priority STRING, status STRING, assignee STRING, description STRING,
actions STRING,            -- JSON: [{ts, actor, action, note}]
created_at TIMESTAMP, updated_at TIMESTAMP
```

Seeded with 3 demo cases (RPT-1039/1041/1042) so the tab looks populated on first load.
`status` ∈ {open, investigating, escalated, resolved}. `priority` ∈ {high, medium, low}.

API endpoints (all in `frontend/main.py`):
- `GET  /api/reports` — list, newest first
- `POST /api/reports` — create (server mints the next `RPT-####`)
- `POST /api/reports/{id}/actions` — append an action + update status
- `GET  /api/health` — table/warehouse sanity check

---

## 5. How to redeploy (the easy path)

**One command, idempotent, hands-off.** From this directory:

```bash
./deploy.sh
```

It: builds the frontend → wipes the stale workspace app dir → syncs `dist/` + `main.py` +
`requirements.txt` (no Node artifacts) → creates/deploys the app → ensures `gold.case_reports`
exists → grants the app service principal `USE_CATALOG`/`USE_SCHEMA`/`SELECT`+`MODIFY` on the
table and `CAN_USE` on the warehouse → waits for RUNNING and prints the URL.

**Fresh customer workspace** — override the defaults and set the warehouse first:
```bash
# 1. Edit frontend/app.yaml → DATABRICKS_WAREHOUSE_ID = <the new workspace's warehouse>
# 2. (optional) run notebooks/00–06 to build the medallion + gold tables
PROFILE=customer-ws CATALOG=my_catalog WAREHOUSE_ID=<id> ./deploy.sh
```

`deploy.sh` reads the warehouse id **from `app.yaml`** so the grant always matches the
warehouse the app actually queries. It merges into the warehouse ACL (won't clobber
owner/admins). Companion doc with manual steps: `../re-deploy/redeploy-elexon-insights-detection-app.md`.

---

## 6. Landmines — read before you touch deploy

These are hard-won. Ignore at your peril.

1. **Do NOT reintroduce a server-side `npm` build in `app.yaml`.** An earlier version ran
   `npm ci && npm run build && uvicorn …` at container start. It **hung and crashed**
   (`npm error Exit handler never called`) and was flaky. The app now ships a **pre-built
   `dist/`** and runs **uvicorn only**. Always `npm run build` locally (deploy.sh does this) and
   sync the result.

2. **Keep Node artifacts OUT of the synced workspace dir.** If `package.json` / `node_modules`
   land in the app source, the platform auto-runs `npm install` and fails with `ENOTEMPTY`.
   `deploy.sh` excludes them and wipes the dir first. `dist/` is force-included via
   `--include 'dist/**'` because it's gitignored.

3. **`dist/` is gitignored** — it is *not* in git and must be freshly built before each deploy.
   `deploy.sh` handles this. If you deploy by hand, build first.

4. **The live app survives failed deploys.** Databricks keeps the last-good deployment serving
   if a new one fails, so a broken deploy is not an outage — but always verify
   `active_deployment.status.state == SUCCEEDED`, not just compute ACTIVE.

5. **Grants live in the workspace, not in code.** A fresh workspace needs the table created and
   the SP granted — `deploy.sh` does both. Don't assume they exist.

---

## 7. How to verify a deploy

```bash
# deploy state (must be SUCCEEDED, not just compute ACTIVE)
databricks apps get elexon-insights-detection-app --profile elexon --output json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['active_deployment']['status']['state'])"

# app responds (302/200 both fine — 302 is the OAuth gate)
curl -s -o /dev/null -w "%{http_code}\n" -L https://elexon-insights-detection-app-7474654808133980.aws.databricksapps.com/

# backend persistence: load /reports-actions in a browser → expect the
# "Live — persisted to Unity Catalog" callout and 3 seeded reports.

# table check
databricks api post /api/2.0/sql/statements --profile elexon --json '{
 "warehouse_id":"d0305022e6c3db8e",
 "statement":"SELECT report_id,status FROM elexon_app_for_settlement_acc_catalog.gold.case_reports",
 "wait_timeout":"30s"}'
```

---

## 8. If you're here to IMPROVE it — assessment & ideas

The app is **demo-excellent** as of the last commit. Honest guidance so you don't over-engineer:

**Worth doing (small, real):**
- **Error toast on failed write.** Today if a create/action write fails mid-session the UI
  silently flips to demo mode; a toast ("Couldn't save — working offline") would close a small
  UX gap. See the `.catch` branches in `ReportsActions.tsx`.

**Bigger builds (only if asked):**
- **Wire the other tabs to live data.** Overview KPIs, Streaming Anomalies, Governance grants
  are all mock. Making them live needs real gold-table queries + the anomaly ML actually
  populating data (`notebooks/05_ml_anomaly_detection.py`). Big scope; mock demos identically.
- **Concurrency-safe report IDs** (UUID/IDENTITY) — only matters beyond single-user demo.

**Deliberately NOT worth it for a demo (already assessed — don't redo):**
- Chasing the remaining npm vulns (dev-only / non-exploitable; need breaking majors).
- Liquid clustering / VACUUM on `case_reports` (dozens of rows — pure over-engineering).
- Response caching on `/api/reports` (adds staleness risk at demo scale).

---

## 9. Conventions to preserve

- **Brand:** Tall Poppy red `#BD2426`, DM Sans. Design tokens in `frontend/src/index.css`.
- **Every page** uses `<PageHero>` (dark hero) + section cards. Match the existing pattern.
- **Emoji icons are `aria-hidden`.** Keep a11y intact.
- **Commit style:** imperative subject, a "why" body, and end with a `Co-authored-by:` line.
- **Deploy = `./deploy.sh`.** Don't hand-roll a different flow; extend the script instead.
- **After changing frontend code:** `cd frontend && npm run build` then `./deploy.sh`.
