"""
Human-readable governance policy explanations for the app (Governance & Consent tab).
"""
from typing import List, Dict, Any

ANOMALY_TAXONOMY = [
    {"id": "theft", "label": "Theft / bypass suspicion", "description": "Unexpected drop or bypass pattern."},
    {"id": "meter_malfunction", "label": "Meter malfunction / stuck readings", "description": "Repeated identical or zero variance."},
    {"id": "network_anomaly", "label": "Network anomaly (local cluster spike)", "description": "Cluster-wide spike or drop."},
    {"id": "maintenance", "label": "Maintenance needed (drift / repeated outliers)", "description": "Drift or repeated outliers."},
]


def get_anomaly_taxonomy() -> List[Dict[str, Any]]:
    return ANOMALY_TAXONOMY


def masking_explanation() -> str:
    return (
        "MPAN is treated as PII. Raw mpan_id is stored in a restricted table; "
        "broader roles see tokenized_mpan (hash/tokenized) only. Row filters may further limit by region or purpose."
    )


def audit_explanation() -> str:
    return (
        "Unity Catalog records access to tables and views in the account audit log. "
        "Use Account Console > Audit logs (or system.information_schema.access where available) to evidence compliance."
    )
