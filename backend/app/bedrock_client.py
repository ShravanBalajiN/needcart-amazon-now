"""
AWS Bedrock client stub.
Currently disabled (USE_BEDROCK=false). When enabled, this module will
handle LLM-based intent parsing and natural language generation.
"""

from __future__ import annotations
from app.config import USE_BEDROCK, BEDROCK_REGION, BEDROCK_MODEL_ID


def is_enabled() -> bool:
    """Check if Bedrock integration is active."""
    return USE_BEDROCK


def parse_intent_with_llm(text: str) -> dict | None:
    """
    Parse user intent using Bedrock LLM.
    Returns None when USE_BEDROCK is False (deterministic parsing is used instead).
    """
    if not USE_BEDROCK:
        return None

    # TODO: Implement Bedrock invocation
    # import boto3
    # client = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)
    # response = client.invoke_model(...)
    raise NotImplementedError("Bedrock integration not yet implemented.")


def generate_summary_with_llm(intent: str, items: list, constraints: dict) -> str | None:
    """
    Generate a natural language cart summary using Bedrock.
    Returns None when USE_BEDROCK is False (template summary is used instead).
    """
    if not USE_BEDROCK:
        return None

    # TODO: Implement Bedrock invocation for summary generation
    raise NotImplementedError("Bedrock integration not yet implemented.")
