"""
Hardened intent parser for NeedCart demo.
Supports number words, natural phrasing, and synonym-based matching.
Falls back gracefully when LLM is unavailable.
"""

from __future__ import annotations
import re
import json
import logging
from typing import Optional
from app.config import DATA_DIR
from app.models import Constraints

logger = logging.getLogger(__name__)

# Load need templates
with open(DATA_DIR / "need_templates.json", "r", encoding="utf-8") as f:
    NEED_TEMPLATES: dict = json.load(f)

# ---------------------------------------------------------------------------
# Number word conversion
# ---------------------------------------------------------------------------

_WORD_TO_NUM = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19, "twenty": 20,
    "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70,
    "eighty": 80, "ninety": 90, "hundred": 100, "thousand": 1000,
}

_BUDGET_PHRASES = {
    "two hundred": 200, "three hundred": 300, "four hundred": 400,
    "five hundred": 500, "six hundred": 600, "seven hundred": 700,
    "eight hundred": 800, "nine hundred": 900, "one thousand": 1000,
    "thousand": 1000,
}

_URGENCY_PHRASES = {
    "half an hour": 30, "half hour": 30, "quarter hour": 15,
    "quickly": 15, "urgent": 15, "urgently": 15, "now": 10, "asap": 10,
    "immediately": 10,
}

# Default budgets by intent
_DEFAULT_BUDGETS = {
    "guests_arriving": 500,
    "breakfast_rush": 300,
    "child_fever": 600,
    "power_cut": 700,
    "pooja_items": 400,
    "late_night_hunger": 250,
    "general_urgent_need": 500,
}

# Default urgency by intent
_DEFAULT_URGENCY = {
    "guests_arriving": 30,
    "breakfast_rush": 15,
    "child_fever": 15,
    "power_cut": 20,
    "pooja_items": 30,
    "late_night_hunger": 10,
    "general_urgent_need": 20,
}

# ---------------------------------------------------------------------------
# Text normalization
# ---------------------------------------------------------------------------


