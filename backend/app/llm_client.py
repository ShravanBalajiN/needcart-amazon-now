"""
OpenRouter LLM client for intent parsing via Gemini 2.5 Flash.
Disabled by default (USE_LLM=false). When enabled, calls OpenRouter API
to extract structured intent/constraints from user text.
The LLM does NOT select products or build the cart - only classifies intent.
"""

from __future__ import annotations
import json
import logging
from typing import Optional
from app.config import (
    USE_LLM,
    LLM_PROVIDER,
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL,
    OPENROUTER_BASE_URL,
    OPENROUTER_SITE_URL,
    OPENROUTER_APP_NAME,
)

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

SYSTEM_PROMPT = (
    "You are a structured intent parser for NeedCart, an Indian quick-commerce app. "
    "Your job is to extract intent and constraints from user text. "
    "Output ONLY valid JSON. No markdown. No explanations. No product recommendations. "
    "No cart generation. Do not suggest medicines.\n\n"
    "Valid intents:\n"
    "- guests_arriving\n"
    "- breakfast_rush\n"
    "- child_fever_essentials\n"
    "- power_cut\n"
    "- pooja_items\n"
    "- late_night_hunger\n"
    "- general_urgent_need\n\n"
    "For child_fever_essentials: classify the situation only. Do NOT recommend medication.\n\n"
    "Extract budget from words and numbers (e.g. 'five hundred' = 500, 'under 300' = 300).\n"
    "Extract urgency from phrases like 'half an hour' = 30, 'in 15 minutes' = 15, 'quickly' = 15, 'now' = 10.\n"
    "Extract people count from words and numbers (e.g. 'six people' = 6, 'for 3' = 3).\n"
    "If a field is missing or unclear, use null.\n\n"
    "Output this exact JSON structure:\n"
    '{"intent": "string", "budget": number_or_null, "people_count": number_or_null, '
    '"urgency_minutes": number_or_null, "dietary_preference": "veg" or "non-veg" or null, '
    '"requested_items": ["category strings"], "confidence": 0.0_to_1.0}'
)


def is_enabled() -> bool:
    """Check if OpenRouter LLM integration is active and configured."""
    return USE_LLM and LLM_PROVIDER == "openrouter" and bool(OPENROUTER_API_KEY)


def parse_intent_with_openrouter(text: str) -> Optional[dict]:
    """
    Parse user intent using OpenRouter (Gemini 2.5 Flash).
    Returns validated dict with intent/constraints or None on failure.
    Falls back to None if disabled, unconfigured, or any error occurs.
    """
    if not is_enabled():
        return None

    try:
        import httpx

        response = httpx.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": OPENROUTER_SITE_URL,
                "X-Title": OPENROUTER_APP_NAME,
            },
            json={
                "model": OPENROUTER_MODEL,
                "temperature": 0,
                "max_tokens": 300,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Parse this shopping need:\n\n{text}"},
                ],
            },
            timeout=10.0,
        )

        if response.status_code != 200:
            logger.warning(
                "OpenRouter returned status %d: %s",
                response.status_code,
                response.text[:200],
            )
            return None

        data = response.json()
        choices = data.get("choices", [])
        if not choices:
            logger.warning("OpenRouter returned no choices")
            return None

        raw_text = choices[0].get("message", {}).get("content", "").strip()
        if not raw_text:
            logger.warning("OpenRouter returned empty content")
            return None

        # Parse JSON from response
        parsed = _extract_json(raw_text)
        if parsed is None:
            logger.warning("OpenRouter returned invalid JSON: %s", raw_text[:200])
            return None

        # Validate and normalize
        validated = _validate_response(parsed)
        return validated

    except ImportError:
        logger.warning("httpx not installed - OpenRouter unavailable, using regex parser")
        return None
    except Exception as e:
        logger.warning("OpenRouter call failed: %s - falling back to regex parser", str(e))
        return None


def _extract_json(text: str) -> Optional[dict]:
    """Extract JSON from LLM response text, handling potential wrapping."""
    text = text.strip()

    # Remove markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [line for line in lines if not line.strip().startswith("```")]
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


def _validate_response(data: dict) -> Optional[dict]:
    """Validate and normalize the LLM response structure."""
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
        confidence = max(0.0, min(1.0, confidence))
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
