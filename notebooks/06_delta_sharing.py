# Databricks notebook source
# MAGIC %md
# MAGIC # 06_delta_sharing — Provider share to Recipient
# MAGIC
# MAGIC **Purpose:** Create Delta Share, add curated tables (gold_consumption_curated, gold_anomalies), and document Recipient setup. Simulate Provider vs Recipient visibility in the app.
# MAGIC
# MAGIC **Prerequisites:** Gold curated tables exist (00_setup or 03_curate_gold).

# COMMAND ----------

CATALOG = "elexon_app_for_settlement_acc_catalog"
SCHEMA_GOLD = "gold"
SHARE_NAME = "elexon_consumption_share"

# COMMAND ----------

# Create share (Provider side)
spark.sql(f"CREATE SHARE IF NOT EXISTS {SHARE_NAME}")

# COMMAND ----------

# Add tables to share (only curated, no raw PII)
spark.sql(f"ALTER SHARE {SHARE_NAME} ADD TABLE {CATALOG}.{SCHEMA_GOLD}.gold_consumption_curated")
spark.sql(f"ALTER SHARE {SHARE_NAME} ADD TABLE {CATALOG}.{SCHEMA_GOLD}.gold_anomalies")

# COMMAND ----------

# List share contents
display(spark.sql(f"SHOW ALL IN SHARE {SHARE_NAME}"))

# COMMAND ----------

# MAGIC %md
# MAGIC ## Recipient setup (run in Recipient workspace or account)
# MAGIC 1. Provider shares the share URL and credential (Delta Sharing server URL + token or OAuth).
# MAGIC 2. In Recipient workspace:
# MAGIC    - Create a connection (Settings → Data → Delta Sharing) using the Provider's share URL and credential.
# MAGIC    - Create catalog from share: `CREATE CATALOG IF NOT EXISTS elexon_shared USING delta_sharing LOCATION '<share_url>' WITH CREDENTIAL <credential>;`
# MAGIC 3. Recipient can then query: `SELECT * FROM elexon_shared.default.gold_consumption_curated` (schema/table names as exposed by the share).
# MAGIC
# MAGIC In the app, the **Data Sharing** tab shows Provider vs Recipient visible tables; Recipient sees only the shared tables above.
