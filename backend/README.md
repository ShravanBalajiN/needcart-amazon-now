# NeedCart Backend

FastAPI backend for NeedCart — converts urgent real-world shopping situations into ready-to-checkout carts.

## Quick Start

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (if not exists)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

# Run the server
uvicorn app.main:app --reload
```

Server runs at `http://127.0.0.1:8000`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/demo-scenarios` | Sample prompts for the frontend |
| GET | `/api/catalog` | Full product catalog |
| POST | `/api/generate-cart` | Generate optimized cart from need text |

## Cart Modes

| Mode | Strategy |
|------|----------|
| `fastest` | Prioritize lowest ETA items |
| `budget` | Prioritize cheapest items, minimal quantities |
| `complete` | Fill all categories, required before optional |
| `balanced` | Weighted blend of ETA + price |

## Stress Testing

The `stress` parameter in `/api/generate-cart` supports:

- `override_budget` — Force a different budget
- `override_urgency_minutes` — Force a different time constraint
- `simulate_stockout_product_ids` — List of product IDs to treat as out-of-stock
- `simulate_stockout_groups` — List of categories or substitute groups to mark unavailable

## Rescue Mode

Triggered automatically when the cart cannot fit budget after:
1. Removing optional items
2. Swapping to cheaper alternatives
3. Reducing pack sizes

Returns the best possible cart with skipped items and an honest summary.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app + endpoints
│   ├── models.py            # Pydantic models
│   ├── config.py            # Environment config
│   ├── intent_parser.py     # Regex-based intent detection
│   ├── cart_optimizer.py    # Cart building logic
│   ├── substitution_engine.py  # Product substitution
│   ├── rescue_engine.py     # Rescue Mode handling
│   ├── scoring.py           # Cart quality scores
│   └── bedrock_client.py    # AWS Bedrock stub (future)
├── data/
│   ├── catalog.json         # Mock product catalog
│   └── need_templates.json  # Intent templates
├── .env.example
├── requirements.txt
└── README.md
```

## Bedrock Integration (Future)

Set `USE_BEDROCK=true` in `.env` when ready. The `bedrock_client.py` stub is prepared for:
- LLM-based intent parsing (richer understanding)
- Natural language summary generation

Currently uses deterministic regex parsing only.
