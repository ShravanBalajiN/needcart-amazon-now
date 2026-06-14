"""
Cart optimizer - builds the cart from catalog based on intent, constraints, and mode.
Handles budget fitting, forgotten essentials, stockout simulation, and substitution.
"""

from __future__ import annotations
import json
from typing import Optional
from app.config import DATA_DIR
from app.models import (
    CartItem, CartMode, Constraints, Replacement, SkippedItem, StressParams,
)

# Load catalog and templates
with open(DATA_DIR / "catalog.json", "r", encoding="utf-8") as f:
    CATALOG: list[dict] = json.load(f)

with open(DATA_DIR / "need_templates.json", "r", encoding="utf-8") as f:
    NEED_TEMPLATES: dict = json.load(f)


def _is_available(product: dict, stress: StressParams) -> bool:
    """Check if a product is available given stock and stress params."""
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
    return True  # non-veg allows everything


def _sort_products(products: list[dict], mode: CartMode) -> list[dict]:
    """Sort products based on cart mode priority."""
    if mode == CartMode.fastest:
        return sorted(products, key=lambda p: p["eta_minutes"])
    elif mode == CartMode.budget:
        return sorted(products, key=lambda p: p["price"])
    elif mode == CartMode.complete:
        return sorted(products, key=lambda p: (-1 if p["priority"] == "required" else 0, -p["price"]))
    else:  # balanced
        return sorted(products, key=lambda p: (p["eta_minutes"] * 0.4 + p["price"] * 0.6))


