# How to demo in 7 minutes — Elexon Consumption Insights & Anomaly Detection

Use this script to run a tight, “wow”-style demo for Elexon (internal ops + industry signatories).

---

## Before the demo (setup, ~10 min)

1. **Workspace:** Use https://fevm-elexon-app-for-settlement-acc.cloud.databricks.com (or your UK South workspace).
2. **Run once:** Open **Repos** and sync/clone `elexon-reporting-settlement-accuracy-app` (Pull to get latest — includes `databricks.yml` and `resources/` for DABS).
3. **Run in order:**
   - **00_setup** — uses catalog `elexon_app_for_settlement_acc_catalog`, creates schemas (bronze/silver/gold/recipient_shared), tables, roles, synthetic data.
   - **01_ingest_bronze** — (optional) ingest more raw data.
   - **02_transform_silver** — clean, dedupe, 48h watermark.
   - **03_curate_gold** — gold consumption + curated tables.
   - **04_unity_catalog_governance** — roles, purpose-based views, grants.
   - **05_ml_anomaly_detection** — train Isolation Forest, register model, promote to Production, write anomalies.
   - **06_delta_sharing** — create share, add curated tables.
4. **App:** Build the React app (`frontend`: `npm ci && npm run build`) and deploy as a Databricks App (or host the built `frontend/dist` and open in browser).

---

## 7-minute demo script

### Minute 0–1: Intro and Overview tab

- **Say:** “This is Consumption Insights & Anomaly Detection for Elexon — one place for ops and signatories to see half-hourly consumption, anomalies, governance, and data sharing.”
- Open the app and go to **Overview**.
- **Point out:** App name and Elexon branding (Tall Poppy red).
- **Show:** High-level KPIs (MPANs, total kWh, readings, latest timestamp) and **Live status: Operational**.
- **Callout:** “Data is medallion (bronze/silver/gold), with up to 48h watermark for late-arriving data; ~40M MPANs in production — here we use synthetic IDs.”

### Minute 2–3: Streaming Anomalies tab

- Switch to **Streaming Anomalies**.
- **Show:** Real-time-style chart (consumption + anomaly markers) and **Top anomalies** table (ID, masked MPAN, interval, kWh, score, type, severity).
- **Say:** “Anomalies are detected with ML (e.g. Isolation Forest), logged in MLflow, and promoted to Production; inference runs in batch or micro-batches.”
- **Point out:** Alert feed and taxonomy: **Theft / bypass**, **Meter malfunction**, **Network anomaly**, **Maintenance** — and that MPAN is masked in the UI.

### Minute 4: Governance & Consent tab

- Go to **Governance & Consent**.
- **Show:** Use-case purpose selection (Settlement / Market monitoring / Research).
- **Say:** “Access is purpose-based: settlement sees more detail; research sees only anonymised aggregates. MPAN is PII — we store raw in a restricted table and expose only tokenized_mpan to broader roles.”
- **Show:** Grants table (roles and SELECT) and the **Audit** callout: “Unity Catalog audit logs show who accessed what and when for compliance.”

### Minute 5: Data Sharing tab + Ask a Question (Genie)

- Go to **Data Sharing**.
- **Show:** **Provider view** (full gold tables) vs **Recipient view** (only shared curated tables).
- **Say:** “We use Delta Sharing: the Provider shares curated tables like `gold_consumption_curated` and `gold_anomalies`. The Recipient only sees those — no raw or internal schemas.”

### Minute 6: Databricks Asset Bundles (DABS) + Back to Databricks

**Show DABS (Infrastructure-as-Code for jobs):**

1. Open the **repo** in Databricks (Repos → `elexon-reporting-settlement-accuracy-app`).
2. Open **`databricks.yml`** (the bundle config).
3. Click the **Deployments** icon (rocket/deploy) next to the file.
4. In the **Bundle resources** pane, you’ll see the jobs: *[Elexon] Setup only* and *[Elexon] Full pipeline (00→06)*.
5. Click **Deploy** to deploy the bundle to the workspace (if not already deployed).
6. Click the **Play** icon on *[Elexon] Setup only* (or Full pipeline) to run the job.
7. **Say:** “Databricks Asset Bundles let us define jobs and pipelines as code in YAML. The same workflow can be deployed from Git, run from the UI, or triggered via CI/CD.”

**Then briefly show:**
- **Catalog Explorer:** `elexon_app_for_settlement_acc_catalog` → bronze / silver / gold / recipient_shared.
- **MLflow:** experiment and model in **Production**.
- **Delta Sharing:** share and added tables (06_delta_sharing output).

### Minute 7: Close

- **Say:** “We’ve shown medallion pipelines, 48h watermarking and dedupe, ML anomaly detection with MLOps, Unity Catalog governance with purpose-based access and masking, Delta Sharing, and Databricks Asset Bundles for infrastructure-as-code. All runnable in your workspace with the repo and notebooks.”

---

## One-line summary

*“Consumption Insights gives Elexon and signatories a single app for KPIs, real-time anomaly alerts, governed access by purpose, and secure data sharing via Delta Sharing.”*
