"""
AWS Bedrock client for LLM-based intent parsing.
Disabled by default (USE_BEDROCK=false). When enabled, calls Bedrock
Converse API to extract structured intent/constraints from user text.
The LLM does NOT select products or build the cart - only classifies intent.
"""

from __future__ import annotations
import json
import logging
from typing import Optional
from app.config import USE_BEDROCK, BEDROCK_REGION, BEDROCK_MODEL_ID

logger = logging.getLogger(__name__)

VALID_INTENTS = [
    "guests_arriving",
    "breakfast_rush",
    "child_fever_essentials",
    "power_cut",
    "pooja_items",
    "late_night_hunger",
    "general_urgent_need",
]

# Map LLM output intents to internal template keys
INTENT_MAP = {
    "guests_arriving": "guests_arriving",
    "breakfast_rush": "breakfast_rush",
    "child_fever_essentials": "child_fever",
    "child_fever": "child_fever",
    "power_cut": "power_cut",
    "pooja_items": "pooja_items",
    "late_night_hunger": "late_night_hunger",
    "general_urgent_need": "guests_arriving",
}

SYSTEM_PROMPT = """You are a structured intent parser for NeedCart, an Indian quick-commerce app.
Your job is to extract intent and constraints from user text. Output ONLY valid JSON. No markdown. No explanation. No product recommendations. No cart generation.

Valid intents:
- guests_arriving
- breakfast_rush
- child_fever_essentials
- power_cut
- pooja_items
- late_night_hunger
- general_urgent_need

For child_fever_essentials: classify the situation only. Do NOT recommend medication.

Output this exact JSON structure:
{"intent": "string", "budget": number_or_null, "people_count": number_or_null, "urgency_minutes": number_or_null, "dietary_preference": "veg" or "non-veg" or null, "requested_items": ["category strings"], "confidence": 0.0_to_1.0}"""


def is_enabled() -> bool:
    """Check if Bedrock integration is active."""
    return USE_BEDROCK


def parse_intent_with_llm(text: str) -> Optional[dict]:
    """
    Parse user intent using Bedrock Converse API.
    Returns validated dict with intent/constraints or None on failure.
    Falls back to None if USE_BEDROCK is False or any error occurs.
    """
    if not USE_BEDROCK:
        return None

    try:
        import boto3

        client = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)

        response = client.converse(
            modelId=BEDROCK_MODEL_ID,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": f"Parse this shopping need:\n\n{text}"}],
                }
            ],
            system=[{"text": SYSTEM_PROMPT}],
            inferenceConfig={
                "maxTokens": 300,
                "temperature": 0.0,
            },
        )

        # Extract text from response
        output_message = response.get("output", {}).get("message", {})
        content_blocks = output_message.get("content", [])
        if not content_blocks:
            logger.warning("Bedrock returned empty content")
            return None

        raw_text = content_blocks[0].get("text", "").strip()

        # Parse JSON from response
        parsed = _extract_json(raw_text)
        if parsed is None:
            logger.warning("Bedrock returned invalid JSON: %s", raw_text[:200])
            return None

        # Validate and normalize
        validated = _validate_bedrock_response(parsed)
        return validated

    except ImportError:
        logger.warning("boto3 not installed - Bedrock unavailable, using regex parser")
        return None
    except Exception as e:
        logger.warning("Bedrock call failed: %s - falling back to regex parser", str(e))
        return None


def _extract_json(text: str) -> Optional[dict]:
    """Extract JSON from LLM response text, handling potential wrapping."""
    text = text.strip()

    # Remove markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to find JSON object in the text
    start = text.find("{")
    end = text.rfind("}") + 1
    if start >= 0 and end > start:
        try:
            return json.loads(text[start:end])
        except json.JSONDecodeError:
            pass

    return None


def _validate_bedrock_response(data: dict) -> Optional[dict]:
    """Validate and normalize the Bedrock response structure."""
    if not isinstance(data, dict):
        return None

    intent = data.get("intent")
    if not intent or intent not in VALID_INTENTS:
        return None

    # Map to internal intent key
    mapped_intent = INTENT_MAP.get(intent, intent)

    # Validate budget
    budget = data.get("budget")
    if budget is not None:
        try:
            budget = float(budget)
            if budget <= 0 or budget > 100000:
                budget = None
        except (TypeError, ValueError):
            budget = None

    # Validate people_count
    people_count = data.get("people_count")
    if people_count is not None:
        try:
            people_count = int(people_count)
            if people_count <= 0 or people_count > 100:
                people_count = None
        except (TypeError, ValueError):
            people_count = None

    # Validate urgency_minutes
    urgency_minutes = data.get("urgency_minutes")
    if urgency_minutes is not None:
        try:
            urgency_minutes = int(urgency_minutes)
            if urgency_minutes <= 0 or urgency_minutes > 1440:
                urgency_minutes = None
        except (TypeError, ValueError):
            urgency_minutes = None

    # Validate dietary_preference
    dietary = data.get("dietary_preference")
    if dietary not in ("veg", "non-veg", None):
        dietary = None

    # Validate confidence
    confidence = data.get("confidence", 0.0)
    try:
        confidence = float(confidence)
    except (TypeError, ValueError):
        confidence = 0.0

    return {
        "intent": mapped_intent,
        "budget": budget,
        "people_count": people_count,
        "urgency_minutes": urgency_minutes,
        "dietary_preference": dietary,
        "requested_items": data.get("requested_items", []),
        "confidence": confidence,
    }
