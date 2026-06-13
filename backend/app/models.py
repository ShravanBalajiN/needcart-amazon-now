from __future__ import annotations
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field


class CartMode(str, Enum):
    fastest = "fastest"
    budget = "budget"
    complete = "complete"
    balanced = "balanced"


class StressParams(BaseModel):
    override_budget: Optional[float] = None
    override_urgency_minutes: Optional[int] = None
    simulate_stockout_product_ids: List[str] = Field(default_factory=list)
    simulate_stockout_groups: List[str] = Field(default_factory=list)


class GenerateCartRequest(BaseModel):
    need: str
    mode: CartMode = CartMode.balanced
    stress: StressParams = Field(default_factory=StressParams)


class Constraints(BaseModel):
    budget: Optional[float] = None
    people_count: Optional[int] = None
    urgency_minutes: Optional[int] = None
    dietary_preference: Optional[str] = None


class CartItem(BaseModel):
    id: str
    name: str
    category: str
    price: float
    quantity: int
    eta_minutes: int
    reason: str
    is_forgotten_essential: bool = False


class Replacement(BaseModel):
    original_id: str
    original_name: str
    replacement_id: str
    replacement_name: str
    reason: str
    price_diff: float


class SkippedItem(BaseModel):
    id: str
    name: str
    reason: str


class CartScores(BaseModel):
    budget_fit: int
    eta_confidence: int
    completeness: int
    substitution_readiness: int


class GenerateCartResponse(BaseModel):
    detected_intent: str
    constraints: Constraints
    cart_status: str
    cart_mode: str
    summary: str
    items: List[CartItem]
    replacements: List[Replacement]
    skipped_items: List[SkippedItem]
    scores: CartScores
    total_price: float
    eta_minutes: int
    checkout_ready: bool
