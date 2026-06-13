"""
Cart scoring engine - produces quality scores for the generated cart.
"""

from __future__ import annotations
from app.models import CartItem, CartScores, Constraints, StressParams
from app.substitution_engine import get_substitution_readiness


def compute_scores(
    items: list[CartItem],
    constraints: Constraints,
    intent: str,
    stress: StressParams,
    rescue_triggered: bool,
) -> CartScores:
    """Compute cart quality scores (0-100 each)."""
    budget_fit = _score_budget_fit(items, constraints.budget)
    eta_confidence = _score_eta(items, constraints.urgency_minutes)
    completeness = _score_completeness(items, intent, rescue_triggered)
    sub_readiness = get_substitution_readiness(intent, stress)

    return CartScores(
        budget_fit=budget_fit,
        eta_confidence=eta_confidence,
        completeness=completeness,
        substitution_readiness=sub_readiness,
    )


def _score_budget_fit(items: list[CartItem], budget: float | None) -> int:
    """
    Score how well the cart fits the budget.
    - 100 if total is between 85%-100% of budget
    - 85 if total is between 70%-85% of budget
    - 70 if total is below 70% of budget
    - Lower if over budget
    """
    if not budget or budget <= 0:
        return 100
    total = sum(item.price * item.quantity for item in items)
    if total == 0:
        return 0

    ratio = total / budget

    if ratio > 1.0:
        # Over budget - penalize heavily
        overshoot = ratio - 1.0
        return max(0, int(60 - overshoot * 200))
    elif ratio >= 0.85:
        # Sweet spot: 85-100% of budget used
        return 100
    elif ratio >= 0.70:
        # Good: 70-85% of budget used
        return 85
    else:
        # Below 70% - decent but not great utilization
        return 70


def _score_eta(items: list[CartItem], urgency_minutes: int | None) -> int:
    """Score delivery confidence based on max ETA vs urgency requirement."""
    if not items:
        return 0
    if not urgency_minutes:
        return 85  # No urgency constraint, default good score

    max_eta = max(item.eta_minutes for item in items)
    if max_eta <= urgency_minutes:
        # All items arrive in time
        buffer_ratio = (urgency_minutes - max_eta) / urgency_minutes
        return min(100, int(80 + buffer_ratio * 20))
    else:
        # Some items may be late
        overshoot = (max_eta - urgency_minutes) / urgency_minutes
        return max(30, int(80 - overshoot * 100))


def _score_completeness(items: list[CartItem], intent: str, rescue_triggered: bool) -> int:
    """Score cart completeness based on required category coverage."""
    if not items:
        return 0
    if rescue_triggered:
        return max(40, 60)

    from app.intent_parser import NEED_TEMPLATES
    template = NEED_TEMPLATES.get(intent, {})
    required_categories = set(template.get("required_categories", []))

    if not required_categories:
        return 90

    covered = set(item.category for item in items)
    coverage = len(required_categories & covered) / len(required_categories)

    has_forgotten = any(item.is_forgotten_essential for item in items)
    bonus = 10 if has_forgotten else 0

    # Base score from coverage (0-80) + forgotten bonus (0-10) + base (5)
    base_score = int(coverage * 80 + bonus + 5)

    # Additional bonus for having multiple items (variety)
    variety_bonus = min(10, len(items) * 2)

    return min(100, base_score + variety_bonus)
