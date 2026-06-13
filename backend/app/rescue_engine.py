"""
Rescue Mode engine - triggered when the cart cannot fit within budget
even after all optimization steps, or when entire required categories are unavailable.
Provides the best possible cart with honest feedback about what was dropped.
"""

from __future__ import annotations
from app.models import CartItem, SkippedItem


def _sanitize_text(text: str) -> str:
    """Remove fancy dashes and special characters, replace with ASCII equivalents."""
    replacements_map = {
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
    for fancy, plain in replacements_map.items():
        text = text.replace(fancy, plain)
    return text


def apply_rescue_mode(
    items: list[CartItem],
    skipped: list[SkippedItem],
    budget: float,
    required_categories: list[str] | None = None,
) -> tuple[list[CartItem], list[SkippedItem], str]:
    """
    Trim the cart to fit budget by removing lowest-priority items.
    Returns (trimmed_items, all_skipped, rescue_summary).
    """
    kept: list[CartItem] = []
    dropped: list[SkippedItem] = list(skipped)
    total = 0.0

    # Separate items by priority
    essential_items = [i for i in items if not i.is_forgotten_essential]
    forgotten_items = [i for i in items if i.is_forgotten_essential]

    # Add essentials first (cheapest first to maximize coverage)
    for item in sorted(essential_items, key=lambda i: i.price * i.quantity):
        cost = item.price * item.quantity
        if total + cost <= budget:
            kept.append(item)
            total += cost
        else:
            dropped.append(SkippedItem(
                id=item.id,
                name=item.name,
                reason=_sanitize_text("Dropped in Rescue Mode to fit budget."),
            ))

    # Then try to add forgotten essentials
    for item in sorted(forgotten_items, key=lambda i: i.price * i.quantity):
        cost = item.price * item.quantity
        if total + cost <= budget:
            kept.append(item)
            total += cost
        else:
            dropped.append(SkippedItem(
                id=item.id,
                name=item.name,
                reason=_sanitize_text("Forgotten essential dropped in Rescue Mode - budget too tight."),
            ))

    # Determine what categories are missing
    missing_categories = []
    if required_categories:
        covered = set(item.category for item in kept)
        missing_categories = [cat for cat in required_categories if cat not in covered]

    dropped_count = len(dropped) - len(skipped)
    parts = [
        f"Rescue Mode activated: removed {dropped_count} item(s) to fit budget.",
        f"Cart has {len(kept)} item(s) totaling Rs.{total:.0f}.",
    ]
    if missing_categories:
        parts.append(
            f"Missing categories: {', '.join(missing_categories)} - no products available within budget."
        )
    parts.append("Consider increasing budget for a complete cart.")

    summary = _sanitize_text(" ".join(parts))
    return kept, dropped, summary
