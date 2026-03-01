import os
import json
import asyncio
import logging
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("insight-ai.llm")

# ---------------------------------------------------------------------------
# Groq Configuration (OpenAI-compatible SDK)
# ---------------------------------------------------------------------------
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY is not set in the environment.")

client = AsyncOpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1"
)

MODEL = "llama-3.3-70b-versatile"

# ---------------------------------------------------------------------------
# Light rate-limiter: Groq free tier is generous (30 req/min, 14400/day)
# but we still serialize to avoid bursts on concurrent gather() calls.
# ---------------------------------------------------------------------------
_semaphore = asyncio.Semaphore(2)
_INTER_CALL_DELAY = 0.5  # half-second gap between calls


async def generate_json(prompt: str, system: str, model_override: str = None) -> dict:
    """Generate strict JSON using the Groq LLM API."""
    try:
        async with _semaphore:
            await asyncio.sleep(_INTER_CALL_DELAY)
            response = await client.chat.completions.create(
                model=model_override or MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            content = response.choices[0].message.content
            return json.loads(content)
    except Exception as e:
        logger.error(f"LLM JSON generation failed: {e}")
        return {"error": str(e)}


async def generate_text(prompt: str, system: str, model_override: str = None) -> str:
    """Generate standard text response using the Groq LLM API."""
    try:
        async with _semaphore:
            await asyncio.sleep(_INTER_CALL_DELAY)
            response = await client.chat.completions.create(
                model=model_override or MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            return response.choices[0].message.content
    except Exception as e:
        logger.error(f"LLM text generation failed: {e}")
        return ""