def _normalize_text(text: str) -> str:
    """Lowercase, strip punctuation, normalize whitespace, normalize currency symbols."""
    text = text.lower()
    # Normalize currency
    text = text.replace("\u20b9", " rupees ")  # ₹
    text = re.sub(r"rs\.?", " rupees ", text)
    text = re.sub(r"inr", " rupees ", text)
    # Strip punctuation except hyphens (for compound words)
    text = re.sub(r"[^\w\s\-]", " ", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _replace_number_words(text: str) -> str:
    """Replace number word phrases with digits for easier extraction."""
    # Replace compound budget phrases first (e.g., "five hundred")
    for phrase, val in sorted(_BUDGET_PHRASES.items(), key=lambda x: -len(x[0])):
        text = text.replace(phrase, str(val))

    # Replace single number words
    words = text.split()
    result = []
    for w in words:
        if w in _WORD_TO_NUM and _WORD_TO_NUM[w] <= 100:
            result.append(str(_WORD_TO_NUM[w]))
        else:
            result.append(w)
    return " ".join(result)


# ---------------------------------------------------------------------------
# Intent detection - priority order matters
# ---------------------------------------------------------------------------

# Priority: child_fever > power_cut > pooja > breakfast > late_night > guests > general
_INTENT_RULES: list[tuple[str, list[str]]] = [
    ("child_fever", [
        r"child\s*fever", r"kid\s*fever", r"baby\s*fever",
        r"my\s*child\s*has\s*fever", r"my\s*kid\s*has\s*fever",
        r"fever\s*at\s*night", r"child\s*sick", r"kid\s*sick", r"baby\s*sick",
        r"thermometer", r"\bors\b", r"safe\s*essentials",
        r"fever[\s-]*care", r"electrolyte", r"cold\s*compress", r"wet\s*wipes",
        r"\bfever\b",
    ]),
    ("power_cut", [
        r"power\s*cut", r"power\s*is\s*gone", r"power\s*gone",
        r"electricity\s*is\s*gone", r"electricity\s*gone",
        r"no\s*electricity", r"no\s*current", r"current\s*gone",
        r"power\s*outage", r"blackout",
        r"emergency\s*backup", r"inverter\s*backup", r"power\s*backup",
        r"lights?\s*gone",
        r"\bcandles?\b", r"\btorch\b", r"\bbatteries\b", r"\bbattery\b",
    ]),
    ("pooja_items", [
        r"\bpooja\b", r"\bpuja\b", r"\bprayer\b",
        r"morning\s*prayer", r"evening\s*prayer",
        r"\bincense\b", r"\bagarbatti\b", r"\bcamphor\b",
        r"\bdiya\b", r"lamp\s*oil", r"\bflowers\b", r"\bcoconut\b",
        r"\bkumkum\b", r"\bturmeric\b",
        r"matchbox\s*for\s*pooja", r"pooja\s*items?", r"puja\s*items?",
        r"\bmandir\b", r"\baarti\b", r"\bhavan\b",
    ]),
    ("breakfast_rush", [
        r"\bbreakfast\b", r"morning\s*meal", r"quick\s*breakfast",
        r"breakfast\s*rush", r"morning\s*food",
        r"\bbread\b", r"\bmilk\b", r"\beggs?\b",
        r"\bpoha\b", r"\bupma\b", r"\bidli\b", r"dosa\s*batter",
        r"\boats\b", r"\bcereal\b", r"\btea\b", r"\bcoffee\b",
        r"\bschool\b", r"\btiffin\b", r"\bnashta\b",
    ]),
    ("late_night_hunger", [
        r"late\s*night", r"\bmidnight\b", r"midnight\s*snack",
        r"\bhungry\b", r"\bhunger\b", r"\bcraving\b", r"\bcravings\b",
        r"snack\s*at\s*night", r"night\s*snack", r"night\s*hunger",
        r"late[\s-]*night\s*hunger", r"hostel\s*hunger",
        r"noodles\s*at\s*night", r"quick\s*snacks?\s*at\s*night",
        r"\bmunchies\b", r"11\s*pm",
    ]),
    ("guests_arriving", [
        r"\bguests?\b", r"friends?\s*coming", r"friends?\s*are\s*coming",
        r"relatives?\s*coming", r"\bvisitors?\b",
        r"people\s*coming\s*over", r"coming\s*over",
        r"\bparty\b", r"\bhosting\b", r"house\s*party",
        r"guests?\s*arriving", r"guests?\s*are\s*coming",
        r"\bmehman\b", r"\bgathering\b",
    ]),
]


def detect_intent(text: str) -> str:
    """Detect the primary intent from normalized text. Priority order enforced."""
    normalized = _normalize_text(text)

    for intent, patterns in _INTENT_RULES:
        for pattern in patterns:
            if re.search(pattern, normalized):
                return intent

    # Default: general_urgent_need (never default to guests_arriving)
    return "general_urgent_need"


# ---------------------------------------------------------------------------
# Budget extraction (supports digits and number words)
# ---------------------------------------------------------------------------


def extract_budget(text: str) -> Optional[float]:
    """Extract budget from text. Handles digits, number words, and currency formats."""
    normalized = _normalize_text(text)
    with_nums = _replace_number_words(normalized)

    # Patterns with budget context words
    budget_patterns = [
        r"(?:under|within|below|less\s*than|keep\s*it\s*under|max|upto|up\s*to)\s*(\d+)",
        r"(?:budget|budget\s*is|my\s*budget\s*is)\s*(\d+)",
        r"(\d+)\s*(?:rupees|budget)",
        r"rupees\s*(\d+)",
    ]
    for pat in budget_patterns:
        match = re.search(pat, with_nums)
        if match:
            val = float(match.group(1))
            if 50 <= val <= 100000:
                return val

    return None


# ---------------------------------------------------------------------------
# People count extraction
# ---------------------------------------------------------------------------


def extract_people_count(text: str) -> Optional[int]:
    """Extract number of people from text."""
    normalized = _normalize_text(text)
    with_nums = _replace_number_words(normalized)

    patterns = [
        r"(\d+)\s*(?:people|persons?|guests?|friends?|members?|log|logo)",
        r"(?:for|serve)\s*(\d+)\s*(?:people|persons?|guests?|friends?)?",
        r"family\s*of\s*(\d+)",
        r"for\s*my\s*family\s*of\s*(\d+)",
    ]
    for pat in patterns:
        match = re.search(pat, with_nums)
        if match:
            val = int(match.group(1))
            if 1 <= val <= 100:
                return val

    return None


# ---------------------------------------------------------------------------
# Urgency extraction (supports phrases and number words)
# ---------------------------------------------------------------------------


def extract_urgency_minutes(text: str) -> Optional[int]:
    """Extract urgency in minutes from text."""
    normalized = _normalize_text(text)

    # Check phrase-based urgency first
    for phrase, minutes in _URGENCY_PHRASES.items():
        if phrase in normalized:
            return minutes

    # Replace number words and look for minute patterns
    with_nums = _replace_number_words(normalized)

    patterns = [
        r"(?:in|within)\s*(\d+)\s*(?:min|minutes?|mins?)",
        r"(\d+)\s*(?:min|minutes?|mins?)",
    ]
    for pat in patterns:
        match = re.search(pat, with_nums)
        if match:
            val = int(match.group(1))
            if 1 <= val <= 1440:
                return val

    return None


# ---------------------------------------------------------------------------
# Dietary extraction
# ---------------------------------------------------------------------------


def extract_dietary(text: str) -> Optional[str]:
    """Extract dietary preference. Returns null if not mentioned."""
    lower = text.lower()
    if re.search(r"non[\s-]*veg|chicken|mutton|egg|eggs|fish|meat", lower):
        return "non-veg"
    if re.search(r"\bveg\b|vegetarian|no\s*meat|pure\s*veg|\bjain\b", lower):
        return "veg"
    return None


# ---------------------------------------------------------------------------
# Main parse functions
# ---------------------------------------------------------------------------


def parse_need(text: str, override_budget: Optional[float] = None,
               override_urgency: Optional[int] = None) -> tuple[str, Constraints]:
    """
    Parse the user's need text and return detected intent + constraints.
    Priority: OpenRouter LLM > Bedrock LLM > regex parser.
    Stress overrides take precedence over parsed values.
    """
    from app.llm_client import parse_intent_with_openrouter, is_enabled as llm_enabled
    from app.bedrock_client import parse_intent_with_llm, is_enabled as bedrock_enabled
    from app.config import USE_LLM

    parser_source = "regex"
    llm_result = None

    # Determine parser source label based on config state
    if USE_LLM and not llm_enabled():
        # USE_LLM=true but API key missing or provider misconfigured
        parser_source = "regex_fallback"
    elif USE_LLM and llm_enabled():
        # Try OpenRouter LLM
        llm_result = parse_intent_with_openrouter(text)
        if llm_result:
            parser_source = "llm"
        else:
            # LLM was enabled but call failed
            parser_source = "regex_fallback"

    # Try Bedrock LLM if no result yet and Bedrock is enabled
    if llm_result is None and bedrock_enabled():
        llm_result = parse_intent_with_llm(text)
        if llm_result:
            parser_source = "llm"

    if llm_result and llm_result.get("confidence", 0) >= 0.5:
        intent = llm_result["intent"]
        # Validate intent is a known template key
        if intent not in NEED_TEMPLATES and intent != "general_urgent_need":
            # LLM returned unknown intent, fall through to regex
            llm_result = None
            parser_source = "fallback"

    if llm_result and llm_result.get("confidence", 0) >= 0.5:
        intent = llm_result["intent"]
        template = NEED_TEMPLATES.get(intent, {})

        # Use LLM values but fill gaps with regex extraction
        llm_budget = llm_result.get("budget")
        llm_urgency = llm_result.get("urgency_minutes")
        llm_people = llm_result.get("people_count")
        llm_dietary = llm_result.get("dietary_preference")

        # Fill missing from regex
        regex_budget = extract_budget(text) if llm_budget is None else None
        regex_urgency = extract_urgency_minutes(text) if llm_urgency is None else None
        regex_people = extract_people_count(text) if llm_people is None else None
        regex_dietary = extract_dietary(text) if llm_dietary is None else None

        budget = override_budget or llm_budget or regex_budget or _DEFAULT_BUDGETS.get(intent) or template.get("default_budget")
        urgency = override_urgency or llm_urgency or regex_urgency or _DEFAULT_URGENCY.get(intent) or template.get("default_urgency_minutes")
        people = llm_people or regex_people
        dietary = llm_dietary or regex_dietary

        # Default dietary for certain intents only if not detected at all
        if dietary is None and intent in ("guests_arriving", "pooja_items", "breakfast_rush"):
            dietary = "veg"

        constraints = Constraints(
            budget=budget,
            people_count=people,
            urgency_minutes=urgency,
            dietary_preference=dietary,
        )

        _log_parse_result(text, parser_source, intent, constraints)
        return intent, constraints

    # Fallback: deterministic regex parser
    if parser_source == "regex":
        pass  # stays as "regex"
    else:
        parser_source = "regex_fallback"
    return _parse_need_regex(text, override_budget, override_urgency, parser_source)


def _parse_need_regex(text: str, override_budget: Optional[float] = None,
                      override_urgency: Optional[int] = None,
                      parser_source: str = "regex") -> tuple[str, Constraints]:
    """Deterministic regex-based parsing (hardened version)."""
    intent = detect_intent(text)

    # Map general_urgent_need to a safe internal key for template lookup
    template = NEED_TEMPLATES.get(intent, {})

    budget = override_budget or extract_budget(text) or _DEFAULT_BUDGETS.get(intent) or template.get("default_budget", 500)
    urgency = override_urgency or extract_urgency_minutes(text) or _DEFAULT_URGENCY.get(intent) or template.get("default_urgency_minutes", 20)
    people = extract_people_count(text)
    dietary = extract_dietary(text)

    # Default dietary only for specific intents, not all
    if dietary is None and intent in ("guests_arriving", "pooja_items", "breakfast_rush"):
        dietary = "veg"

    constraints = Constraints(
        budget=budget,
        people_count=people,
        urgency_minutes=urgency,
        dietary_preference=dietary,
    )

    _log_parse_result(text, parser_source, intent, constraints)
    return intent, constraints


def _log_parse_result(raw_need: str, source: str, intent: str, constraints: Constraints) -> None:
    """Log parsed result for debugging."""
    logger.info(
        "PARSE | source=%s | intent=%s | budget=%s | urgency=%s | people=%s | dietary=%s | raw='%s'",
        source,
        intent,
        constraints.budget,
        constraints.urgency_minutes,
        constraints.people_count,
        constraints.dietary_preference,
        raw_need[:80],
    )
