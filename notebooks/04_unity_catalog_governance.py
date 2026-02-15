# Databricks notebook source
# MAGIC %md
# MAGIC # 04_unity_catalog_governance — Groups, purpose-based access, masking, audit
# MAGIC
# MAGIC **Purpose:** Grant to Unity Catalog **groups** (BSC_SETTLEMENT, BSC_MARKET_MONITORING, BSC_RESEARCH, RECIPIENT_USER), purpose-based views, column masking on MPAN, and show audit. Unity Catalog uses account-level groups, not roles.
# MAGIC
# MAGIC **Prerequisites:** 00_setup and gold tables exist.

# COMMAND ----------

CATALOG = "elexon_app_for_settlement_acc_catalog"
SCHEMA_GOLD = "gold"
SCHEMA_RECIPIENT = "recipient_shared"

# COMMAND ----------

# Unity Catalog uses account-level GROUPS (CREATE ROLE is not supported).
# Create groups BSC_SETTLEMENT, BSC_MARKET_MONITORING, BSC_RESEARCH, RECIPIENT_USER in Account Console → Identity & access → Groups if they do not exist.
# Grant catalog/schema usage to those groups:
for group in ["BSC_SETTLEMENT", "BSC_MARKET_MONITORING", "BSC_RESEARCH"]:
    spark.sql(f"GRANT USAGE ON CATALOG {CATALOG} TO `{group}`")
    spark.sql(f"GRANT USAGE ON SCHEMA {CATALOG}.{SCHEMA_GOLD} TO `{group}`")

spark.sql(f"GRANT USAGE ON CATALOG {CATALOG} TO `RECIPIENT_USER`")
spark.sql(f"GRANT USAGE ON SCHEMA {CATALOG}.{SCHEMA_RECIPIENT} TO `RECIPIENT_USER`")

# COMMAND ----------

# Purpose-based views: settlement sees full detail; market_monitoring and research see tokenized only
# View for settlement (full mpan_id for authorised users)
spark.sql(f"""
  CREATE OR REPLACE VIEW {CATALOG}.{SCHEMA_GOLD}.v_settlement_consumption AS
  SELECT mpan_id, tokenized_mpan, interval_start_ts, kwh, ingested_at
  FROM {CATALOG}.{SCHEMA_GOLD}.consumption_half_hourly
""")
# View for market monitoring / research (tokenized only)
spark.sql(f"""
  CREATE OR REPLACE VIEW {CATALOG}.{SCHEMA_GOLD}.v_research_consumption AS
  SELECT tokenized_mpan AS mpan_display, interval_start_ts, kwh, ingested_at
  FROM {CATALOG}.{SCHEMA_GOLD}.consumption_half_hourly
""")

# COMMAND ----------

# Grant SELECT on views to groups (settlement gets v_settlement; others get v_research)
spark.sql(f"GRANT SELECT ON VIEW {CATALOG}.{SCHEMA_GOLD}.v_settlement_consumption TO `BSC_SETTLEMENT`")
spark.sql(f"GRANT SELECT ON VIEW {CATALOG}.{SCHEMA_GOLD}.v_research_consumption TO `BSC_MARKET_MONITORING`")
spark.sql(f"GRANT SELECT ON VIEW {CATALOG}.{SCHEMA_GOLD}.v_research_consumption TO `BSC_RESEARCH`")
spark.sql(f"GRANT SELECT ON TABLE {CATALOG}.{SCHEMA_GOLD}.anomalies TO `BSC_SETTLEMENT`")
spark.sql(f"GRANT SELECT ON TABLE {CATALOG}.{SCHEMA_GOLD}.anomalies TO `BSC_MARKET_MONITORING`")

# COMMAND ----------

# Column masking: in UC we can use mask function. Example (requires UC table with column mask):
# ALTER TABLE ... ALTER COLUMN mpan_id SET MASK mask_expression;
# For demo we use views that expose only tokenized_mpan for non-settlement roles (already above).

# Show grants
display(spark.sql(f"SHOW GRANTS ON CATALOG `{CATALOG}`"))
display(spark.sql(f"SHOW GRANTS ON SCHEMA {CATALOG}.{SCHEMA_GOLD}"))

# COMMAND ----------

# MAGIC %md
# MAGIC ## Audit
# MAGIC Unity Catalog records access in the account audit log. In **Account Console → Audit logs**, filter by resource (e.g. `elexon_app_for_settlement_acc_catalog`) to see who queried what and when. This evidences compliance for purpose-based access and PII handling.
