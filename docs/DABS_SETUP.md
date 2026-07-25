# Databricks Asset Bundles (DABS) — Elexon Consumption Insights

Databricks Asset Bundles let you define jobs and pipelines as YAML (infrastructure-as-code). This folder is a **standalone DABS bundle** — deploy and run from the CLI. No GitHub or git required.

---

## Customer deployment

To deploy this bundle to **your own Databricks workspace**, see **[docs/CUSTOMER_SETUP.md](CUSTOMER_SETUP.md)** for the full step-by-step guide. You will:

1. Edit `databricks.yml` — set your workspace URL in `targets.dev.workspace.host` (and `targets.prod.workspace.host` if using prod)
2. Optionally set `catalog_name` via `-v catalog_name=your_catalog` or target variables

Example:

```bash
# After editing databricks.yml with your workspace host:
databricks bundle deploy -t dev -v catalog_name=elexon_consumption_insights
```

---

## What's included

| File | Purpose |
|------|---------|
| `databricks.yml` | Bundle config, targets (dev/prod), variables |
| `resources/elexon_pipeline.job.yml` | Jobs: *[Elexon] Setup only* and *[Elexon] Full pipeline (00→06)* |
| `resources/elexon_app.yml` | React app: *elexon-consumption-insights* |

**Jobs:**
- **Setup only** — Runs `00_setup` (catalog, schemas, tables, sample data).
- **Full pipeline** — Runs notebooks 00 → 01 → 02 → 03 → 04 → 05 → 06 in sequence.

**App:**
- **elexon-consumption-insights** — React frontend (deployed with the bundle).

---

## Deploy from the workspace (optional)

If you have uploaded this folder to Databricks Repos or Workspace:

1. Open the folder in **Repos** or **Workspace**.
2. Open **`databricks.yml`**.
3. Click the **Deployments** icon (rocket) in the top-right.
4. Select target **dev** (or prod).
5. Click **Deploy**.
6. In **Bundle resources**, click the **Play** icon on a job to run it.

**Most customers deploy from the CLI** (see below) using the folder on their local machine.

---

## Deploy from the CLI

From the bundle folder root (where `databricks.yml` lives):

```bash
cd /path/to/elexon-consumption-insights-bundle
databricks bundle validate -t dev
databricks bundle deploy -t dev
databricks bundle run elexon_setup_only -t dev
# Or run full pipeline:
databricks bundle run elexon_full_pipeline -t dev
```

Requires Databricks CLI v0.218+ configured for your workspace (e.g. `databricks configure --profile your-profile`).

---

## Requirements

- **Workspace files** enabled (default on Runtime 11.3 LTS+).
- Bundle folder (this folder) on your machine or in Databricks Workspace/Repos.
- Catalog exists (create via 00_setup or Catalog UI). Default name: `elexon_app_for_settlement_acc_catalog`; override with `-v catalog_name=your_catalog`.

---

## Troubleshooting

- **"Bundle not found"** — Ensure you're in the bundle root (where `databricks.yml` exists).
- **"Notebook not found"** — Paths use `notebooks/00_setup.py` etc. The notebook must exist in the bundle folder at that path.
- **Job fails** — Check run logs in **Workflows** → **Job runs**. Ensure 00_setup has run at least once to create the catalog/schemas.
