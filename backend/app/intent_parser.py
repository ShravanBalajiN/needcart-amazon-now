"""
Deterministic regex-based intent parser.
Extracts intent, budget, people count, urgency, and dietary preferences from user input.
"""

from __future__ import annotations
import re
import json
from typing import Optional
from app.config import DATA_DIR
from app.models import Constraints


# Load need templates
with open(DATA_DIR / "need_templates.json", "r", encoding="utf-8") as f:
    NEED_TEMPLATES: dict = json.load(f)

# Intent detection patterns (order matters — first match wins)
INTENT_PATTERNS: list[tuple[str, str]] = [
    (r"guest|mehman|visitor|party|gathering|friends coming", "guests_arriving"),
    (r"breakfast|morning|school|tiffin|nashta", "breakfast_rush"),
    (r"fever|sick|child.*ill|medicine|doctor|cold|cough|paracetamol|thermometer", "child_fever"),
    (r"power\s*cut|electricity|blackout|no\s*light|inverter|candle|torch", "power_cut"),
    (r"pooja|puja|prayer|mandir|aarti|havan|diya|agarbatti", "pooja_items"),
    (r"late\s*night|midnight|hungry|11\s*pm|crav|snack.*night|munchies", "late_night_hunger"),
]


def detect_intent(text: str) -> str:
    """Detect the primary intent from user text."""
    lower = text.lower()
    for pattern, intent in INTENT_PATTERNS:
        if re.search(pattern, lower):
            return intent
    # Default fallback
    return "guests_arriving"


def extract_budget(text: str) -> Optional[float]:
    """Extract budget from text like '₹500', 'under 500', 'budget 1000'."""
    patterns = [
        r"(?:under|within|budget|max|upto|up\s*to|less\s*than|below)\s*(?:₹|rs\.?|inr)?\s*(\d+)",
        r"(?:₹|rs\.?|inr)\s*(\d+)",
        r"(\d+)\s*(?:₹|rs|rupees|budget)",
    ]
    for pat in patterns:
        match = re.search(pat, text.lower())
        if match:
            return float(match.group(1))
    return None


def extract_people_count(text: str) -> Optional[int]:
    """Extract number of people from text."""
    patterns = [
        r"(\d+)\s*(?:people|persons|guests|friends|members|log|logo)",
        r"(?:for|serve)\s*(\d+)",
    ]
    for pat in patterns:
        match = re.search(pat, text.lower())
        if match:
            return int(match.group(1))
    return None


def extract_urgency_minutes(text: str) -> Optional[int]:
    """Extract urgency in minutes from text."""
    patterns = [
        r"(\d+)\s*(?:min|minutes|mins)",
        r"in\s*(\d+)\s*(?:min|minutes|mins)",
    ]
    for pat in patterns:
        match = re.search(pat, text.lower())
        if match:
            return int(match.group(1))
    return None


def extract_dietary(text: str) -> Optional[str]:
    """Extract dietary preference."""
    lower = text.lower()
    if re.search(r"non[\s-]*veg|chicken|mutton|egg|fish|meat", lower):
        return "non-veg"
    if re.search(r"\bveg\b|vegetarian|no\s*meat|pure\s*veg", lower):
        return "veg"
    return None


def parse_need(text: str, override_budget: Optional[float] = None,
               override_urgency: Optional[int] = None) -> tuple[str, Constraints]:
    """
    Parse the user's need text and return detected intent + constraints.
    Stress overrides take precedence over parsed values.
    """
    intent = detect_intent(text)
    template = NEED_TEMPLATES.get(intent, {})

    budget = override_budget or extract_budget(text) or template.get("default_budget")
    urgency = override_urgency or extract_urgency_minutes(text) or template.get("default_urgency_minutes")
    people = extract_people_count(text)
    dietary = extract_dietary(text)

    # Default dietary to veg for certain intents if not specified
    if dietary is None and intent in ("guests_arriving", "pooja_items", "breakfast_rush"):
        dietary = "veg"

    constraints = Constraints(
        budget=budget,
        people_count=people,
        urgency_minutes=urgency,
        dietary_preference=dietary,
    )

    return intent, constraints
