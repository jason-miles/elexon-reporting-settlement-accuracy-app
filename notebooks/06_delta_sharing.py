# Databricks notebook source
# MAGIC %md
# MAGIC # 06_delta_sharing — Provider share to Recipient
# MAGIC
# MAGIC **Purpose:** Create Delta Share, add curated tables (gold_consumption_curated, gold_anomalies), and document Recipient setup. Simulate Provider vs Recipient visibility in the app.
# MAGIC
# MAGIC **Prerequisites:** Gold curated tables exist (00_setup or 03_curate_gold).
# MAGIC
# MAGIC **Permission:** Creating a Delta Share requires **CREATE SHARE** on the metastore. If you see `PERMISSION_DENIED`, ask your metastore admin to grant this privilege, or run this notebook as a user with that permission.

# COMMAND ----------

CATALOG = "elexon_app_for_settlement_acc_catalog"
SCHEMA_GOLD = "gold"
SHARE_NAME = "elexon_consumption_share"

# COMMAND ----------

# Create share (Provider side). Requires CREATE SHARE on metastore.
share_created = False
try:
    spark.sql(f"CREATE SHARE IF NOT EXISTS `{SHARE_NAME}`")
    share_created = True
    print(f"Share '{SHARE_NAME}' created or already exists.")
except Exception as e:
    err = str(e)
    if "PERMISSION_DENIED" in err or "CREATE SHARE" in err or "UNAUTHORIZED" in err:
        print("PERMISSION_DENIED: You need CREATE SHARE on the metastore.")
        print("Ask your metastore admin to grant it. See notebook header for details.")
        print("Skipping remaining Delta Sharing cells.")
    else:
        raise

# COMMAND ----------

# Add tables to share (only curated, no raw PII). Skip if share was not created.
if share_created:
    spark.sql(f"ALTER SHARE `{SHARE_NAME}` ADD TABLE {CATALOG}.{SCHEMA_GOLD}.gold_consumption_curated")
    spark.sql(f"ALTER SHARE `{SHARE_NAME}` ADD TABLE {CATALOG}.{SCHEMA_GOLD}.gold_anomalies")
    print("Tables added to share.")
else:
    print("Skipped (share not created in previous cell).")

# COMMAND ----------

# List share contents. Skip if share was not created.
if share_created:
    display(spark.sql(f"SHOW ALL IN SHARE `{SHARE_NAME}`"))
else:
    print("Skipped (share not created). See Recipient setup section below for when you have permission.")

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
