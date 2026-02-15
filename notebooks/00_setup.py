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

# Config: catalog and schemas (medallion + recipient)
CATALOG = "elexon_demo"
SCHEMA_BRONZE = "bronze"
SCHEMA_SILVER = "silver"
SCHEMA_GOLD = "gold"
SCHEMA_RECIPIENT = "recipient_shared"

# COMMAND ----------

# Create catalog and schemas
spark.sql(f"CREATE CATALOG IF NOT EXISTS {CATALOG}")
spark.sql(f"CREATE SCHEMA IF NOT EXISTS {CATALOG}.{SCHEMA_BRONZE}")
spark.sql(f"CREATE SCHEMA IF NOT EXISTS {CATALOG}.{SCHEMA_SILVER}")
spark.sql(f"CREATE SCHEMA IF NOT EXISTS {CATALOG}.{SCHEMA_GOLD}")
spark.sql(f"CREATE SCHEMA IF NOT EXISTS {CATALOG}.{SCHEMA_RECIPIENT}")
print("Catalog and schemas created.")

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
