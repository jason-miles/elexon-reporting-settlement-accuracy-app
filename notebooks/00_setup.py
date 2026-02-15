# Databricks notebook source
# MAGIC %md
# MAGIC # 00_setup — Elexon demo environment
# MAGIC
# MAGIC **Purpose:** Create catalog, schemas, tables, roles, grants, and load sample/synthetic data in one run.
# MAGIC
# MAGIC **Prerequisites:** Unity Catalog enabled; workspace admin or catalog-level privileges.
# MAGIC
# MAGIC **Region:** UK South (no hard dependency).
# MAGIC
# MAGIC **Run:** Execute all cells in order.

# COMMAND ----------

# MAGIC %md
# MAGIC ## No "Create catalog" in the UI? Use an existing catalog (easiest)
# MAGIC
# MAGIC If the Catalog **+** menu only shows "Add data", "Create volume", etc. (no "Create catalog"), your account may restrict catalog creation to admins. **Use a catalog you already have.**
# MAGIC
# MAGIC 1. In the **Config** cell below, set **`CATALOG`** to your existing catalog name (e.g. **`elexon_app_for_settle`** — you should see it under "My organization" in Catalog).
# MAGIC 2. Set **`CREATE_CATALOG_IN_UI = True`** so the notebook skips creating a catalog and only creates schemas and tables inside that catalog.
# MAGIC 3. **Run all.** Everything will be created under your existing catalog.
# MAGIC 4. When you run notebooks **01** through **06**, set **`CATALOG`** to the same name at the top of each notebook.
# MAGIC
# MAGIC ---
# MAGIC ## If you see "Metastore storage root URL does not exist"
# MAGIC
# MAGIC (Only if you are trying to create a *new* catalog.) Unity Catalog needs a storage location. Do **one** of the following:
# MAGIC
# MAGIC ### Option A — Use an existing catalog (recommended if you don't see "Create catalog")
# MAGIC Set **`CATALOG`** to an existing catalog (e.g. `elexon_app_for_settle`) and **`CREATE_CATALOG_IN_UI = True`** in the Config cell. Then re-run.
# MAGIC
# MAGIC ### Option B — Create catalog in the UI (if your admin enabled it)
# MAGIC Some workspaces have **Create catalog** in the **Account** console (account-level), not in the workspace Catalog pane. Ask your metastore/account admin to create a catalog named `elexon_demo` with Default Storage, then set **`CREATE_CATALOG_IN_UI = True`** and re-run.
# MAGIC
# MAGIC ### Option C — Use a managed location path
# MAGIC Set **`MANAGED_LOCATION`** in the Config cell to your cloud path (e.g. `abfss://...` or `s3://...`) and re-run.

# COMMAND ----------

# Config: catalog and schemas (medallion + recipient)
# Use an existing catalog if you don't have "Create catalog" in the UI (e.g. elexon_app_for_settle):
CATALOG = "elexon_app_for_settle"  # or "elexon_demo" if you created that catalog
SCHEMA_BRONZE = "bronze"
SCHEMA_SILVER = "silver"
SCHEMA_GOLD = "gold"
SCHEMA_RECIPIENT = "recipient_shared"

# Skip creating the catalog (use existing): set True when using a catalog that already exists
CREATE_CATALOG_IN_UI = True
# Only if creating a new catalog and you need to specify storage path:
MANAGED_LOCATION = None  # e.g. "abfss://container@storage.dfs.core.windows.net/elexon_demo" or "s3://bucket/elexon_demo"

# COMMAND ----------

# MAGIC %md
# MAGIC **If you get "Catalog '...' was not found":** Run the next cell to list catalogs you can use, then set **`CATALOG`** in the Config cell above to one of the names (exact spelling).

# COMMAND ----------

# Uncomment and run to see available catalog names, then set CATALOG in the Config cell to one of them:
# spark.sql("SHOW CATALOGS").show(100, truncate=False)

# COMMAND ----------

