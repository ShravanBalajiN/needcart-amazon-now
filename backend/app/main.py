"""
NeedCart Backend - FastAPI application entry point.
Converts urgent real-world shopping situations into ready-to-checkout carts.
"""

from __future__ import annotations
import json
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import DATA_DIR
from app.models import (
    CartMode, GenerateCartRequest, GenerateCartResponse, StressParams,
)
from app.intent_parser import parse_need, NEED_TEMPLATES

# Configure logging so app loggers show in uvicorn output
logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
logging.getLogger("app").setLevel(logging.INFO)
from app.cart_optimizer import build_cart
from app.rescue_engine import apply_rescue_mode
from app.scoring import compute_scores

# Load catalog once at startup
with open(DATA_DIR / "catalog.json", "r", encoding="utf-8") as f:
    CATALOG: list[dict] = json.load(f)

app = FastAPI(
    title="NeedCart Backend",
    description="Converts urgent real-world shopping situations into ready-to-checkout carts.",
    version="0.1.0",
)

# CORS for frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "NeedCart Backend"}


@app.get("/api/demo-scenarios")
def demo_scenarios():
    """Return sample prompt scenarios for the frontend."""
    scenarios = []
    for key, template in NEED_TEMPLATES.items():
        scenarios.append({
            "id": key,
            "label": template["label"],
            "prompt": template["prompt"],
        })
    return scenarios


@app.get("/api/catalog")
def get_catalog():
    """Return the full product catalog."""
    return CATALOG


@app.post("/api/generate-cart", response_model=GenerateCartResponse)
def generate_cart(request: GenerateCartRequest):
    """
    Main cart generation endpoint.
    Parses intent, builds optimized cart, handles budget constraints,
    stockouts, forgotten essentials, and Rescue Mode.
    """
    try:
        # Parse need text into intent + constraints
        intent, constraints = parse_need(
            text=request.need,
            override_budget=request.stress.override_budget,
            override_urgency=request.stress.override_urgency_minutes,
        )

        # Build the cart
        items, replacements, skipped, rescue_triggered = build_cart(
            intent=intent,
            constraints=constraints,
            mode=request.mode,
            stress=request.stress,
        )

        # Get template for category checks
        template = NEED_TEMPLATES.get(intent, {})
        required_categories = set(template.get("required_categories", []))

        # Apply Rescue Mode if needed
        summary = ""
        if rescue_triggered:
            budget = constraints.budget or 9999
            items, skipped, summary = apply_rescue_mode(
                items, skipped, budget,
                required_categories=list(required_categories),
            )
            cart_status = "Rescue Cart"
        else:
            # Determine cart status based on rules
            cart_status = _determine_cart_status(
                items=items,
                replacements=replacements,
                skipped=skipped,
                mode=request.mode,
                required_categories=required_categories,
                budget=constraints.budget,
            )
            summary = _build_summary(intent, items, constraints, request.mode, cart_status, replacements)

        # Compute scores
        scores = compute_scores(
            items=items,
            constraints=constraints,
            intent=intent,
            stress=request.stress,
            rescue_triggered=rescue_triggered,
        )

        # Calculate totals
        total_price = sum(item.price * item.quantity for item in items)
        eta_minutes = max((item.eta_minutes for item in items), default=0)

        # Mode label
        mode_labels = {
            CartMode.fastest: "Fastest",
            CartMode.budget: "Budget",
            CartMode.complete: "Complete",
            CartMode.balanced: "Balanced",
        }

        # Map internal intent to external display name
        display_intent = template.get("intent", intent)

        return GenerateCartResponse(
            detected_intent=display_intent,
            constraints=constraints,
            cart_status=cart_status,
            cart_mode=mode_labels.get(request.mode, "Balanced"),
            summary=_sanitize_text(summary),
            items=items,
            replacements=replacements,
            skipped_items=skipped,
            scores=scores,
            total_price=total_price,
            eta_minutes=eta_minutes,
            checkout_ready=len(items) > 0 and not rescue_triggered,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cart generation failed: {str(e)}")


def _determine_cart_status(
    items: list,
    replacements: list,
    skipped: list,
    mode: CartMode,
    required_categories: set[str],
    budget: float | None,
) -> str:
    """
    Determine cart status based on rules:
    - Budget-Optimized Cart: budget mode + required categories filled with value items
    - Complete Cart: all required categories filled and budget respected
    - Substituted Cart: any item was replaced due to stockout (non-budget mode)
    - Rescue Cart: not all required categories filled but cart solves minimum need
    - Partial Cart: genuinely incomplete and no rescue logic applies
    """
    covered_categories = set(item.category for item in items)
    required_covered = required_categories.issubset(covered_categories) if required_categories else True

    total = sum(item.price * item.quantity for item in items)
    within_budget = (budget is None) or (total <= budget)

    # Budget mode with required categories filled = Budget-Optimized Cart
    # This takes priority over Substituted Cart in budget mode
    if mode == CartMode.budget and required_covered and within_budget:
        return "Budget-Optimized Cart"

    # If replacements happened and required categories covered, it's a Substituted Cart
    if replacements and required_covered and within_budget:
        return "Substituted Cart"

    # All required categories filled and budget respected = Complete Cart
    if required_covered and within_budget:
        return "Complete Cart"

    # If we have items but not all required categories - check if minimum need is met
    if items and not required_covered:
        # At least half of required categories covered = Rescue Cart
        if required_categories:
            coverage_ratio = len(required_categories & covered_categories) / len(required_categories)
            if coverage_ratio >= 0.5:
                return "Rescue Cart"
        return "Partial Cart"

    # Fallback
    if not items:
        return "Partial Cart"

    return "Complete Cart"


def _build_summary(
    intent: str, items: list, constraints, mode: CartMode,
    cart_status: str, replacements: list
) -> str:
    """Generate a human-readable summary for the cart."""
    intent_label = intent.replace("_", " ")
    item_count = len(items)
    total = sum(i.price * i.quantity for i in items)
    has_forgotten = any(i.is_forgotten_essential for i in items)

    if cart_status == "Budget-Optimized Cart":
        parts = [f"Budget-optimized {intent_label} cart with {item_count} items"]
        if constraints.budget:
            parts.append(f"within Rs.{constraints.budget:.0f} budget (total Rs.{total:.0f})")
        if has_forgotten:
            parts.append("- forgotten essentials included")
        summary = " ".join(parts) + "."
    elif cart_status == "Substituted Cart":
        parts = [f"Built {intent_label} cart with {item_count} items"]
        parts.append(f"- {len(replacements)} item(s) substituted due to stockouts")
        if constraints.budget:
            parts.append(f"within Rs.{constraints.budget:.0f} budget")
        summary = " ".join(parts) + "."
    else:
        # Complete Cart or default
        parts = [f"Complete {intent_label} cart with {item_count} items"]
        if constraints.budget:
            parts.append(f"within Rs.{constraints.budget:.0f} budget")
        if has_forgotten:
            parts.append("- forgotten essentials included")
        summary = " ".join(parts) + "."

    # Append safety note for child_fever
    if intent == "child_fever":
        summary += " Non-prescription support essentials only. Please consult a doctor for medication or emergency symptoms."

    return summary
