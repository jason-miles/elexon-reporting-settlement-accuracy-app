# Databricks AI/BI Genie — Ask Questions of Your Data

Genie lets users ask natural language questions about Elexon consumption and anomaly data. Answers are generated from Unity Catalog tables with full governance (row filters, column masks apply).

---

## Requirements

- **Databricks SQL** entitlement
- **SQL warehouse** (pro or serverless) with CAN USE permission
- **Unity Catalog** tables: `elexon_app_for_settlement_acc_catalog.gold.consumption_half_hourly`, `anomalies`, etc.
- **Partner-powered AI** enabled (account admin) for Genie

---

## Create a Genie space (one-time setup)

### 1. Create the space

1. In Databricks, click **New** (top right) → **Genie**
2. **Add data:** Select tables from `elexon_app_for_settlement_acc_catalog`:
   - `gold.consumption_half_hourly`
   - `gold.anomalies`
   - Optional: `gold.consumption_daily`, `recipient_shared.*`
3. Choose a **SQL warehouse** (serverless recommended)
4. Click **Create**

### 2. Configure instructions

1. Click **Configure Instructions** → **Text** tab
2. Add general instructions, for example:
   ```
   - This space covers Elexon half-hourly consumption and anomaly data.
   - MPAN = Meter Point Administration Number (UK electricity meter ID).
   - tokenized_mpan is masked for PII; raw mpan_id is restricted.
   - Anomaly types: theft, meter_malfunction, network_anomaly, maintenance.
   - Consumption is in kWh. interval_start_ts is the half-hour start.
   ```

### 3. Add example SQL queries

1. **Configure Instructions** → **SQL Queries** tab
2. Add example queries with natural-language titles:
   - *"How many MPANs have we seen in the last 7 days?"*
     ```sql
     SELECT count(DISTINCT mpan_id) AS total_mpans
     FROM elexon_app_for_settlement_acc_catalog.gold.consumption_half_hourly
     WHERE interval_start_ts >= current_timestamp() - INTERVAL 7 DAYS
     ```
   - *"Total kWh consumed in the last 24 hours"*
     ```sql
     SELECT sum(kwh) AS total_kwh
     FROM elexon_app_for_settlement_acc_catalog.gold.consumption_half_hourly
     WHERE interval_start_ts >= current_timestamp() - INTERVAL 1 DAY
     ```
   - *"Top 10 anomalies by score in the last week"*
     ```sql
     SELECT anomaly_id, tokenized_mpan, interval_start_ts, kwh, anomaly_score, anomaly_type, severity
     FROM elexon_app_for_settlement_acc_catalog.gold.anomalies
     WHERE created_at >= current_timestamp() - INTERVAL 7 DAYS
     ORDER BY anomaly_score DESC
     LIMIT 10
     ```

### 4. Configure settings

1. **Configure Settings**:
   - **Title:** `Elexon Consumption Insights`
   - **Description:** Brief description for users
   - **Sample questions:** e.g. "How many anomalies were detected yesterday?" "What is total consumption by day this week?"

### 5. Test the space

Ask test questions in the chat:
- "How many MPANs are in the data?"
- "Show me recent anomalies"
- "What was total kWh for the last 7 days?"

### 6. Share the space

1. Click **Share**
2. Add users/groups (e.g. `BSC_SETTLEMENT`, `BSC_RESEARCH`)
3. Set **CAN RUN** or **CAN VIEW** for end users
4. Copy the **shareable link** — use this in the app's "Ask a Question" tab

---

## Link Genie from the app

After creating the space, copy its **shareable link** (Share → Copy link) and set it in the app so "Ask a Question" opens your Genie space directly:

1. **Option A — Build-time env:** `VITE_GENIE_SPACE_URL=https://... databricks apps deploy ...` or set in app config
2. **Option B — Code:** Edit `frontend/src/utils/genieConfig.ts` and replace `GENIE_SPACE_URL` with your link
3. Sync and redeploy the app

Until configured, "Ask a Question" opens the Databricks workspace; users can click Genie in the sidebar.

---

## Embed Genie via API (advanced)

To embed Genie inside the app (chat UI), use the [Genie Conversation API](https://docs.databricks.com/en/genie/conversation-api.html). You need:
- Genie space ID (from the space URL or API)
- OAuth or service principal auth
- A backend to proxy requests (tokens must not be exposed to the browser)

See: https://docs.databricks.com/aws/en/genie/conversation-api

---

## Troubleshooting

- **"Genie icon greyed out"** — Partner-powered AI may be disabled. Ask account admin to enable.
- **Empty or wrong answers** — Add more example queries and refine instructions. Ensure table/column comments are set in Unity Catalog.
- **"No warehouse"** — Create a serverless SQL warehouse and ensure CAN USE permission.
