"""
Substitution engine - handles product substitution logic when items are out of stock.
Used by cart_optimizer but also exposed for direct queries.
"""

from __future__ import annotations
import json
from typing import Optional
from app.config import DATA_DIR
from app.models import StressParams

with open(DATA_DIR / "catalog.json", "r", encoding="utf-8") as f:
    CATALOG: list[dict] = json.load(f)


def find_substitute(
    product_id: str,
    stress: StressParams,
    dietary: Optional[str] = None,
    budget_remaining: float = 9999,
    urgency_minutes: Optional[int] = None,
    prefer_cheaper: bool = False,
) -> Optional[dict]:
    """
    Find the best available substitute for a given product.
    Search priority:
      1. Same substitute_group
      2. Same category
      3. Same need_tags
      4. Similar price range
      5. ETA within urgency_minutes
    Returns the substitute product dict or None.
    """
    product = next((p for p in CATALOG if p["id"] == product_id), None)
    if not product:
        return None

    candidates = []

    # Level 1: Same substitute group
    group = product.get("substitute_group")
    if group:
        candidates = [
            p for p in CATALOG
            if p["substitute_group"] == group
            and p["id"] != product_id
            and _is_available(p, stress)
            and _matches_dietary(p, dietary)
            and p["price"] <= budget_remaining
        ]

    # Level 2: Same category
    if not candidates:
        candidates = [
            p for p in CATALOG
            if p["category"] == product["category"]
            and p["id"] != product_id
            and _is_available(p, stress)
            and _matches_dietary(p, dietary)
            and p["price"] <= budget_remaining
        ]

    # Level 3: Same need_tags
    if not candidates:
        product_tags = set(product.get("need_tags", []))
        if product_tags:
            candidates = [
                p for p in CATALOG
                if set(p.get("need_tags", [])) & product_tags
                and p["id"] != product_id
                and p["category"] == product["category"]
                and _is_available(p, stress)
                and _matches_dietary(p, dietary)
                and p["price"] <= budget_remaining
            ]

    if not candidates:
        return None

    # Filter by ETA if urgency is set
    if urgency_minutes:
        eta_filtered = [p for p in candidates if p["eta_minutes"] <= urgency_minutes]
        if eta_filtered:
            candidates = eta_filtered

    # Filter by similar price range (within 50% of original price)
    price_filtered = [
        p for p in candidates
        if p["price"] <= product["price"] * 1.5 and p["price"] >= product["price"] * 0.3
    ]
    if price_filtered:
        candidates = price_filtered

    if prefer_cheaper:
        return min(candidates, key=lambda p: p["price"])
    else:
        # Prefer closest price match
        return min(candidates, key=lambda p: abs(p["price"] - product["price"]))


def find_substitute_with_reason(
    product_id: str,
    stress: StressParams,
    dietary: Optional[str] = None,
    budget_remaining: float = 9999,
    urgency_minutes: Optional[int] = None,
) -> Optional[dict]:
    """
    Find substitute and return it with a reason string.
    Returns dict with keys: original, replacement, reason or None.
    """
    product = next((p for p in CATALOG if p["id"] == product_id), None)
    if not product:
        return None

    sub = find_substitute(product_id, stress, dietary, budget_remaining, urgency_minutes)
    if not sub:
        return None

    return {
        "original": product["name"],
        "replacement": sub["name"],
        "reason": "Original item unavailable; replacement keeps the same need coverage within budget and ETA.",
        "substitute_product": sub,
    }


def get_substitution_readiness(intent: str, stress: StressParams) -> int:
    """
    Calculate a substitution readiness score (0-100) for a given intent.
    Measures how many required products have available substitutes in the catalog.
    Higher score = more substitute groups exist for required products.
    """
    from app.intent_parser import NEED_TEMPLATES

    template = NEED_TEMPLATES.get(intent, {})
    required_categories = template.get("required_categories", [])

    required_products = [p for p in CATALOG if p["category"] in required_categories]
    if not required_products:
        return 100

    # Count products that have at least one other product in their substitute group
    has_sub = 0
    for product in required_products:
        group = product.get("substitute_group")
        if not group:
            continue
        # Check if there are OTHER products in the same group that are available
        alternatives = [
            p for p in CATALOG
            if p["substitute_group"] == group
            and p["id"] != product["id"]
            and _is_available(p, stress)
        ]
        if alternatives:
            has_sub += 1

    # Also consider category-level coverage (even without same group)
    unique_groups = set(p.get("substitute_group") for p in required_products if p.get("substitute_group"))
    groups_with_subs = 0
    for group in unique_groups:
        group_products = [p for p in CATALOG if p.get("substitute_group") == group]
        available_in_group = [p for p in group_products if _is_available(p, stress)]
        if len(available_in_group) >= 2:
            groups_with_subs += 1

    if not unique_groups:
        return 50

    group_score = int((groups_with_subs / len(unique_groups)) * 100)
    product_score = int((has_sub / len(required_products)) * 100)

    # Weighted average: group coverage matters more
    return min(100, int(group_score * 0.6 + product_score * 0.4))


def _is_available(product: dict, stress: StressParams) -> bool:
    """Check product availability accounting for stress simulation."""
    if product["stock"] <= 0:
        return False
    if product["id"] in stress.simulate_stockout_product_ids:
        return False
    if product["category"] in stress.simulate_stockout_groups:
        return False
    if product.get("substitute_group") in stress.simulate_stockout_groups:
        return False
    return True


def _matches_dietary(product: dict, dietary: Optional[str]) -> bool:
    """Check dietary compatibility."""
    if dietary is None or product["dietary"] == "na":
        return True
    if dietary == "veg":
        return product["dietary"] == "veg"
    return True
