"""
Auth and purpose-based access helpers for narrative display in the app.
Not for enforcing security (Unity Catalog enforces); for explaining who can see what.
"""
from typing import List, Dict, Any

PURPOSES = [
    "settlement",
    "market_monitoring",
    "research",
]

ROLE_PURPOSE_MAP = {
    "BSC_SETTLEMENT": ["settlement"],
    "BSC_MARKET_MONITORING": ["settlement", "market_monitoring"],
    "BSC_RESEARCH": ["settlement", "market_monitoring", "research"],
    "RECIPIENT_USER": ["recipient_shared"],
}


def get_roles_for_purpose(purpose: str) -> List[str]:
    """Return roles that have access to this use-case purpose."""
    return [r for r, purps in ROLE_PURPOSE_MAP.items() if purpose in purps]


def get_purpose_description(purpose: str) -> str:
    d = {
        "settlement": "Settlement and billing: full half-hourly reads, MPAN (tokenized where required).",
        "market_monitoring": "Market monitoring: aggregates, trends, no raw PII.",
        "research": "Research: anonymised aggregates, long-term trends, no identifiers.",
        "recipient_shared": "Recipient: only shared curated tables and columns from Provider.",
    }
    return d.get(purpose, purpose)


def explain_access(role: str) -> Dict[str, Any]:
    """Return a short explanation of what this role can see."""
    purposes = ROLE_PURPOSE_MAP.get(role, [])
    return {
        "role": role,
        "purposes": purposes,
        "description": "; ".join(get_purpose_description(p) for p in purposes),
    }
