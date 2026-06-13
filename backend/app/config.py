import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

USE_BEDROCK: bool = os.getenv("USE_BEDROCK", "false").lower() == "true"
BEDROCK_REGION: str = os.getenv("BEDROCK_REGION", "us-east-1")
BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")