def ensure_catalog_and_schemas():
    """Create catalog if needed, then create schemas. Handles 'catalog not found' when using existing catalog."""
    def create_schemas():
        spark.sql(f"CREATE SCHEMA IF NOT EXISTS {CATALOG}.{SCHEMA_BRONZE}")
        spark.sql(f"CREATE SCHEMA IF NOT EXISTS {CATALOG}.{SCHEMA_SILVER}")
        spark.sql(f"CREATE SCHEMA IF NOT EXISTS {CATALOG}.{SCHEMA_GOLD}")
        spark.sql(f"CREATE SCHEMA IF NOT EXISTS {CATALOG}.{SCHEMA_RECIPIENT}")

    if not CREATE_CATALOG_IN_UI:
        if MANAGED_LOCATION:
            spark.sql(f"CREATE CATALOG IF NOT EXISTS {CATALOG} MANAGED LOCATION '{MANAGED_LOCATION}'")
        else:
            try:
                spark.sql(f"CREATE CATALOG IF NOT EXISTS {CATALOG}")
            except Exception as e:
                if "Metastore storage root URL does not exist" in str(e) or "MANAGED LOCATION" in str(e):
                    print("ERROR: Catalog needs a storage location. Set MANAGED_LOCATION in the config cell (e.g. abfss://... or s3://...) or ask your admin to create the catalog.")
                raise
        create_schemas()
    else:
        try:
            create_schemas()
        except Exception as e:
            if "NO_SUCH_CATALOG" in str(e) or "was not found" in str(e):
                print(f"Catalog '{CATALOG}' not found. Trying to create it...")
                if MANAGED_LOCATION:
                    spark.sql(f"CREATE CATALOG IF NOT EXISTS {CATALOG} MANAGED LOCATION '{MANAGED_LOCATION}'")
                else:
                    try:
                        spark.sql(f"CREATE CATALOG IF NOT EXISTS {CATALOG}")
                    except Exception as e2:
                        print("ERROR: Could not create catalog. Set MANAGED_LOCATION to your cloud path (e.g. abfss://container@store.dfs.core.windows.net/elexon_demo), or set CATALOG to an existing catalog name. Run: spark.sql('SHOW CATALOGS').show() to list catalogs.")
                        raise
                create_schemas()
            else:
                raise
    print("Catalog and schemas created.")

ensure_catalog_and_schemas()

# COMMAND ----------

# Bronze: raw half-hourly consumption
spark.sql(f"""
  CREATE TABLE IF NOT EXISTS {CATALOG}.{SCHEMA_BRONZE}.consumption_raw (
    household_id BIGINT,
    mpan_id STRING,
    interval_start_ts TIMESTAMP,
    kwh DOUBLE,
    source_file STRING,
    ingested_at TIMESTAMP
  ) USING DELTA
  TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true')
""")
print("Bronze consumption_raw created.")

# COMMAND ----------

# Silver: cleaned, deduped (created by 02_transform_silver; placeholder here)
spark.sql(f"""
  CREATE TABLE IF NOT EXISTS {CATALOG}.{SCHEMA_SILVER}.consumption_cleaned (
    mpan_id STRING,
    interval_start_ts TIMESTAMP,
    kwh DOUBLE,
    source_file STRING,
    ingested_at TIMESTAMP,
    _dedupe_key STRING
  ) USING DELTA
  TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true')
""")
print("Silver consumption_cleaned created.")

# COMMAND ----------

# Gold: consumption half-hourly (tokenized_mpan for governance)
spark.sql(f"""
  CREATE TABLE IF NOT EXISTS {CATALOG}.{SCHEMA_GOLD}.consumption_half_hourly (
    mpan_id STRING,
    tokenized_mpan STRING,
    interval_start_ts TIMESTAMP,
    kwh DOUBLE,
    source_file STRING,
    ingested_at TIMESTAMP
  ) USING DELTA
  TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true', 'delta.autoOptimize.autoCompact' = 'true')
""")

# Gold: anomalies (populated by ML inference)
spark.sql(f"""
  CREATE TABLE IF NOT EXISTS {CATALOG}.{SCHEMA_GOLD}.anomalies (
    anomaly_id STRING,
    mpan_id STRING,
    interval_start_ts TIMESTAMP,
    kwh DOUBLE,
    anomaly_score DOUBLE,
    anomaly_type STRING,
    severity STRING,
    created_at TIMESTAMP
  ) USING DELTA
""")
print("Gold tables created.")

# COMMAND ----------

# Generate and load synthetic consumption (no real MPANs)
import hashlib
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, LongType, StringType, DoubleType, TimestampType
from datetime import datetime, timedelta

def fake_mpan(household_id):
    base = 2000000000000 + (household_id % 10_000_000_000)
    return str(base).zfill(13)

def tokenize_mpan(mpan):
    return "***" + hashlib.sha256(mpan.encode()).hexdigest()[:4]

rows = []
start = datetime(2024, 1, 1, 0, 0, 0)
interval = timedelta(minutes=30)
for day in range(14):
    for hh in range(500):
        mpan = fake_mpan(hh)
        for h in range(48):
            ts = start + timedelta(days=day) + h * interval
            kwh = round(0.3 + 0.4 * (1 + (h/48 - 0.5)**2) * (0.8 + 0.4 * (hh % 10) / 10), 4)
            rows.append((hh, mpan, ts, kwh, "synthetic", datetime.utcnow()))

schema = StructType([
    StructField("household_id", LongType()),
    StructField("mpan_id", StringType()),
    StructField("interval_start_ts", TimestampType()),
    StructField("kwh", DoubleType()),
    StructField("source_file", StringType()),
    StructField("ingested_at", TimestampType()),
])
df = spark.createDataFrame(rows, schema)
tokenize_udf = F.udf(tokenize_mpan, StringType())
df = df.withColumn("tokenized_mpan", tokenize_udf(F.col("mpan_id")))

