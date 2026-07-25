# Customer Setup — Deploy Elexon Consumption Insights to Your Databricks Workspace

This guide walks you through deploying the Elexon Consumption Insights & Anomaly Detection app to your own Databricks workspace using Databricks Asset Bundles (DABS). The bundle is **standalone** — no GitHub or git required.

**Quick checklist:** Get folder → Edit `databricks.yml` (workspace URL) → Deploy → Run setup job → Open app

---

## Prerequisites

- **Databricks workspace** with Unity Catalog enabled
- **Databricks CLI** v0.250.0 or above (`databricks -v`)
- **Node.js** 18+ (for building the React app; required by Databricks Apps runtime)
- **Catalog** — Use an existing catalog, or create one (Catalog Explorer → Create catalog). The setup job creates schemas and tables inside it. Example: `elexon_consumption_insights`
- **Authentication** — Databricks CLI configured for your workspace (e.g. `databricks configure --profile your-profile`)

---

## Step 1: Get the Bundle Folder

You will receive the Elexon Consumption Insights bundle as a **folder** (e.g. zipped or via shared drive). It is self-contained — no external dependencies.

1. **Extract** the folder if you received it as a zip (e.g. `elexon-consumption-insights-bundle.zip`).
2. **Open a terminal** and go into the folder:

```bash
cd /path/to/elexon-consumption-insights-bundle
```

The folder name does not matter — it may be `elexon-consumption-insights-bundle`, `elexon-reporting-settlement-accuracy-app2`, or anything else. It must contain: `databricks.yml`, `resources/`, `notebooks/`, `frontend/`, `backend/`, `data/`, and `docs/`.

---

## Step 2: Configure for Your Workspace

**A. Set your workspace host**

Edit `databricks.yml` and replace the workspace URL in `targets.dev.workspace.host` (and `targets.prod.workspace.host` if needed) with your workspace:

```yaml
targets:
  dev:
    workspace:
      host: https://your-workspace.cloud.databricks.com
```

Also configure the Databricks CLI to authenticate to your workspace (e.g. `databricks configure --profile your-profile` or set `DATABRICKS_HOST` and `DATABRICKS_TOKEN`).

**B. Set the catalog name (optional)**

The catalog defaults to `elexon_app_for_settlement_acc_catalog`. To use a different catalog:

**Option 1 — Environment variable:**

```bash
export BUNDLE_VAR_catalog_name=elexon_consumption_insights
```

**Option 2 — Command-line:**

```bash
databricks bundle deploy -t dev -v catalog_name=elexon_consumption_insights
```

**Option 3 — Target overrides in `databricks.yml`:**

```yaml
targets:
  dev:
    variables:
      catalog_name: elexon_consumption_insights
```

| Variable | Description | Default |
|----------|-------------|---------|
| `catalog_name` | Unity Catalog name for Elexon data | `elexon_app_for_settlement_acc_catalog` |

---

## Step 3: Deploy the Bundle

From the bundle folder root (where `databricks.yml` lives):

```bash
databricks bundle validate -t dev
databricks bundle deploy -t dev
```

This deploys:

- **Jobs:** `[Elexon] Setup only (00_setup)` and `[Elexon] Full pipeline (00→06)`
- **App:** `elexon-consumption-insights` (React frontend)

---

## Step 4: Run the Setup Job

Create the catalog schemas, tables, roles, and sample data:

```bash
databricks bundle run elexon_setup_only -t dev
```

Or from the Databricks UI: **Workflows** → **Jobs** → find `[Elexon] Setup only` → **Run now**.

---

## Step 5: Run the Full Pipeline (Optional)

To ingest data, transform to silver/gold, apply governance, run ML anomaly detection, and set up Delta Sharing:

```bash
databricks bundle run elexon_full_pipeline -t dev
```

Or run from the **Workflows** UI.

---

## Step 6: Deploy and Open the App

The app is deployed with the bundle. To run it:

1. In Databricks, go to **Apps** (left sidebar)
2. Find **elexon-consumption-insights**
3. Click **Run** or open the app URL

Or from the CLI:

```bash
databricks bundle run elexon_insights_app -t dev
```

The app uses mock data by default. Real data appears after the pipeline jobs have run and populated the gold tables.

---

## Step 7: Genie Setup (Optional)

To enable "Ask a Question" (natural language queries over your data):

1. Follow [docs/GENIE_SETUP.md](GENIE_SETUP.md) to create a Genie space
2. Add your catalog tables (e.g. `your_catalog.gold.consumption_half_hourly`, `your_catalog.gold.anomalies`)
3. After creating the space, copy the shareable link (Share → Copy link)
4. Rebuild and redeploy the app with the Genie URL (from the bundle folder root):
   ```bash
   VITE_GENIE_SPACE_URL=https://your-workspace.cloud.databricks.com/genie/rooms/YOUR_ROOM_ID databricks bundle deploy -t dev
   ```
   Or edit `frontend/src/utils/genieConfig.ts` and replace `GENIE_SPACE_URL`, then redeploy.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Catalog was not found"** | Ensure the catalog exists in Catalog Explorer. Create it or set `catalog_name` to an existing catalog. Run `spark.sql("SHOW CATALOGS").show()` in a notebook to list catalogs. |
| **"Bundle not found"** | Run from the bundle root (where `databricks.yml` exists). Ensure you are in the correct folder. |
| **Deploy fails / wrong workspace** | Ensure you edited `databricks.yml` and set `targets.dev.workspace.host` to your workspace URL (not the default). |
| **"Notebook not found"** | Ensure the bundle folder is complete. Notebooks must exist at `notebooks/00_setup.py` etc. |
| **Job fails** | Check run logs in **Workflows** → **Job runs**. Ensure `elexon_setup_only` has run at least once. |
| **App fails to deploy** | Ensure Node.js is available. The app runs `npm run start` (build + serve). Check app logs in the workspace. |
| **Genie icon greyed out** | Partner-powered AI may be disabled. Ask your account admin to enable it. |

---

## Summary

1. Get the bundle folder (extract if zipped) and `cd` into it
2. Edit `databricks.yml` to set your workspace host; optionally set `catalog_name`
3. `databricks bundle deploy -t dev`
4. `databricks bundle run elexon_setup_only -t dev`
5. (Optional) `databricks bundle run elexon_full_pipeline -t dev`
6. Open the app from **Apps** in the workspace
7. (Optional) Create Genie space and configure the app

**Related docs:** [DABS_SETUP.md](DABS_SETUP.md) (jobs and bundle reference), [GENIE_SETUP.md](GENIE_SETUP.md) (Genie space setup), [INSTALL_DATABRICKS_APP.md](INSTALL_DATABRICKS_APP.md) (manual app install if needed).