def _find_substitute(product: dict, stress: StressParams, dietary: Optional[str],
                     budget_remaining: float, urgency_minutes: Optional[int] = None) -> Optional[dict]:
    """
    Find a substitute for an unavailable product.
    Priority: same substitute_group > same category > same need_tags > similar price.
    """
    candidates = []

    # Level 1: Same substitute group
    group = product.get("substitute_group")
    if group:
        candidates = [
            p for p in CATALOG
            if p["substitute_group"] == group
            and p["id"] != product["id"]
            and _is_available(p, stress)
            and _matches_dietary(p, dietary)
            and p["price"] <= budget_remaining
        ]

    # Level 2: Same category if no group match
    if not candidates:
        candidates = [
            p for p in CATALOG
            if p["category"] == product["category"]
            and p["id"] != product["id"]
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
                and p["id"] != product["id"]
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

    # Pick closest price match
    candidates.sort(key=lambda p: abs(p["price"] - product["price"]))
    return candidates[0]


def _find_cheaper_alternative(product: dict, stress: StressParams,
                               dietary: Optional[str]) -> Optional[dict]:
    """Find a cheaper product in the same substitute group."""
    group = product.get("substitute_group")
    if not group:
        return None
    alternatives = [
        p for p in CATALOG
        if p["substitute_group"] == group
        and p["id"] != product["id"]
        and _is_available(p, stress)
        and _matches_dietary(p, dietary)
        and p["price"] < product["price"]
    ]
    if alternatives:
        return min(alternatives, key=lambda p: p["price"])
    return None


def _try_smaller_pack(product: dict) -> Optional[dict]:
    """Try to get a smaller/cheaper pack size."""
    pack_sizes = product.get("pack_sizes", [])
    if not pack_sizes:
        return None
    cheapest_pack = min(pack_sizes, key=lambda ps: ps["price"])
    if cheapest_pack["price"] < product["price"]:
        return {
            **product,
            "price": cheapest_pack["price"],
            "name": f"{product['name']} ({cheapest_pack['label']})",
        }
    return None


def _sanitize_text(text: str) -> str:
    """Remove fancy dashes and special characters, replace with ASCII equivalents."""
    replacements = {
        "\u2014": "-",  # em dash
        "\u2013": "-",  # en dash
        "\u2015": "-",  # horizontal bar
        "\u2010": "-",  # hyphen
        "\u2011": "-",  # non-breaking hyphen
        "\u2012": "-",  # figure dash
        "\u2018": "'",  # left single quote
        "\u2019": "'",  # right single quote
        "\u201c": '"',  # left double quote
        "\u201d": '"',  # right double quote
        "\u2026": "...",  # ellipsis
        "\u00e2": "",   # stray encoding artifact
        "\u0080": "",   # stray encoding artifact
        "\u0094": "",   # stray encoding artifact
    }
    for fancy, plain in replacements.items():
        text = text.replace(fancy, plain)
    return text


# Category to image path mapping for fallback thumbnails
_CATEGORY_IMAGES: dict[str, str] = {
    "snacks": "/product-images/snacks.svg",
    "beverages": "/product-images/beverages.svg",
    "breakfast": "/product-images/breakfast.svg",
    "emergency": "/product-images/emergency.svg",
    "pooja": "/product-images/pooja.svg",
    "health_essentials": "/product-images/health.svg",
    "household": "/product-images/household.svg",
    "dairy": "/product-images/dairy.svg",
    "bakery": "/product-images/bakery.svg",
    "sweet_snacks": "/product-images/snacks.svg",
    "disposables": "/product-images/household.svg",
    "baby": "/product-images/health.svg",
    "personal_care": "/product-images/household.svg",
}


def _get_category_image(category: str) -> str:
    """Get fallback image URL for a product category."""
    return _CATEGORY_IMAGES.get(category, "/product-images/default.svg")


def build_cart(
    intent: str,
    constraints: Constraints,
    mode: CartMode,
    stress: StressParams,
    household_profile: dict | None = None,
    excluded_items: list[str] | None = None,
    requested_extra_items: list[str] | None = None,
) -> tuple[list[CartItem], list[Replacement], list[SkippedItem], bool]:
    """
    Build the optimized cart.
    Returns: (items, replacements, skipped_items, rescue_mode_triggered)
    """
    template = NEED_TEMPLATES.get(intent, {})
    required_categories = template.get("required_categories", [])
    optional_categories = template.get("optional_categories", [])
    forgotten_categories = template.get("forgotten_essentials", [])
    blocked_groups = set(template.get("blocked_substitute_groups", []))
    forgotten_reason = template.get("forgotten_essential_reason", "Forgotten essential.")

    budget = constraints.budget or 9999
    dietary = constraints.dietary_preference
    urgency = constraints.urgency_minutes

    # User explicit exclusions/inclusions
    user_excluded = [e.lower() for e in (excluded_items or [])]
    user_requested = [r.lower() for r in (requested_extra_items or [])]

    # Safety-blocked keywords (medicine items for child_fever)
    _SAFETY_BLOCKED_KEYWORDS = ["paracetamol", "ibuprofen", "cough syrup", "medicine",
                                 "vicks", "balm", "tablet", "syrup"]

    def _is_user_excluded(product: dict) -> bool:
        """Check if product is explicitly excluded by user."""
        if not user_excluded:
            return False
        name_lower = product["name"].lower()
        cat_lower = product.get("category", "").lower()
        for excl in user_excluded:
            if excl in name_lower:
                return True
            if excl == cat_lower:
                return True
        return False

    budget = constraints.budget or 9999
    dietary = constraints.dietary_preference
    urgency = constraints.urgency_minutes

    # Profile preferences
    preferred_brands = [b.lower() for b in (household_profile or {}).get("preferred_brands", [])]
    avoided_keywords = [k.lower() for k in (household_profile or {}).get("avoided_keywords", [])]
    preferred_keywords = [k.lower() for k in (household_profile or {}).get("preferred_keywords", [])]
    preferred_categories = [c.lower() for c in (household_profile or {}).get("preferred_categories", [])]
    budget_bias = (household_profile or {}).get("budget_bias", False)
    personalization_reason = (household_profile or {}).get("personalization_reason", "")

    def _is_preferred(product: dict) -> bool:
        """Check if product matches profile preferences."""
        if not household_profile:
            return False
        name_lower = product["name"].lower()
        cat_lower = product.get("category", "").lower()
        tags = [t.lower() for t in product.get("dietary_tags", [])]
        # Check preferred brands
        for brand in preferred_brands:
            if brand in name_lower:
                return True
        # Check preferred keywords against name, category, and tags
        for kw in preferred_keywords:
            if kw in name_lower:
                return True
            if kw in cat_lower:
                return True
            for tag in tags:
                if kw in tag:
                    return True
        # Check preferred categories
        if cat_lower in preferred_categories:
            return True
        return False

    def _is_budget_preferred(product: dict, all_in_group: list[dict]) -> bool:
        """For budget_saver profile: check if product is among the cheapest in its group."""
        if not budget_bias or not household_profile:
            return False
        if not all_in_group:
            return False
        min_price = min(p["price"] for p in all_in_group)
        # Mark as budget-preferred if it's the cheapest or within 20% of cheapest
        return product["price"] <= min_price * 1.2

    def _is_avoided(product: dict) -> bool:
        """Check if product should be avoided based on profile."""
        if not household_profile:
            return False
        name_lower = product["name"].lower()
        cat_lower = product.get("category", "").lower()
        tags = [t.lower() for t in product.get("dietary_tags", [])]
        for kw in avoided_keywords:
            kw_lower = kw.lower()
            if kw_lower in name_lower:
                return True
            if kw_lower in cat_lower:
                return True
            for tag in tags:
                if kw_lower in tag:
                    return True
        return False

    def _profile_sort(products: list[dict], base_sorted: list[dict]) -> list[dict]:
        """Rerank products: keyword-preferred first, category-preferred next, avoided last, rest unchanged."""
        if not household_profile:
            return base_sorted

        def _is_keyword_preferred(product: dict) -> bool:
            """Check if product matches keyword/brand preferences (stronger signal)."""
            name_lower = product["name"].lower()
            tags = [t.lower() for t in product.get("dietary_tags", [])]
            for brand in preferred_brands:
                if brand in name_lower:
                    return True
            for kw in preferred_keywords:
                if kw in name_lower:
                    return True
                for tag in tags:
                    if kw in tag:
                        return True
            return False

        keyword_preferred = [p for p in base_sorted if _is_keyword_preferred(p) and not _is_avoided(p)]
        cat_preferred = [p for p in base_sorted if not _is_keyword_preferred(p) and _is_preferred(p) and not _is_avoided(p)]
        normal = [p for p in base_sorted if not _is_preferred(p) and not _is_avoided(p)]
        avoided = [p for p in base_sorted if _is_avoided(p)]
        return keyword_preferred + cat_preferred + normal + avoided

    budget = constraints.budget or 9999
    dietary = constraints.dietary_preference
    urgency = constraints.urgency_minutes

    cart_items: list[CartItem] = []
    replacements: list[Replacement] = []
    skipped: list[SkippedItem] = []
    total = 0.0
    added_ids: set[str] = set()
    covered_categories: set[str] = set()
    covered_groups: set[str] = set()

    def _add_item(product: dict, qty: int, reason: str, is_forgotten: bool = False, is_user_requested: bool = False) -> None:
        nonlocal total
        item_cost = product["price"] * qty

        # Determine personalization status
        personalized = False
        p_reason = None
        if household_profile is not None and not is_user_requested:
            if _is_preferred(product):
                personalized = True
                p_reason = personalization_reason or "Preferred by this household."
            elif budget_bias:
                # For budget_saver: find peers in same substitute_group or category
                group = product.get("substitute_group")
                if group:
                    peers = [p for p in CATALOG if p.get("substitute_group") == group
                             and _is_available(p, stress) and _matches_dietary(p, dietary)]
                else:
                    peers = [p for p in CATALOG if p["category"] == product["category"]
                             and _is_available(p, stress) and _matches_dietary(p, dietary)]
                if _is_budget_preferred(product, peers):
                    personalized = True
                    p_reason = personalization_reason or "Budget-friendly pick for this household."

        # Resolve image URL
        image_url = product.get("image_url") or _get_category_image(product.get("category", ""))

        cart_items.append(CartItem(
            id=product["id"],
            name=product["name"],
            category=product["category"],
            price=product["price"],
            quantity=qty,
            eta_minutes=product["eta_minutes"],
            reason=_sanitize_text(reason + (f" Personalized pick: {p_reason}" if personalized else "")),
            is_forgotten_essential=is_forgotten,
            is_personalized=personalized,
            personalization_reason=p_reason,
            is_user_requested=is_user_requested,
            image_url=image_url,
        ))
        total += item_cost
        added_ids.add(product["id"])
        covered_categories.add(product["category"])
        covered_groups.add(product.get("substitute_group", ""))

    def _find_substitute_non_excluded(product: dict, stress: StressParams, dietary: Optional[str],
                                       budget_remaining: float, urgency_minutes_val: Optional[int] = None) -> Optional[dict]:
        """Find a substitute that is not user-excluded."""
        candidates = []
        group = product.get("substitute_group")
        if group:
            candidates = [
                p for p in CATALOG
                if p["substitute_group"] == group
                and p["id"] != product["id"]
                and _is_available(p, stress)
                and _matches_dietary(p, dietary)
                and p["price"] <= budget_remaining
                and not _is_user_excluded(p)
            ]
        if not candidates:
            candidates = [
                p for p in CATALOG
                if p["category"] == product["category"]
                and p["id"] != product["id"]
                and _is_available(p, stress)
                and _matches_dietary(p, dietary)
                and p["price"] <= budget_remaining
                and not _is_user_excluded(p)
            ]
        if not candidates:
            return None
        if urgency_minutes_val:
            eta_filtered = [p for p in candidates if p["eta_minutes"] <= urgency_minutes_val]
            if eta_filtered:
                candidates = eta_filtered
        candidates.sort(key=lambda p: abs(p["price"] - product["price"]))
        return candidates[0]

    def _try_add_product(product: dict, is_forgotten: bool = False) -> bool:
        """Try to add a product to cart, handling stockouts with substitution."""
        nonlocal total

        if product["id"] in added_ids:
            return True  # already in cart

        # Block products from blocked substitute groups
        if product.get("substitute_group") in blocked_groups:
            return False

        # Block user-excluded products
        if _is_user_excluded(product):
            # Try to find a non-excluded substitute
            remaining = budget - total
            sub = _find_substitute_non_excluded(product, stress, dietary, remaining, urgency)
            if sub and sub["id"] not in added_ids and sub.get("substitute_group") not in blocked_groups:
                qty = 1
                item_cost = sub["price"] * qty
                if total + item_cost <= budget:
                    reason = f"Substituted for {product['name']} (excluded by user)."
                    _add_item(sub, qty, reason, is_forgotten)
                    replacements.append(Replacement(
                        original_id=product["id"],
                        original_name=product["name"],
                        replacement_id=sub["id"],
                        replacement_name=sub["name"],
                        reason=_sanitize_text(
                            f"{product['name']} excluded by user; replacement keeps the same need coverage."
                        ),
                        price_diff=sub["price"] - product["price"],
                    ))
                    return True
            # No substitute, skip
            skipped.append(SkippedItem(
                id=product["id"],
                name=product["name"],
                reason=_sanitize_text(f"Excluded by user preference."),
            ))
            return False

        if not _is_available(product, stress):
            # Try substitution
            remaining = budget - total
            sub = _find_substitute(product, stress, dietary, remaining, urgency)
            if sub and sub["id"] not in added_ids and sub.get("substitute_group") not in blocked_groups:
                qty = 1
                item_cost = sub["price"] * qty
                if total + item_cost <= budget:
                    reason = f"Substituted for {product['name']} (unavailable)."
                    _add_item(sub, qty, reason, is_forgotten)
                    replacements.append(Replacement(
                        original_id=product["id"],
                        original_name=product["name"],
                        replacement_id=sub["id"],
                        replacement_name=sub["name"],
                        reason=_sanitize_text(
                            "Original item unavailable; replacement keeps the same need coverage within budget and ETA."
                        ),
                        price_diff=sub["price"] - product["price"],
                    ))
                    return True
            # No substitute found
            skipped.append(SkippedItem(
                id=product["id"],
                name=product["name"],
                reason=_sanitize_text("Out of stock with no available substitute within budget."),
            ))
            return False

        # Product is available
        qty = 1
        # In complete/balanced mode with many guests, consider quantity 2 but only for
        # a limited number of items and only if budget is generous
        if mode in (CartMode.complete, CartMode.balanced) and constraints.people_count and constraints.people_count > 4:
            # Only double if: required item, cheap, and we haven't doubled too many
            doubled_count = sum(1 for ci in cart_items if ci.quantity > 1)
            if (product.get("priority") == "required"
                    and doubled_count < 2
                    and product["price"] * 2 <= (budget - total) * 0.3):
                qty = 2

        item_cost = product["price"] * qty
        if total + item_cost <= budget:
            intent_label = intent.replace("_", " ")
            if is_forgotten:
                reason = forgotten_reason
            elif product.get("priority") in ("required", "forgotten_essential"):
                reason = f"Essential item for {intent_label}, available now."
            else:
                reason = f"Good addition for {intent_label}, fits within constraints."
            _add_item(product, qty, reason, is_forgotten)
            return True
        else:
            # Try smaller pack in budget mode
            if mode == CartMode.budget:
                smaller = _try_smaller_pack(product)
                if smaller and total + smaller["price"] <= budget:
                    reason = f"Essential item for {intent.replace('_', ' ')}, smaller pack to fit budget."
                    _add_item(smaller, 1, reason, is_forgotten)
                    return True
            return False

    # =========================================================================
    # STEP 1: Fill required categories
    # =========================================================================
    # In budget mode, allocate budget per category to ensure coverage
    num_required = max(len(required_categories), 1)
    if mode == CartMode.budget:
        # Reserve budget proportionally: ensure each required category gets a fair share
        per_cat_budget = budget * 0.9 / num_required  # 90% split, 10% for extras
    else:
        per_cat_budget = budget  # no per-category limit

    for cat in required_categories:
        cat_products = [
            p for p in CATALOG
            if p["category"] == cat and _matches_dietary(p, dietary)
        ]
        cat_products = _sort_products(cat_products, mode)
        cat_products = _profile_sort(cat_products, cat_products)

        # Items with priority "required" or "forgotten_essential" are both valid
        # for filling a required category slot
        must_have_in_cat = [
            p for p in cat_products
            if p.get("priority") in ("required", "forgotten_essential")
        ]
        optional_in_cat = [p for p in cat_products if p.get("priority") == "optional"]

        cat_spend = 0.0

        if mode == CartMode.budget:
            # Pick cheapest items, respect per-category budget
            for product in must_have_in_cat:
                if product.get("substitute_group") in covered_groups:
                    continue
                if cat_spend + product["price"] > per_cat_budget:
                    continue  # skip to stay within category allocation
                is_fe = product.get("priority") == "forgotten_essential"
                old_total = total
                _try_add_product(product, is_forgotten=is_fe)
                cat_spend += (total - old_total)

        elif mode == CartMode.fastest:
            # Pick fastest available items, at least one per category
            for product in must_have_in_cat:
                if product.get("substitute_group") in covered_groups:
                    continue
                is_fe = product.get("priority") == "forgotten_essential"
                # Filter by urgency
                if urgency and product["eta_minutes"] > urgency:
                    faster = [
                        p for p in CATALOG
                        if p["category"] == cat
                        and p.get("substitute_group") == product.get("substitute_group")
                        and p["eta_minutes"] <= urgency
                        and _is_available(p, stress)
                        and _matches_dietary(p, dietary)
                    ]
                    if faster:
                        _try_add_product(faster[0], is_forgotten=is_fe)
                    else:
                        _try_add_product(product, is_forgotten=is_fe)
                else:
                    _try_add_product(product, is_forgotten=is_fe)

        else:
            # balanced / complete - add must-have items, then optionals if budget allows
            # In balanced mode, limit items per category to ensure all categories get budget
            max_items_per_cat = 4 if mode == CartMode.complete else 3
            cat_item_count = 0
            for product in must_have_in_cat:
                if cat_item_count >= max_items_per_cat:
                    break
                if product.get("substitute_group") in covered_groups:
                    continue
                is_fe = product.get("priority") == "forgotten_essential"
                old_total = total
                _try_add_product(product, is_forgotten=is_fe)
                if total > old_total:
                    cat_item_count += 1

            # In complete mode, also add optional items from required categories
            if mode == CartMode.complete:
                for product in optional_in_cat:
                    if cat_item_count >= max_items_per_cat + 2:
                        break
                    if product.get("substitute_group") in covered_groups:
                        continue
                    old_total = total
                    _try_add_product(product, is_forgotten=False)
                    if total > old_total:
                        cat_item_count += 1

    # =========================================================================
    # STEP 1.5: Add user-requested extra items (HIGH PRIORITY)
    # Processed early so explicit requests get budget priority over optionals.
    # Dietary filter is NOT applied - user explicitly requested these items.
    # =========================================================================
    if user_requested:
        for req_item in user_requested:
            # Safety check: block medicine requests for child_fever
            if intent == "child_fever":
                is_medicine = any(kw in req_item for kw in _SAFETY_BLOCKED_KEYWORDS)
                if is_medicine:
                    skipped.append(SkippedItem(
                        id="SAFETY",
                        name=req_item.title(),
                        reason="Medication cannot be added in this demo cart. Please consult a doctor.",
                    ))
                    continue

            # Skip if also in exclusion list
            if req_item in user_excluded:
                continue

            # Find matching catalog product - NO dietary filter for explicit user requests
            candidates = [
                p for p in CATALOG
                if req_item in p["name"].lower()
                and _is_available(p, stress)
                and p["id"] not in added_ids
                and p.get("substitute_group") not in blocked_groups
                and not _is_user_excluded(p)
            ]
            if not candidates:
                candidates = [
                    p for p in CATALOG
                    if (req_item in p.get("category", "").lower()
                        or req_item in p.get("substitute_group", "").lower())
                    and _is_available(p, stress)
                    and p["id"] not in added_ids
                    and p.get("substitute_group") not in blocked_groups
                    and not _is_user_excluded(p)
                ]

            if candidates:
                if mode == CartMode.budget:
                    candidates.sort(key=lambda p: p["price"])
                else:
                    candidates.sort(key=lambda p: (p["eta_minutes"] * 0.4 + p["price"] * 0.6))

                added_requested = False
                for candidate in candidates:
                    if candidate["id"] in added_ids:
                        continue
                    if total + candidate["price"] <= budget:
                        reason = "User-requested item. Added because you requested it."
                        _add_item(candidate, 1, reason, False, is_user_requested=True)
                        added_requested = True
                        break
                    elif mode in (CartMode.balanced, CartMode.complete) and total + candidate["price"] <= budget * 1.15:
                        reason = "User-requested item. Added per request (slight budget stretch)."
                        _add_item(candidate, 1, reason, False, is_user_requested=True)
                        added_requested = True
                        break

                if not added_requested:
                    skipped.append(SkippedItem(
                        id="REQ",
                        name=req_item.title(),
                        reason=f"Could not add {req_item} - exceeds budget.",
                    ))
            else:
                skipped.append(SkippedItem(
                    id="REQ",
                    name=req_item.title(),
                    reason=f"Could not add {req_item} - not available in catalog or out of stock.",
                ))

    # =========================================================================
    # STEP 2: Forgotten essentials (only if not already added in step 1)
    # =========================================================================
    for cat in forgotten_categories:
        forgotten_products = [
            p for p in CATALOG
            if p["category"] == cat
            and p.get("priority") == "forgotten_essential"
            and _matches_dietary(p, dietary)
        ]
        forgotten_products = _sort_products(forgotten_products, mode)

        for product in forgotten_products:
            if product["id"] in added_ids:
                continue
            _try_add_product(product, is_forgotten=True)

    # =========================================================================
    # STEP 3: Optional categories
    # =========================================================================
    for cat in optional_categories:
        cat_products = [
            p for p in CATALOG
            if p["category"] == cat and _matches_dietary(p, dietary)
        ]
        cat_products = _sort_products(cat_products, mode)
        cat_products = _profile_sort(cat_products, cat_products)

        if mode == CartMode.budget:
            # In budget mode, add ONE low-cost sweet/bakery item if budget allows
            added_optional = False
            for product in cat_products:
                if product["id"] in added_ids:
                    continue
                if total + product["price"] <= budget:
                    _try_add_product(product, is_forgotten=False)
                    added_optional = True
                    break
        else:
            # balanced/complete: add optional items that fit
            for product in cat_products:
                if product["id"] in added_ids:
                    continue
                if product.get("substitute_group") in covered_groups:
                    continue
                _try_add_product(product, is_forgotten=False)

    # =========================================================================
    # STEP 4: Budget mode - fill remaining budget smartly
    # =========================================================================
    if mode == CartMode.budget and total < budget * 0.85:
        # Budget is underutilized. Try to add more items from required categories
        # or upgrade pack sizes to better use the budget.
        remaining = budget - total

        # Try adding optional items from required categories
        for cat in required_categories:
            cat_optional = [
                p for p in CATALOG
                if p["category"] == cat
                and p.get("priority") in ("optional", "required")
                and p["id"] not in added_ids
                and _is_available(p, stress)
                and _matches_dietary(p, dietary)
                and p["price"] <= remaining
            ]
            cat_optional.sort(key=lambda p: p["price"])
            for product in cat_optional:
                if product.get("substitute_group") in covered_groups:
                    continue
                if total + product["price"] <= budget:
                    _try_add_product(product, is_forgotten=False)
                    remaining = budget - total

        # Try smaller pack versions of available products that fit
        if total < budget * 0.85:
            remaining = budget - total
            for p in CATALOG:
                if p["id"] in added_ids:
                    continue
                if not _is_available(p, stress):
                    continue
                if not _matches_dietary(p, dietary):
                    continue
                if p["category"] not in (list(required_categories) + optional_categories + ["sweet_snacks"]):
                    continue
                if p.get("substitute_group") in covered_groups:
                    continue
                smaller = _try_smaller_pack(p)
                if smaller and smaller["price"] <= remaining:
                    reason = f"Good addition for {intent.replace('_', ' ')}, smaller pack to fit budget."
                    _add_item(smaller, 1, reason, False)
                    remaining = budget - total
                    if total >= budget * 0.85:
                        break

        # Try to add another sweet snack or beverage if budget still allows
        if total < budget * 0.85:
            filler_cats = ["sweet_snacks", "beverages", "snacks"]
            for fcat in filler_cats:
                filler_products = [
                    p for p in CATALOG
                    if p["category"] == fcat
                    and p["id"] not in added_ids
                    and _is_available(p, stress)
                    and _matches_dietary(p, dietary)
                    and p["price"] <= (budget - total)
                ]
                filler_products.sort(key=lambda p: p["price"])
                for product in filler_products:
                    if product.get("substitute_group") in covered_groups:
                        continue
                    if total + product["price"] <= budget:
                        _try_add_product(product, is_forgotten=False)
                        break
                if total >= budget * 0.85:
                    break

    # =========================================================================
    # STEP 5: Complete/Balanced mode - ensure strong cart
    # =========================================================================
    if mode in (CartMode.balanced, CartMode.complete) and total < budget * 0.7:
        # Add more items to better utilize budget
        extra_cats = optional_categories + ["sweet_snacks"]
        for cat in extra_cats:
            cat_products = [
                p for p in CATALOG
                if p["category"] == cat
                and p["id"] not in added_ids
                and _is_available(p, stress)
                and _matches_dietary(p, dietary)
                and p["price"] <= (budget - total)
            ]
            cat_products.sort(key=lambda p: -p["price"])  # prefer better items
            for product in cat_products:
                if product.get("substitute_group") in covered_groups:
                    continue
                if total + product["price"] <= budget:
                    _try_add_product(product, is_forgotten=False)

    # =========================================================================
    # STEP 6: Budget enforcement - trim if over budget
    # =========================================================================
    rescue_triggered = False
    if total > budget:
        # Remove optional items first (most expensive first)
        optional_items = [
            i for i in cart_items
            if i.category in optional_categories and not i.is_forgotten_essential
        ]
        optional_items.sort(key=lambda i: -i.price)
        for item in optional_items:
            if total <= budget:
                break
            total -= item.price * item.quantity
            cart_items.remove(item)
            added_ids.discard(item.id)
            skipped.append(SkippedItem(
                id=item.id, name=item.name,
                reason=_sanitize_text("Removed to fit budget."),
            ))

        # Swap to cheaper alternatives
        if total > budget:
            for idx, item in enumerate(list(cart_items)):
                if total <= budget:
                    break
                product = next((p for p in CATALOG if p["id"] == item.id), None)
                if not product:
                    continue
                alt = _find_cheaper_alternative(product, stress, dietary)
                if alt and _is_available(alt, stress) and alt["id"] not in added_ids:
                    old_cost = item.price * item.quantity
                    new_cost = alt["price"] * item.quantity
                    cart_items[idx] = CartItem(
                        id=alt["id"],
                        name=alt["name"],
                        category=alt["category"],
                        price=alt["price"],
                        quantity=item.quantity,
                        eta_minutes=alt["eta_minutes"],
                        reason=_sanitize_text(f"Budget swap from {item.name}."),
                        is_forgotten_essential=item.is_forgotten_essential,
                    )
                    replacements.append(Replacement(
                        original_id=item.id,
                        original_name=item.name,
                        replacement_id=alt["id"],
                        replacement_name=alt["name"],
                        reason=_sanitize_text("Swapped to cheaper option to fit budget."),
                        price_diff=alt["price"] - item.price,
                    ))
                    added_ids.discard(item.id)
                    added_ids.add(alt["id"])
                    total = total - old_cost + new_cost

        # Try smaller packs
        if total > budget:
            for idx, item in enumerate(list(cart_items)):
                if total <= budget:
                    break
                product = next((p for p in CATALOG if p["id"] == item.id), None)
                if not product:
                    continue
                smaller = _try_smaller_pack(product)
                if smaller and smaller["price"] < item.price:
                    old_cost = item.price * item.quantity
                    new_cost = smaller["price"] * item.quantity
                    cart_items[idx] = CartItem(
                        id=item.id,
                        name=smaller["name"],
                        category=item.category,
                        price=smaller["price"],
                        quantity=item.quantity,
                        eta_minutes=item.eta_minutes,
                        reason=_sanitize_text("Reduced pack size to fit budget."),
                        is_forgotten_essential=item.is_forgotten_essential,
                    )
                    total = total - old_cost + new_cost

        # If still over budget - Rescue Mode
        if total > budget:
            rescue_triggered = True

    return cart_items, replacements, skipped, rescue_triggered
