-- Reference DDL for bronze/silver/gold consumption and anomalies.
-- Actual tables are created in 00_setup and pipeline notebooks.

-- Bronze: raw half-hourly consumption (household_id, ts, kwh)
-- Silver: cleaned, deduped by (mpan_id, interval_start_ts), 48h watermark
-- Gold: consumption_half_hourly, consumption_daily_agg, features, anomalies

-- Gold consumption (example)
CREATE TABLE IF NOT EXISTS elexon_demo.gold.consumption_half_hourly (
  mpan_id STRING,
  tokenized_mpan STRING,
  interval_start_ts TIMESTAMP,
  kwh DOUBLE,
  source_file STRING,
  ingested_at TIMESTAMP
) USING DELTA
TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true', 'delta.autoOptimize.autoCompact' = 'true');

-- Gold anomalies
CREATE TABLE IF NOT EXISTS elexon_demo.gold.anomalies (
  anomaly_id STRING,
  mpan_id STRING,
  interval_start_ts TIMESTAMP,
  kwh DOUBLE,
  anomaly_score DOUBLE,
  anomaly_type STRING,
  severity STRING,
  created_at TIMESTAMP
) USING DELTA;
