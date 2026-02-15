# Databricks notebook source
# MAGIC %md
# MAGIC # 05_ml_anomaly_detection — Train model, MLflow, promote to Production, inference
# MAGIC
# MAGIC **Purpose:** Train Isolation Forest (or similar) on consumption patterns, log with MLflow, register model, promote to Production, run batch/streaming inference to populate anomalies table.
# MAGIC
# MAGIC **Prerequisites:** Gold consumption_half_hourly has data.
# MAGIC
# MAGIC **Runtime:** For best compatibility, use a cluster with **Databricks Runtime for ML** (MLflow is pre-installed). If you use a standard runtime and install MLflow via the notebook, you may see "Core Python package version(s) changed"—if so, **detach and re-attach** the notebook to reset the environment, then re-run.

# COMMAND ----------

CATALOG = "elexon_app_for_settlement_acc_catalog"
SCHEMA_GOLD = "gold"
MLFLOW_EXPERIMENT = "/Shared/elexon_anomaly"

# COMMAND ----------

# Install mlflow and typing_extensions (pydantic_core needs Sentinel from typing_extensions >= 4.0). Run this cell once.
# If you see "Core Python package version(s) changed", detach and re-attach the notebook, then re-run from the import cell below.
%pip install "typing_extensions>=4.0" mlflow --quiet

# COMMAND ----------

import mlflow
import mlflow.sklearn
from sklearn.ensemble import IsolationForest
import pandas as pd
from datetime import datetime

# COMMAND ----------

# Read consumption for training (aggregate per mpan + interval for feature vector)
spark.conf.set("spark.databricks.mlflow.trackUnityCatalogExperiments.enabled", "true")
df = spark.table(f"{CATALOG}.{SCHEMA_GOLD}.consumption_half_hourly")
# Features: kwh, hour_of_day, day_of_week (from interval_start_ts)
from pyspark.sql import functions as F
train_df = df.withColumn("hour", F.hour("interval_start_ts")) \
  .withColumn("day_of_week", F.dayofweek("interval_start_ts")) \
  .select("kwh", "hour", "day_of_week").limit(100000)
pandas_df = train_df.toPandas()

# COMMAND ----------

mlflow.set_experiment(MLFLOW_EXPERIMENT)
with mlflow.start_run(run_name="isolation_forest_v1") as run:
    model = IsolationForest(contamination=0.01, random_state=42)
    X = pandas_df[["kwh", "hour", "day_of_week"]]
    model.fit(X)
    pred = model.predict(X)
    score = model.score_samples(X)
    mlflow.sklearn.log_model(model, "model")
    mlflow.log_param("contamination", 0.01)
    mlflow.log_metric("samples", len(X))
    run_id = run.info.run_id

# COMMAND ----------

# Register model (workspace registry; use UC name if you have catalog.schema for models)
model_uri = f"runs:/{run_id}/model"
model_name = "elexon_anomaly_model"
registered = mlflow.register_model(model_uri, model_name)
version = registered.version

# COMMAND ----------

# Promote to Production
client = mlflow.tracking.MlflowClient()
client.transition_model_version_stage(name=model_name, version=version, stage="Production")

# COMMAND ----------

# Batch inference: score recent consumption and write anomalies
loaded = mlflow.sklearn.load_model(f"models:/{model_name}/Production")
inference_df = df.withColumn("hour", F.hour("interval_start_ts")).withColumn("day_of_week", F.dayofweek("interval_start_ts"))
inference_pdf = inference_df.select("mpan_id", "interval_start_ts", "kwh", "hour", "day_of_week").limit(50000).toPandas()
X_inf = inference_pdf[["kwh", "hour", "day_of_week"]]
inference_pdf["anomaly_score"] = -loaded.score_samples(X_inf)  # higher = more anomalous
inference_pdf["is_anomaly"] = loaded.predict(X_inf) == -1

# Filter to anomalies only and map to taxonomy
anomalies_pdf = inference_pdf[inference_pdf["is_anomaly"]].copy()
def map_type(score):
    if score > 0.9: return "theft"
    if score > 0.8: return "meter_malfunction"
    if score > 0.6: return "network_anomaly"
    return "maintenance"
anomalies_pdf["anomaly_type"] = anomalies_pdf["anomaly_score"].apply(map_type)
anomalies_pdf["severity"] = anomalies_pdf["anomaly_score"].apply(lambda s: "high" if s > 0.85 else "medium" if s > 0.7 else "low")
anomalies_pdf["anomaly_id"] = ["an_" + str(i) for i in range(len(anomalies_pdf))]
anomalies_pdf["created_at"] = datetime.utcnow()

# COMMAND ----------

# Write to gold.anomalies
anomalies_spark = spark.createDataFrame(
    anomalies_pdf[["anomaly_id", "mpan_id", "interval_start_ts", "kwh", "anomaly_score", "anomaly_type", "severity", "created_at"]]
)
anomalies_spark.write.format("delta").mode("append").saveAsTable(f"{CATALOG}.{SCHEMA_GOLD}.anomalies")
print("Anomalies written to gold.anomalies.")

# COMMAND ----------

# Update gold_anomalies for Delta Sharing
spark.sql(f"""
  CREATE OR REPLACE TABLE {CATALOG}.{SCHEMA_GOLD}.gold_anomalies AS
  SELECT anomaly_id, mpan_id, interval_start_ts, kwh, anomaly_score, anomaly_type, severity, created_at
  FROM {CATALOG}.{SCHEMA_GOLD}.anomalies
""")
print("ML pipeline complete: model in Production, anomalies table updated.")
