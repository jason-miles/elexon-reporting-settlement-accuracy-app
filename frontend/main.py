"""
FastAPI backend for Elexon Consumption Insights & Anomaly Detection.

Responsibilities:
  1. Serve the built React frontend (dist/) with SPA fallback.
  2. Expose /api/reports — the Reports & Actions case store, backed by the
     Unity Catalog Delta table `gold.case_reports`.

Auth: runs inside a Databricks App as the app's service principal. The
Databricks SDK's WorkspaceClient() picks up that identity automatically and
statements run against a SQL warehouse (DATABRICKS_WAREHOUSE_ID).
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# --- Config -----------------------------------------------------------------
CATALOG = os.environ.get("ELEXON_CATALOG", "elexon_app_for_settlement_acc_catalog")
SCHEMA = os.environ.get("ELEXON_SCHEMA", "gold")
TABLE = f"{CATALOG}.{SCHEMA}.case_reports"
WAREHOUSE_ID = os.environ.get("DATABRICKS_WAREHOUSE_ID", "d0305022e6c3db8e")
DIST_DIR = os.path.join(os.path.dirname(__file__), "dist")

app = FastAPI(title="Elexon Consumption Insights API")

# Lazy SDK client so import never fails outside a Databricks environment.
_client = None


def _ws():
    global _client
    if _client is None:
        from databricks.sdk import WorkspaceClient

        _client = WorkspaceClient()
    return _client


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sql_str(v: Optional[str]) -> str:
    """Safely single-quote a string for inline SQL."""
    if v is None:
        return "NULL"
    return "'" + v.replace("'", "''") + "'"


def _run(statement: str) -> list[dict[str, Any]]:
    """Execute a statement on the warehouse and return rows as dicts."""
    resp = _ws().statement_execution.execute_statement(
        warehouse_id=WAREHOUSE_ID,
        statement=statement,
        wait_timeout="50s",
    )
    result = resp.result
    if result is None or result.data_array is None:
        return []
    cols = [c.name for c in resp.manifest.schema.columns]
    return [dict(zip(cols, row)) for row in result.data_array]


def _row_to_report(r: dict[str, Any]) -> dict[str, Any]:
    actions = r.get("actions")
    try:
        parsed = json.loads(actions) if actions else []
    except (json.JSONDecodeError, TypeError):
        parsed = []
    return {
        "report_id": r.get("report_id"),
        "title": r.get("title"),
        "category": r.get("category"),
        "linked_anomaly": r.get("linked_anomaly"),
        "mpan_id": r.get("mpan_id"),
        "priority": r.get("priority"),
        "status": r.get("status"),
        "assignee": r.get("assignee"),
        "description": r.get("description"),
        "actions": parsed,
        "created_at": r.get("created_at"),
        "updated_at": r.get("updated_at"),
    }


# --- Models -----------------------------------------------------------------
class NewReport(BaseModel):
    title: str
    category: str
    mpan_id: str = "***----"
    priority: str = "medium"
    assignee: str = "Unassigned"
    description: str = ""


class NewAction(BaseModel):
    action: str
    status: str
    actor: str = "You"
    note: Optional[str] = None


# --- API --------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"ok": True, "table": TABLE, "warehouse": WAREHOUSE_ID}


@app.get("/api/reports")
def list_reports():
    rows = _run(
        f"SELECT report_id, title, category, linked_anomaly, mpan_id, priority, "
        f"status, assignee, description, actions, "
        f"date_format(created_at, \"yyyy-MM-dd'T'HH:mm:ssXXX\") AS created_at, "
        f"date_format(updated_at, \"yyyy-MM-dd'T'HH:mm:ssXXX\") AS updated_at "
        f"FROM {TABLE} ORDER BY updated_at DESC"
    )
    return [_row_to_report(r) for r in rows]


@app.post("/api/reports")
def create_report(body: NewReport):
    # Next id from the current max RPT-#### (server-authoritative).
    rows = _run(
        f"SELECT COALESCE(MAX(CAST(regexp_extract(report_id, '([0-9]+)', 1) AS INT)), 1000) AS m FROM {TABLE}"
    )
    next_seq = int(rows[0]["m"]) + 1 if rows else 1001
    report_id = f"RPT-{next_seq}"
    ts = _now()
    actions = [{"ts": ts, "actor": "You", "action": "Report created"}]
    actions_json = json.dumps(actions)

    _run(
        f"INSERT INTO {TABLE} VALUES ("
        f"{_sql_str(report_id)}, {_sql_str(body.title)}, {_sql_str(body.category)}, "
        f"NULL, {_sql_str(body.mpan_id)}, {_sql_str(body.priority)}, 'open', "
        f"{_sql_str(body.assignee)}, {_sql_str(body.description)}, {_sql_str(actions_json)}, "
        f"{_sql_str(ts)}::timestamp, {_sql_str(ts)}::timestamp)"
    )
    return _row_to_report(
        {
            "report_id": report_id,
            "title": body.title,
            "category": body.category,
            "linked_anomaly": None,
            "mpan_id": body.mpan_id,
            "priority": body.priority,
            "status": "open",
            "assignee": body.assignee,
            "description": body.description,
            "actions": actions_json,
            "created_at": ts,
            "updated_at": ts,
        }
    )


@app.post("/api/reports/{report_id}/actions")
def add_action(report_id: str, body: NewAction):
    rows = _run(f"SELECT actions FROM {TABLE} WHERE report_id = {_sql_str(report_id)}")
    if not rows:
        raise HTTPException(status_code=404, detail="Report not found")
    try:
        actions = json.loads(rows[0]["actions"]) if rows[0]["actions"] else []
    except (json.JSONDecodeError, TypeError):
        actions = []
    ts = _now()
    actions.append({"ts": ts, "actor": body.actor, "action": body.action, "note": body.note})
    actions_json = json.dumps(actions)
    _run(
        f"UPDATE {TABLE} SET status = {_sql_str(body.status)}, "
        f"actions = {_sql_str(actions_json)}, updated_at = {_sql_str(ts)}::timestamp "
        f"WHERE report_id = {_sql_str(report_id)}"
    )
    rows = _run(
        f"SELECT report_id, title, category, linked_anomaly, mpan_id, priority, "
        f"status, assignee, description, actions, "
        f"date_format(created_at, \"yyyy-MM-dd'T'HH:mm:ssXXX\") AS created_at, "
        f"date_format(updated_at, \"yyyy-MM-dd'T'HH:mm:ssXXX\") AS updated_at "
        f"FROM {TABLE} WHERE report_id = {_sql_str(report_id)}"
    )
    return _row_to_report(rows[0])


# --- Static frontend (must be mounted last) ---------------------------------
if os.path.isdir(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        # Serve real files; otherwise fall back to index.html for client routing.
        candidate = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
