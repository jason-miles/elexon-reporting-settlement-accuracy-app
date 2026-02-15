"""
Data access helpers for Unity Catalog tables.
Used by notebooks and app backend; assumes Spark session and SQL warehouse available.
"""
from typing import Optional, List, Any
import json


def get_warehouse_query(sql: str, warehouse_id: Optional[str] = None) -> str:
    """Return SQL to run against the specified warehouse (for app/REST)."""
    return sql


def consumption_summary_sql(catalog: str = "elexon_app_for_settlement_acc_catalog", schema: str = "gold") -> str:
    """High-level KPIs from gold consumption/aggregates."""
    return f"""
    SELECT
      count(DISTINCT mpan_id) AS total_mpans,
      sum(kwh) AS total_kwh,
      count(*) AS total_readings,
      max(interval_start_ts) AS latest_reading_ts
    FROM {catalog}.{schema}.consumption_half_hourly
    WHERE interval_start_ts >= current_timestamp() - INTERVAL 7 DAYS
    """


def anomalies_recent_sql(
    catalog: str = "elexon_app_for_settlement_acc_catalog",
    schema: str = "gold",
    limit: int = 100,
) -> str:
    """Recent anomalies for Streaming Anomalies tab."""
    return f"""
    SELECT
      anomaly_id,
      mpan_id,
      interval_start_ts,
      kwh,
      anomaly_score,
      anomaly_type,
      severity,
      created_at
    FROM {catalog}.{schema}.anomalies
    ORDER BY created_at DESC
    LIMIT {limit}
    """


def governance_grants_sql(catalog: str = "elexon_app_for_settlement_acc_catalog") -> str:
    """Example: list grants on catalog/schemas (for Governance tab narrative)."""
    return f"""
    SHOW GRANTS ON CATALOG `{catalog}`
    """


def recipient_visible_tables_sql(recipient_schema: str = "recipient_shared") -> str:
    """What the Recipient can see (shared tables)."""
    return f"""
    SHOW TABLES IN {recipient_schema}
    """


def audit_events_example_sql() -> str:
    """Example query to fetch audit events (Unity Catalog audit log)."""
    return """
    -- In production, query system.information_schema.access or account-level audit logs.
    -- Example pattern (adapt to your workspace):
    -- SELECT * FROM system.access.audit WHERE request_params.full_name_arg LIKE '%elexon_app_for_settlement_acc_catalog%'
    SELECT 'Audit events available in Account Console > Audit logs' AS note
    """


def run_sql(spark_or_sql_runner: Any, sql: str) -> Any:
    """Run SQL and return result (Spark or SQL warehouse runner)."""
    if hasattr(spark_or_sql_runner, "sql"):
        return spark_or_sql_runner.sql(sql)
    raise NotImplementedError("Provide a Spark session or SQL runner with .sql()")


def as_json_rows(df: Any) -> List[dict]:
    """Convert Spark DataFrame to list of dicts for API/UI."""
    if df is None:
        return []
    return [row.asDict() for row in df.collect()]
