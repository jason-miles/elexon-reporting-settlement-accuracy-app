# Databricks notebook source
# MAGIC %md
# MAGIC # 02_transform_silver — Clean, dedupe, 48h watermark
# MAGIC
# MAGIC **Purpose:** Read bronze, clean, deduplicate by (mpan_id, interval_start_ts), apply 48h late-arrival watermark.
# MAGIC
# MAGIC **Prerequisites:** 01_ingest_bronze has written to bronze.consumption_raw.

# COMMAND ----------

CATALOG = "elexon_demo"
SCHEMA_BRONZE = "bronze"
SCHEMA_SILVER = "silver"
TABLE_RAW = "consumption_raw"
TABLE_CLEANED = "consumption_cleaned"
WATERMARK_HOURS = 48

# COMMAND ----------

from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Read bronze
df = spark.table(f"{CATALOG}.{SCHEMA_BRONZE}.{TABLE_RAW}")

# 48h watermark: drop data older than (max_ts - 48h) for late arrivals
max_ts = df.agg(F.max("interval_start_ts")).collect()[0][0]
if max_ts:
    watermark_ts = F.expr(f"timestamp_sub(interval_start_ts, {WATERMARK_HOURS} * 24)")
    # Keep only records with interval_start_ts >= (max - 48h)
    cutoff = max_ts - __import__("datetime").timedelta(hours=WATERMARK_HOURS)
    df = df.filter(F.col("interval_start_ts") >= F.lit(cutoff))

# Dedupe by (mpan_id, interval_start_ts) — keep latest ingested_at
win = Window.partitionBy("mpan_id", "interval_start_ts").orderBy(F.col("ingested_at").desc())
df = df.withColumn("_rn", F.row_number().over(win)).filter(F.col("_rn") == 1).drop("_rn")

# Add dedupe key for idempotency
df = df.withColumn("_dedupe_key", F.sha2(F.concat_ws("|", "mpan_id", F.col("interval_start_ts").cast("string")), 256))

# COMMAND ----------

# Write to silver (merge or overwrite for demo)
df.write.format("delta").mode("overwrite").saveAsTable(f"{CATALOG}.{SCHEMA_SILVER}.{TABLE_CLEANED}")
print("Silver consumption_cleaned written (deduped, 48h watermark applied).")
