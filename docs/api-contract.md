# NeedCart API Contract

Backend Base URL:

Local:

```txt
http://127.0.0.1:8000
```

Frontend environment variable:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 1. Health Check

### Endpoint

```http
GET /health
```

### Response

```json
{
  "status": "ok",
  "service": "NeedCart Backend"
}
```

---

## 2. Demo Scenarios

### Endpoint

```http
GET /api/demo-scenarios
```

### Purpose

Returns preset prompts for frontend scenario chips.

### Expected Response

```json
[
  {
    "id": "guests",
    "label": "Guests Coming",
    "prompt": "Guests are coming in 30 minutes. Need snacks and drinks for 6 people under 500 rupees."
  },
  {
    "id": "breakfast",
    "label": "Breakfast Rush",
    "prompt": "Need quick breakfast for 3 people in 15 minutes under 300 rupees."
  },
  {
    "id": "fever",
    "label": "Child Fever Essentials",
    "prompt": "My child has fever at night. Need safe essentials quickly under 600 rupees."
  },
  {
    "id": "power_cut",
    "label": "Power Cut",
    "prompt": "Power cut happened. Need emergency items in 20 minutes under 700 rupees."
  }
]
```

---

## 3. Generate Cart

### Endpoint

```http
POST /api/generate-cart
```

### Purpose

Main endpoint. Converts urgent user need into a ready-to-checkout NeedCart response.

### Request Body

```json
{
  "need": "Guests are coming in 30 minutes. Need snacks and drinks for 6 people under 500 rupees.",
  "mode": "balanced",
  "stress": {
    "override_budget": null,
    "override_urgency_minutes": null,
    "simulate_stockout_product_ids": [],
    "simulate_stockout_groups": []
  }
}
```

### Allowed `mode` values

```txt
balanced
budget
fastest
complete
```

### Stress Test Fields

| Field | Type | Purpose |
|---|---|---|
| `override_budget` | number or null | Forces budget during demo |
| `override_urgency_minutes` | number or null | Forces urgency window |
| `simulate_stockout_product_ids` | string[] | Simulates stockout for specific product IDs |
| `simulate_stockout_groups` | string[] | Simulates stockout for category/group |

Example stockout test:

```json
{
  "need": "Guests are coming in 30 minutes. Need snacks and drinks for 6 people under 500 rupees.",
  "mode": "balanced",
  "stress": {
    "override_budget": null,
    "override_urgency_minutes": null,
    "simulate_stockout_product_ids": ["P001", "P004"],
    "simulate_stockout_groups": []
  }
}
```

---

## 4. Generate Cart Response

### Response Body

```json
{
  "detected_intent": "guests_arriving",
  "constraints": {
    "budget": 500,
    "people_count": 6,
    "urgency_minutes": 30,
    "dietary_preference": "veg"
  },
  "cart_status": "Complete Cart",
  "cart_mode": "Balanced",
  "summary": "Built guests arriving cart with 6 items within Rs.500 budget.",
  "items": [
    {
      "id": "P001",
      "name": "Masala Chips Large Pack",
      "category": "snacks",
      "price": 80,
      "quantity": 1,
      "eta_minutes": 9,
      "reason": "Essential item for guests arriving, available now.",
      "is_forgotten_essential": false
    }
  ],
  "replacements": [
    {
      "original_id": "P004",
      "original_name": "Cola 1.5L",
      "replacement_id": "P030",
      "replacement_name": "Lemon Soda 300ml x4",
      "reason": "Original item unavailable; replacement keeps the same need coverage within budget and ETA.",
      "price_diff": 25
    }
  ],
  "skipped_items": [
    {
      "id": "P001",
      "name": "Masala Chips Large Pack",
      "reason": "Out of stock with no available substitute within budget."
    }
  ],
  "scores": {
    "budget_fit": 100,
    "eta_confidence": 93,
    "completeness": 100,
    "substitution_readiness": 41
  },
  "total_price": 295,
  "eta_minutes": 10,
  "checkout_ready": true
}
```

---

## 5. Important Frontend Rules

### Do not hardcode final cart items in frontend.

Frontend should render whatever backend returns.

### Frontend must support these UI sections:

1. User need input
2. Voice input button
3. Scenario chips
4. Cart mode selector
5. Stress test panel
6. Detected intent and constraints
7. Cart status and summary
8. Cart health scores
9. Cart item cards
10. Replacements panel
11. Skipped items panel
12. Confirm cart mock button

---

## 6. Cart Status Values

Backend can return:

```txt
Complete Cart
Budget-Optimized Cart
Substituted Cart
Rescue Cart
Partial Cart
```

Frontend should display `cart_status` exactly as returned.

---

## 7. Demo Scenarios to Support

### Guests Coming

```txt
Guests are coming in 30 minutes. Need snacks and drinks for 6 people under 500 rupees.
```

Expected behavior:

- Budget 500: complete/substituted cart
- Budget 300: budget-optimized cart
- Stockout P001/P004: substituted cart

### Breakfast Rush

```txt
Need quick breakfast for 3 people in 15 minutes under 300 rupees.
```

Expected behavior:

- Fast breakfast cart
- ETA around 8-12 minutes
- Total under 300

### Child Fever Essentials

```txt
My child has fever at night. Need safe essentials quickly under 600 rupees.
```

Expected behavior:

- No medication
- Non-prescription support essentials only
- Safety note in summary

### Power Cut

```txt
Power cut happened. Need emergency items in 20 minutes under 700 rupees.
```

Expected behavior:

- Emergency items
- No guest-serving reason text
- Total under 700

---

## 8. Frontend API Helper Example

Create `frontend/src/api.js`:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function generateCart(payload) {
  const response = await fetch(`${API_BASE_URL}/api/generate-cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to generate cart");
  }

  return response.json();
}

export async function getDemoScenarios() {
  const response = await fetch(`${API_BASE_URL}/api/demo-scenarios`);

  if (!response.ok) {
    throw new Error("Failed to fetch demo scenarios");
  }

  return response.json();
}

export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error("Backend health check failed");
  }

  return response.json();
}
```

---

## 9. Frontend Generate Cart Payload Example

```js
const payload = {
  need: userNeed,
  mode: selectedMode,
  stress: {
    override_budget: selectedBudgetOverride,
    override_urgency_minutes: selectedUrgencyOverride,
    simulate_stockout_product_ids: selectedStockoutProductIds,
    simulate_stockout_groups: selectedStockoutGroups,
  },
};
```