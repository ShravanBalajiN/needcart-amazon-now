import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

# Bedrock integration - default OFF for stable hackathon demo
USE_BEDROCK: bool = os.getenv("USE_BEDROCK", "false").lower() == "true"
AWS_REGION: str = os.getenv("AWS_REGION", os.getenv("BEDROCK_REGION", "us-east-1"))
BEDROCK_REGION: str = os.getenv("BEDROCK_REGION", AWS_REGION)
BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")

# OpenRouter LLM integration - default OFF
USE_LLM: bool = os.getenv("USE_LLM", "false").lower() == "true"
LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openrouter")
OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")
OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_SITE_URL: str = os.getenv("OPENROUTER_SITE_URL", "http://localhost:5173")
OPENROUTER_APP_NAME: str = os.getenv("OPENROUTER_APP_NAME", "NeedCart")
