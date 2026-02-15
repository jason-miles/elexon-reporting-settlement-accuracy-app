# Databricks Asset Bundles (DABS) — Elexon Demo

Databricks Asset Bundles let you define jobs and pipelines as YAML (infrastructure-as-code). The Elexon repo includes a bundle so you can deploy and run the pipeline from the workspace or CLI.

---

## What's included

| File | Purpose |
|------|---------|
| `databricks.yml` | Bundle config, targets (dev/prod) |
| `resources/elexon_pipeline.job.yml` | Jobs: *[Elexon] Setup only* and *[Elexon] Full pipeline (00→06)* |

**Jobs:**
- **Setup only** — Runs `00_setup` (catalog, schemas, tables, sample data).
- **Full pipeline** — Runs notebooks 00 → 01 → 02 → 03 → 04 → 05 → 06 in sequence.

---

## Deploy from the workspace

1. Open **Repos** → `elexon-reporting-settlement-accuracy-app`.
2. **Pull** to get the latest (includes `databricks.yml` and `resources/`).
3. Open **`databricks.yml`**.
4. Click the **Deployments** icon (rocket) in the top-right.
5. Select target **dev** (or prod).
6. Click **Deploy**.
7. In **Bundle resources**, click the **Play** icon on a job to run it.

---

## Deploy from the CLI

```bash
cd /Users/jason.miles/vibe-coding-repos/elexon-reporting-settlement-accuracy-app2
databricks bundle validate -t dev
databricks bundle deploy -t dev
databricks bundle run elexon_setup_only -t dev
# Or run full pipeline:
databricks bundle run elexon_full_pipeline -t dev
```

Requires Databricks CLI v0.218+ and `--profile elexon` (or default) configured.

---

## Requirements

- **Workspace files** enabled (default on Runtime 11.3 LTS+).
- Repo cloned/synced in Databricks Repos.
- Catalog `elexon_app_for_settlement_acc_catalog` exists (create via 00_setup or Catalog UI).

---

## Troubleshooting

- **"Bundle not found"** — Ensure you're in the repo root and `databricks.yml` exists. Pull the repo if needed.
- **"Notebook not found"** — Paths use `notebooks/00_setup.py` etc. The notebook must exist in the repo at that path.
- **Job fails** — Check run logs in **Workflows** → **Job runs**. Ensure 00_setup has run at least once to create the catalog/schemas.
