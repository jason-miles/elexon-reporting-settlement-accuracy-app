# Databricks notebook source
# MAGIC %md
# MAGIC # 01_ingest_bronze — Raw consumption ingestion
# MAGIC
# MAGIC **Purpose:** Ingest half-hourly consumption into bronze (Auto Loader or batch + incremental).
# MAGIC
# MAGIC **Prerequisites:** 00_setup run; source data in cloud storage or use synthetic generator.
# MAGIC
# MAGIC **Options:** Auto Loader from cloud path, or batch read from CSV/Parquet. This notebook uses batch + optional incremental.
# MAGIC
# MAGIC **Note:** Source path uses a Unity Catalog Volume (`/Volumes/.../consumption_data/consumption_in`) because the public DBFS root (`/tmp`) is disabled on many workspaces (e.g. serverless).

# COMMAND ----------

CATALOG = "elexon_app_for_settlement_acc_catalog"
SCHEMA_BRONZE = "bronze"
TABLE_RAW = "consumption_raw"

# Use Unity Catalog Volume (public DBFS root /tmp is disabled on many workspaces, especially serverless)
# Volume consumption_data must exist in bronze schema; created in next cell if missing
SOURCE_PATH = f"/Volumes/{CATALOG}/{SCHEMA_BRONZE}/consumption_data/consumption_in"

# COMMAND ----------

# Ensure Unity Catalog Volume exists (required when /tmp is disabled)
spark.sql(f"CREATE VOLUME IF NOT EXISTS {CATALOG}.{SCHEMA_BRONZE}.consumption_data")
# Create the consumption_in directory inside the volume
dbutils.fs.mkdirs(SOURCE_PATH)

# COMMAND ----------

# Batch read from CSV (e.g. London-style or synthetic)
# If SOURCE_PATH has CSV files:
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, LongType, StringType, DoubleType, TimestampType
from datetime import datetime

# Option A: read CSV if present
try:
    df = spark.read.schema(
        StructType([
            StructField("household_id", LongType()),
            StructField("mpan_id", StringType()),
            StructField("interval_start_ts", TimestampType()),
            StructField("kwh", DoubleType()),
        ])
    ).option("header", "true").csv(SOURCE_PATH)
    df = df.withColumn("source_file", F.lit("csv_ingest")).withColumn("ingested_at", F.current_timestamp())
except Exception:
    # Option B: no CSV — generate a small batch for demo
    import hashlib
    def tokenize(m):
        return "***" + hashlib.sha256(str(m).encode()).hexdigest()[:4]
    rows = []
    start = datetime.utcnow()
    for day in range(1):
        for hh in range(100):
            mpan = str(2000000000000 + (hh % 10000)).zfill(13)
            for h in range(48):
                ts = datetime(2024, 2, 14, 0, 0) + __import__("datetime").timedelta(days=day, minutes=h*30)
                kwh = round(0.3 + 0.3 * (hh % 5) / 5, 4)
                rows.append((hh, mpan, ts, kwh, "batch_synthetic", datetime.utcnow()))
    schema = StructType([
        StructField("household_id", LongType()),
        StructField("mpan_id", StringType()),
        StructField("interval_start_ts", TimestampType()),
        StructField("kwh", DoubleType()),
        StructField("source_file", StringType()),
        StructField("ingested_at", TimestampType()),
    ])
    df = spark.createDataFrame(rows, schema)

# COMMAND ----------

# Append to bronze
df.select("household_id", "mpan_id", "interval_start_ts", "kwh", "source_file", "ingested_at") \
  .write.format("delta").mode("append").saveAsTable(f"{CATALOG}.{SCHEMA_BRONZE}.{TABLE_RAW}")
print("Bronze ingestion complete.")
