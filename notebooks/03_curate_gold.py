# Databricks notebook source
# MAGIC %md
# MAGIC # 03_curate_gold — Aggregations, features, anomaly outputs
# MAGIC
# MAGIC **Purpose:** Build gold consumption_half_hourly (with tokenized_mpan), daily aggregates, and feed anomaly table from ML inference.
# MAGIC
# MAGIC **Prerequisites:** 02_transform_silver; 05_ml_anomaly_detection can write anomalies here or separately.

# COMMAND ----------

CATALOG = "elexon_app_for_settlement_acc_catalog"
SCHEMA_SILVER = "silver"
SCHEMA_GOLD = "gold"
TABLE_CLEANED = "consumption_cleaned"

# COMMAND ----------

from pyspark.sql import functions as F
import hashlib

def tokenize_udf(mpan):
    if mpan is None:
        return None
    return "***" + hashlib.sha256(str(mpan).encode()).hexdigest()[:4]

spark.udf.register("tokenize_mpan", tokenize_udf)

# COMMAND ----------

# Gold consumption: add tokenized_mpan for governance
silver = spark.table(f"{CATALOG}.{SCHEMA_SILVER}.{TABLE_CLEANED}")
gold_consumption = silver.select(
    F.col("mpan_id"),
    F.expr("tokenize_mpan(mpan_id)").alias("tokenized_mpan"),
    F.col("interval_start_ts"),
    F.col("kwh"),
    F.col("source_file"),
    F.col("ingested_at"),
)
gold_consumption.write.format("delta").mode("overwrite").saveAsTable(f"{CATALOG}.{SCHEMA_GOLD}.consumption_half_hourly")
print("Gold consumption_half_hourly updated.")

# COMMAND ----------

# Daily aggregation (optional)
gold_daily = silver.groupBy(
    F.col("mpan_id"),
    F.date_trunc("day", F.col("interval_start_ts")).alias("day"),
).agg(
    F.sum("kwh").alias("total_kwh"),
    F.count("*").alias("readings"),
)
gold_daily.write.format("delta").mode("overwrite").saveAsTable(f"{CATALOG}.{SCHEMA_GOLD}.consumption_daily_agg")
print("Gold consumption_daily_agg updated.")

# COMMAND ----------

# Curated tables for Delta Sharing (subset for Recipient)
spark.sql(f"""
  CREATE OR REPLACE TABLE {CATALOG}.{SCHEMA_GOLD}.gold_consumption_curated AS
  SELECT tokenize_mpan(mpan_id) AS mpan_display, interval_start_ts, kwh, ingested_at
  FROM {CATALOG}.{SCHEMA_GOLD}.consumption_half_hourly
""")
# Anomalies table is populated by 05_ml_anomaly_detection; ensure it exists
spark.sql(f"""
  CREATE TABLE IF NOT EXISTS {CATALOG}.{SCHEMA_GOLD}.gold_anomalies (
    anomaly_id STRING, mpan_id STRING, interval_start_ts TIMESTAMP, kwh DOUBLE,
    anomaly_score DOUBLE, anomaly_type STRING, severity STRING, created_at TIMESTAMP
  ) USING DELTA
""")
print("Gold curation complete.")
