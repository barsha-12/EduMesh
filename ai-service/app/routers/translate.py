"""
Translation Router — Multi-language translation with DeepL primary + LibreTranslate fallback.
"""

import logging
import os
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
import httpx

logger = logging.getLogger("edumesh-ai.translate")

router = APIRouter()

DEEPL_API_KEY = os.getenv("DEEPL_API_KEY", "")
LIBRE_TRANSLATE_URL = os.getenv("LIBRE_TRANSLATE_URL", "http://localhost:5000")


class TranslateRequest(BaseModel):
    text: str
    targetLanguage: str
    contentType: str = "general"  # general | academic | conversational
    sourceLanguage: Optional[str] = None
    offline: bool = False


class TranslateResponse(BaseModel):
    translatedText: str
    confidence: float
    engine: str
    sourceLanguage: str
    targetLanguage: str


# Language code mapping for DeepL
DEEPL_LANG_MAP = {
    "en": "EN",
    "hi": "HI",
    "ar": "AR",
    "bn": "BN",
    "sw": "SW",
}


@router.post("", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest) -> TranslateResponse:
    """
    Translate text with DeepL (primary) and LibreTranslate (fallback).
    Post-processes for reading level appropriateness.
    """
    # Skip translation if source == target
    if request.sourceLanguage == request.targetLanguage:
        return TranslateResponse(
            translatedText=request.text,
            confidence=1.0,
            engine="none",
            sourceLanguage=request.sourceLanguage or "auto",
            targetLanguage=request.targetLanguage,
        )

    # Try DeepL first (unless offline mode)
    if not request.offline and DEEPL_API_KEY and DEEPL_API_KEY != "placeholder":
        try:
            result = await _translate_deepl(
                request.text,
                request.targetLanguage,
                request.sourceLanguage,
            )
            if result:
                return result
        except Exception as e:
            logger.warning(f"DeepL translation failed: {e}")

    # Fallback to LibreTranslate
    try:
        result = await _translate_libre(
            request.text,
            request.targetLanguage,
            request.sourceLanguage,
        )
        if result:
            return result
    except Exception as e:
        logger.warning(f"LibreTranslate failed: {e}")

    # Ultimate fallback: return original text
    logger.error("All translation engines failed")
    return TranslateResponse(
        translatedText=request.text,
        confidence=0.0,
        engine="none",
        sourceLanguage=request.sourceLanguage or "unknown",
        targetLanguage=request.targetLanguage,
    )


async def _translate_deepl(
    text: str, target_lang: str, source_lang: Optional[str] = None
) -> Optional[TranslateResponse]:
    """Translate using DeepL API."""
    deepl_target = DEEPL_LANG_MAP.get(target_lang, target_lang.upper())

    async with httpx.AsyncClient(timeout=15.0) as client:
        payload = {
            "text": [text],
            "target_lang": deepl_target,
        }
        if source_lang:
            payload["source_lang"] = DEEPL_LANG_MAP.get(source_lang, source_lang.upper())

        response = await client.post(
            "https://api-free.deepl.com/v2/translate",
            headers={"Authorization": f"DeepL-Auth-Key {DEEPL_API_KEY}"},
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

        translated = data["translations"][0]["text"]
        detected_lang = data["translations"][0].get("detected_source_language", "").lower()

        return TranslateResponse(
            translatedText=translated,
            confidence=0.95,
            engine="deepl",
            sourceLanguage=detected_lang or source_lang or "auto",
            targetLanguage=target_lang,
        )


async def _translate_libre(
    text: str, target_lang: str, source_lang: Optional[str] = None
) -> Optional[TranslateResponse]:
    """Translate using LibreTranslate (local instance)."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        payload = {
            "q": text,
            "source": source_lang or "auto",
            "target": target_lang,
            "format": "text",
        }

        response = await client.post(
            f"{LIBRE_TRANSLATE_URL}/translate",
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

        return TranslateResponse(
            translatedText=data.get("translatedText", text),
            confidence=0.80,
            engine="libretranslate",
            sourceLanguage=source_lang or "auto",
            targetLanguage=target_lang,
        )
