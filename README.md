# Elexon Consumption Insights & Anomaly Detection

Production-quality Databricks App demo for **Elexon** (GB electricity settlement), showcasing Data Sharing, Unity Catalog governance, and real-time anomaly detection on half-hourly consumption data.

---

## Repository structure

| Folder | Purpose |
|--------|--------|
| **backend** | Serverless/API helpers, shared Python utilities for Databricks jobs |
| **frontend** | React app (Consumption Insights & Anomaly Detection) for Databricks App |
| **data** | Sample/synthetic data generators, schema definitions, reference files |
| **notebooks** | Databricks notebooks: setup, pipelines, Unity Catalog, ML, Delta Sharing |

---

## Quick start (7-minute demo)

1. Run **`notebooks/00_setup`** in your Databricks workspace (creates catalog, schemas, tables, roles, sample data).
2. Run pipeline notebooks **01 → 02 → 03** (bronze → silver → gold).
3. Run **Unity Catalog** and **ML anomaly** notebooks.
4. Deploy the **React app** (frontend) as a Databricks App and open the app URL.
5. Walk through tabs: **Overview → Streaming Anomalies → Governance & Consent → Data Sharing**.

See **DEMO_GUIDE.md** for the full 7-minute script.

---

## GitHub repository

- **URL:** https://github.com/jason-miles/elexon-reporting-settlement-accuracy-app  
- **Username:** jason.miles@bcs.org.uk  

### Connect this codebase to GitHub from your Mac

1. **Create the repo on GitHub** (if not already created):
   - Go to https://github.com/new
   - Name: `elexon-reporting-settlement-accuracy-app`
   - Do not initialize with README if you already have local content.

2. **From your project root** (the folder that contains this README and the `backend/`, `frontend/`, `data/`, `notebooks/` folders — e.g. `.../supply-chain-resilience-copilot-app`). If you're in an empty folder, there will be no files to add or push.

   ```bash
   cd /path/to/folder/that/has/README-and-backend-frontend-data-notebooks
   git init
   git remote add origin git@github.com:jason.miles/elexon-reporting-settlement-accuracy-app.git
   git add .
   git commit -m "Initial commit: Elexon Consumption Insights app and notebooks"
   git branch -M main
   git push -u origin main
   ```

   If you use HTTPS instead of SSH:

   ```bash
   git remote add origin https://github.com/jason.miles/elexon-reporting-settlement-accuracy-app.git
   ```

3. **Authentication:** SSH is recommended (your Mac already has the public key set up). For HTTPS, use a Personal Access Token instead of password where GitHub prompts for credentials.

---

## Databricks workspace deployment

- **Workspace URL:** https://fevm-elexon-app-for-settlement-acc.cloud.databricks.com/?o=7474654808133980  
- **Region:** UK South (recommended; no hard dependency).  
- **Git integration:** Linked as **jason.miles@bcs.org.uk**.

### Connect the repo to Databricks (Git integration)

1. In Databricks: **Settings → Workspace settings → Git integration**.
2. **Connect to Git** (or edit existing):
   - **Provider:** GitHub  
   - **Git repository URL:** `https://github.com/jason-miles/elexon-reporting-settlement-accuracy-app`  
   - **Branch:** `main`  
   - **Personal Access Token:** Create a GitHub PAT with `repo` scope; store in Databricks (or use OAuth if configured).
3. **Sync:** Choose “Sync” or “Deploy” so the workspace folder (e.g. `/Repos/jason.miles@bcs.org.uk/elexon-reporting-settlement-accuracy-app`) mirrors the repo.

### Deploy the React app as a Databricks App

1. **Build the frontend** (on your Mac or in CI):

   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. **Upload app to Databricks:**
   - **Workspace → Apps → Create App** (or use the Apps UI).
   - App name: e.g. **Consumption Insights & Anomaly Detection**.
   - Upload the contents of `frontend/dist` (or the built bundle) as the app’s static assets, or point the App to a path under `/Repos/.../frontend/dist` after building in Repos.
   - If your workspace uses “Custom App” with a backend, configure the backend to serve the React build (see workspace App docs).

3. **Backend / data access:** The app reads from Unity Catalog tables and (optionally) REST endpoints served by Databricks (e.g. SQL Warehouses or Jobs). Ensure the warehouse used by the app has access to the catalog/schemas created by `00_setup` and the pipeline notebooks.

### Using a Databricks Personal Access Token (PAT)

- **PAT:** Store securely in your environment or secrets; **do not commit** to the repo.
- Use for: Repos sync (if configured with PAT), API calls to run jobs or query from the app.
- Create PAT: **Settings → Developer → Access tokens** in your workspace.
- In code or config, use environment variables or Databricks secrets (e.g. `databricks_secrets.get("scope", "pat")`).

**Workspace:** https://fevm-elexon-app-for-settlement-acc.cloud.databricks.com/?o=7474654808133980  
**Git integration:** Linked as jason.miles@bcs.org.uk. Connect the repo in **Settings → Git integration** and sync. Do not commit PATs or passwords; use workspace secrets or environment variables.

---

## What this demo includes

- **Medallion architecture:** Bronze (raw) → Silver (cleaned, deduped, 48h watermark) → Gold (aggregations, features, anomalies).
- **Unity Catalog:** Roles (`BSC_SETTLEMENT`, `BSC_MARKET_MONITORING`, `BSC_RESEARCH`, `RECIPIENT_USER`), purpose-based access, MPAN masking (PII), audit.
- **ML/MLOps:** Anomaly detection (e.g. Isolation Forest), MLflow, model registry, “Promote to Production”, batch/streaming inference into an anomalies table.
- **Delta Sharing:** Provider shares curated gold tables; Recipient sees only permitted tables/columns (simulated in-app).
- **Elexon branding:** Tall Poppy red `#BD2426`, clean layout, responsive UI.

---

## Licences and data

- No proprietary datasets required. London-style smart meter data is simulated or from public sources (e.g. London Datastore); no real MPANs are used.
- Optional: Elexon BMRS/Insights API (e.g. FUELHH) for market overlays; use with their terms and any API keys in environment/config only.

---

## Support

- **Elexon BMRS:** https://www.elexon.co.uk/  
- **Databricks:** Your workspace admin and Databricks documentation.
