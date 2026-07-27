#!/usr/bin/env bash
#
# Hands-off deploy for Elexon Consumption Insights & Anomaly Detection.
#
# Does everything end-to-end:
#   1. Build the React frontend
#   2. Sync source to the app workspace folder
#   3. Create (idempotent) the app + deploy it
#   4. Provision the gold.case_reports table (Reports & Actions backend)
#   5. Grant the app service principal UC + warehouse access
#   6. Wait until the app is running and print the URL
#
# Re-runnable: every step is idempotent, so this doubles as an update script.
#
# Usage:
#   ./deploy.sh                         # uses defaults below
#   PROFILE=my-ws CATALOG=my_cat WAREHOUSE_ID=abc123 ./deploy.sh
#
set -euo pipefail

# ---- Config (override via env) --------------------------------------------
PROFILE="${PROFILE:-elexon}"
APP_NAME="${APP_NAME:-elexon-insights-detection-app}"
CATALOG="${CATALOG:-elexon_app_for_settlement_acc_catalog}"
SCHEMA="${SCHEMA:-gold}"
WAREHOUSE_ID="${WAREHOUSE_ID:-}"                 # auto-detected if empty
TABLE="${CATALOG}.${SCHEMA}.case_reports"

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$here"

log() { printf '\n\033[1;31m▶ %s\033[0m\n' "$*"; }

# ---- 0. Preflight ----------------------------------------------------------
command -v databricks >/dev/null || { echo "databricks CLI not found"; exit 1; }
command -v jq >/dev/null || { echo "jq not found (brew install jq)"; exit 1; }
command -v node >/dev/null || { echo "node not found (brew install node)"; exit 1; }

ME="$(databricks current-user me --profile "$PROFILE" --output json | jq -r '.userName')"
APP_SOURCE="/Workspace/Users/${ME}/${APP_NAME}"
log "Deploying as ${ME} → ${APP_SOURCE} (profile: ${PROFILE})"

# Resolve the warehouse. Priority: env override > the id baked into frontend/app.yaml
# (so grants always match the warehouse the app actually queries) > auto-detect.
if [[ -z "$WAREHOUSE_ID" ]]; then
  WAREHOUSE_ID="$(grep -A1 'DATABRICKS_WAREHOUSE_ID' frontend/app.yaml \
    | grep 'value:' | grep -oE '[0-9a-f]{12,}' | head -1 || true)"
  if [[ -n "$WAREHOUSE_ID" ]]; then
    log "Using warehouse from app.yaml: ${WAREHOUSE_ID}"
  else
    WAREHOUSE_ID="$(databricks warehouses list --profile "$PROFILE" --output json \
      | jq -r 'sort_by(.state != "RUNNING") | .[0].id')"
    log "Auto-selected warehouse: ${WAREHOUSE_ID}"
    log "NOTE: set DATABRICKS_WAREHOUSE_ID in frontend/app.yaml to this id so the app uses it too."
  fi
fi

sql() {
  databricks api post "/api/2.0/sql/statements" --profile "$PROFILE" --json "{
    \"warehouse_id\": \"${WAREHOUSE_ID}\",
    \"statement\": $(jq -Rs . <<<"$1"),
    \"wait_timeout\": \"50s\"
  }" >/dev/null
}

# ---- 1. Build frontend -----------------------------------------------------
log "Building frontend"
( cd frontend && npm ci && npm run build )

# ---- 2. Sync to workspace --------------------------------------------------
# Ship the locally-built dist/ (normally gitignored) so the app serves static
# files and the runtime only launches uvicorn — no fragile server-side npm build.
# Force-include dist/ but keep node_modules OUT (a partial upload breaks the
# platform's own npm install with ENOTEMPTY).
# Wipe the workspace app dir first so stale Node artifacts (package.json,
# node_modules, src/) from earlier deploys don't linger and trigger the
# platform's npm install. Then sync only what the Python runtime needs.
log "Clearing stale workspace app dir"
databricks workspace delete "$APP_SOURCE" --recursive --profile "$PROFILE" 2>/dev/null || true

log "Syncing built dist/ + Python backend (no Node artifacts) to workspace"
databricks sync frontend "$APP_SOURCE" --profile "$PROFILE" --full \
  --include 'dist/**' \
  --exclude 'node_modules/**' \
  --exclude 'package.json' --exclude 'package-lock.json' \
  --exclude 'src/**' --exclude 'start-server.js' \
  --exclude 'tsconfig.json' --exclude 'vite.config.ts'

# ---- 3. Create + deploy app ------------------------------------------------
log "Creating app (idempotent)"
databricks apps create "$APP_NAME" \
  --description "Elexon Consumption Insights & Anomaly Detection" \
  --profile "$PROFILE" 2>/dev/null || true

log "Deploying app"
databricks apps deploy "$APP_NAME" \
  --source-code-path "$APP_SOURCE" \
  --profile "$PROFILE" >/dev/null

# ---- 4. Provision the case_reports table -----------------------------------
log "Ensuring ${TABLE} exists"
sql "CREATE TABLE IF NOT EXISTS ${TABLE} (
  report_id STRING NOT NULL, title STRING, category STRING, linked_anomaly STRING,
  mpan_id STRING, priority STRING, status STRING, assignee STRING, description STRING,
  actions STRING, created_at TIMESTAMP, updated_at TIMESTAMP
) USING DELTA COMMENT 'Case reports raised against anomalies (Reports & Actions tab).'"

# ---- 5. Grant the app service principal access -----------------------------
SP="$(databricks apps get "$APP_NAME" --profile "$PROFILE" --output json \
  | jq -r '.service_principal_client_id')"
log "Granting app service principal (${SP}) UC + warehouse access"

sql "GRANT USE CATALOG ON CATALOG ${CATALOG} TO \`${SP}\`"
sql "GRANT USE SCHEMA ON SCHEMA ${CATALOG}.${SCHEMA} TO \`${SP}\`"
sql "GRANT SELECT, MODIFY ON TABLE ${TABLE} TO \`${SP}\`"

# Warehouse CAN_USE — merge into existing ACL (don't clobber owner/admins)
log "Granting CAN_USE on warehouse ${WAREHOUSE_ID}"
EXISTING="$(databricks warehouses get-permissions "$WAREHOUSE_ID" --profile "$PROFILE" --output json \
  | jq -c '[.access_control_list[]
      | {user_name, group_name, service_principal_name,
         permission_level: (.all_permissions[0].permission_level)}
      | with_entries(select(.value != null))]')"
MERGED="$(jq -c --arg sp "$SP" '. + [{service_principal_name:$sp, permission_level:"CAN_USE"}]
  | unique_by(.user_name // .group_name // .service_principal_name)' <<<"$EXISTING")"
databricks warehouses set-permissions "$WAREHOUSE_ID" --profile "$PROFILE" \
  --json "{\"access_control_list\": ${MERGED}}" >/dev/null

# ---- 6. Wait for running + report ------------------------------------------
log "Waiting for app to start"
for _ in $(seq 1 30); do
  STATE="$(databricks apps get "$APP_NAME" --profile "$PROFILE" --output json \
    | jq -r '.active_deployment.status.state // "UNKNOWN"')"
  [[ "$STATE" == "SUCCEEDED" ]] && break
  sleep 5
done

URL="$(databricks apps get "$APP_NAME" --profile "$PROFILE" --output json | jq -r '.url')"
log "Done — deploy state: ${STATE}"
echo "   App URL: ${URL}"
echo "   Reports persist to: ${TABLE}"
echo "   Warehouse: ${WAREHOUSE_ID}"
