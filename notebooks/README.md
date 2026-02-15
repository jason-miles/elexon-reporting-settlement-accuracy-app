# Databricks notebooks

Run in order:

1. **00_setup** – Catalog, schemas, tables, roles, grants, sample/synthetic data.
2. **01_ingest_bronze** – Ingest raw consumption (Auto Loader or batch) into bronze.
3. **02_transform_silver** – Clean, dedupe, 48h watermark into silver.
4. **03_curate_gold** – Aggregations, features, anomaly outputs.
5. **04_unity_catalog_governance** – Roles, purpose-based views, MPAN masking, audit.
6. **05_ml_anomaly_detection** – Train model, MLflow, register, promote to Production, inference.
7. **06_delta_sharing** – Provider share config, Recipient simulation.

Each notebook has a short README block at the top with prerequisites and instructions.