# Write to bronze (append)
df_bronze = df.select("household_id", "mpan_id", "interval_start_ts", "kwh", "source_file", "ingested_at")
df_bronze.write.format("delta").mode("append").saveAsTable(f"{CATALOG}.{SCHEMA_BRONZE}.consumption_raw")
print("Synthetic data written to bronze.")

# COMMAND ----------

# Seed gold consumption (simplified: copy from bronze with tokenized_mpan for demo)
df_gold = df.select(
    F.col("mpan_id"),
    F.col("tokenized_mpan"),
    F.col("interval_start_ts"),
    F.col("kwh"),
    F.col("source_file"),
    F.col("ingested_at"),
)
df_gold.write.format("delta").mode("overwrite").saveAsTable(f"{CATALOG}.{SCHEMA_GOLD}.consumption_half_hourly")
print("Gold consumption_half_hourly seeded.")

# COMMAND ----------

# Seed sample anomalies for app demo
from pyspark.sql import Row
anomaly_rows = [
    Row(anomaly_id="a1", mpan_id="***4567", interval_start_ts=datetime(2024, 2, 15, 8, 0), kwh=0.0, anomaly_score=0.92, anomaly_type="meter_malfunction", severity="high", created_at=datetime(2024, 2, 15, 8, 35)),
    Row(anomaly_id="a2", mpan_id="***8821", interval_start_ts=datetime(2024, 2, 15, 6, 30), kwh=12.8, anomaly_score=0.88, anomaly_type="theft", severity="high", created_at=datetime(2024, 2, 15, 7, 2)),
    Row(anomaly_id="a3", mpan_id="***1203", interval_start_ts=datetime(2024, 2, 15, 5, 0), kwh=45.2, anomaly_score=0.79, anomaly_type="network_anomaly", severity="medium", created_at=datetime(2024, 2, 15, 5, 32)),
]
spark.createDataFrame(anomaly_rows).write.format("delta").mode("overwrite").saveAsTable(f"{CATALOG}.{SCHEMA_GOLD}.anomalies")
print("Sample anomalies seeded.")

# COMMAND ----------

# Create roles and grant (run with sufficient privileges)
# Roles: BSC_SETTLEMENT, BSC_MARKET_MONITORING, BSC_RESEARCH, RECIPIENT_USER
for role in ["BSC_SETTLEMENT", "BSC_MARKET_MONITORING", "BSC_RESEARCH", "RECIPIENT_USER"]:
    spark.sql(f"CREATE ROLE IF NOT EXISTS `{CATALOG}`.`{role}`")
spark.sql(f"GRANT USAGE ON CATALOG {CATALOG} TO `{CATALOG}`.`BSC_SETTLEMENT`")
spark.sql(f"GRANT USAGE ON SCHEMA {CATALOG}.{SCHEMA_GOLD} TO `{CATALOG}`.`BSC_SETTLEMENT`")
spark.sql(f"GRANT SELECT ON TABLE {CATALOG}.{SCHEMA_GOLD}.consumption_half_hourly TO `{CATALOG}`.`BSC_SETTLEMENT`")
spark.sql(f"GRANT SELECT ON TABLE {CATALOG}.{SCHEMA_GOLD}.anomalies TO `{CATALOG}`.`BSC_SETTLEMENT`")
# Repeat for other roles as needed; RECIPIENT_USER gets only recipient_shared
spark.sql(f"GRANT USAGE ON SCHEMA {CATALOG}.{SCHEMA_RECIPIENT} TO `{CATALOG}`.`RECIPIENT_USER`")
print("Roles and grants applied. Add users/groups to roles in Unity Catalog UI as needed.")

# COMMAND ----------

# Create curated tables for Delta Sharing (views or copies)
spark.sql(f"""
  CREATE OR REPLACE TABLE {CATALOG}.{SCHEMA_GOLD}.gold_consumption_curated AS
  SELECT tokenized_mpan AS mpan_display, interval_start_ts, kwh, ingested_at
  FROM {CATALOG}.{SCHEMA_GOLD}.consumption_half_hourly
  LIMIT 10000
""")
spark.sql(f"""
  CREATE OR REPLACE TABLE {CATALOG}.{SCHEMA_GOLD}.gold_anomalies AS
  SELECT anomaly_id, mpan_id, interval_start_ts, kwh, anomaly_score, anomaly_type, severity, created_at
  FROM {CATALOG}.{SCHEMA_GOLD}.anomalies
""")
print("Curated gold tables for sharing created.")

# COMMAND ----------

# OPTIMIZE / ZORDER for performance (optional, run after data load)
spark.sql(f"OPTIMIZE {CATALOG}.{SCHEMA_GOLD}.consumption_half_hourly ZORDER BY (interval_start_ts, mpan_id)")
spark.sql(f"OPTIMIZE {CATALOG}.{SCHEMA_GOLD}.anomalies ZORDER BY (created_at)")
print("Setup complete. Run 01_ingest_bronze, 02_transform_silver, 03_curate_gold next.")
