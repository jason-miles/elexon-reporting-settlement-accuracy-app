# PRD: Elexon Reporting Settlement Accuracy App

## Overview

Elexon manages settlement and reporting for the UK electricity market under the Balancing and Settlement Code (BSC). Suppliers must achieve **99% accuracy** for half-hourly (HH) metered energy settlement. This app demonstrates how **Databricks** can help energy market participants monitor settlement accuracy, validate reporting compliance, and surface insights from BSC data.

## Problem Statement

Energy suppliers and market participants face several challenges when managing Elexon BSC settlement reporting:

### 1. 99% Accuracy Compliance Pressure

Suppliers must settle 99% of total HH metered energy on actual meter readings. Manual tracking and spreadsheet-based monitoring make it difficult to detect drift before regulatory deadlines. Underperformance triggers Performance Assurance penalties.

### 2. Fragmented Data Sources

Settlement data flows from multiple systems: Elexon Portal, Insights Solution, MDM (Meter Data Manager), settlement runs, and reconciliation reports. No unified view exists across these sources for real-time accuracy monitoring.

### 3. Delayed Reconciliation

Settlement corrections, GSP scaling factors, and post-M10 adjustments can take days to propagate. Analysts rely on batch exports and manual cross-checks to identify discrepancies—often discovering issues too late for corrective action.

### 4. Limited Visibility & Audit Trail

Understanding *why* settlement accuracy dropped—whether due to meter configuration issues, LLF/GCF impacts, or data service problems—requires piecing together logs from disparate systems. There is no governed lineage from source data to final settlement reports.

## Proposed Solution

A **Databricks-powered application** that ingests Elexon settlement data, provides real-time accuracy dashboards, and enables governed analytics with AI-assisted insights.

### Architecture

```
Elexon Sources (Portal, Insights, MDM) → Lakeflow Pipeline → Delta Lake
                                                                    │
                                                                    ├── Unity Catalog (governance)
                                                                    ├── AI/BI Dashboards (accuracy KPIs)
                                                                    ├── Genie Space (natural language queries)
                                                                    └── Databricks App (interactive monitoring)
```

### Key Components

| Component | Databricks Product | Purpose |
|-----------|-------------------|---------|
| Data Ingestion | Lakeflow Pipeline | Ingest Elexon settlement data, meter reads, reconciliation outputs |
| Storage | Delta Lake | Unity Catalog tables for settlement, accuracy metrics, audit trail |
| Governance | Unity Catalog | Lineage, access control, audit for compliance |
| Analytics | Databricks SQL | Ad-hoc queries, settlement validation logic |
| Dashboards | AI/BI | Real-time accuracy KPIs, trend alerts |
| Exploration | Genie Space | Natural language questions on settlement data |
| App | Databricks Apps (APX) | Interactive monitoring UI, reporting workflows |

## Value Propositions

### Real-Time Accuracy Monitoring

Replace spreadsheet-based tracking with live dashboards. See settlement accuracy trends, drill into underperforming periods, and receive alerts before regulatory deadlines.

### Unified Data Platform

Single source of truth for all Elexon-related data. Lakeflow pipelines ingest from Portal, Insights, and MDM into governed Delta tables. No more manual exports or cross-system reconciliation.

### Governed Lineage & Audit

Unity Catalog provides end-to-end lineage from raw settlement data to final reports. Compliance teams can trace any metric back to source and demonstrate audit readiness.

### AI-Assisted Insights

Genie Space enables analysts to ask questions in natural language: "Which settlement periods had accuracy below 99% last month?" or "What caused the drop in accuracy for MPAN X?" without writing SQL.

## Demo Application

The demo app is a **Databricks APX application** that showcases settlement accuracy monitoring:

### App Routes

| Route | Feature | Description |
|-------|---------|-------------|
| `/dashboard` | Accuracy Dashboard | Live KPIs and trends for settlement accuracy |
| `/reports` | Settlement Reports | Reconciliation views and drill-down |
| `/alerts` | Accuracy Alerts | Configure and view thresholds, notifications |
| `/explore` | Genie Query | Natural language exploration of settlement data |

## Next Steps

| Phase | Timeline | Activities |
|-------|----------|------------|
| PoC Scoping | Proposed | Define data sources, success criteria, integration points |
| Data Ingestion | Week 1–2 | Design Lakeflow pipeline for Elexon data formats |
| Dashboard Design | Week 2–3 | Build AI/BI dashboards for accuracy KPIs |
| App Development | Week 3–4 | APX app with monitoring routes |
| Production Planning | Week 4–6 | Deployment, alerting, governance review |

## Meeting Context

- **Date**: March 2026
- **Location**: TBD
- **Attendees**: Energy market participants, Databricks Solutions Architecture
- **Co-branding**: Databricks × Elexon / Energy Sector
