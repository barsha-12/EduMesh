"""
Generation Router — AI-powered content explanation generation.
Uses GPT-4o with learning-style-adapted prompts.
"""

import logging
import os
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

logger = logging.getLogger("edumesh-ai.generate")

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


class ExplanationRequest(BaseModel):
    topic: str
    gradeLevel: int = 5
    language: str = "en"
    learningStyle: str = "visual"  # visual | auditory | kinesthetic | reading


class ExplanationResponse(BaseModel):
    summary: str
    mainExplanation: str
    example: str
    checkQuestion: str
    learningStyle: str
    generatedBy: str


# Learning style prompt templates
STYLE_PROMPTS = {
    "visual": (
        "Use vivid analogies, visual metaphors, and describe diagrams or mental images. "
        "Help the student 'see' the concept. Use bullet points and structured formatting."
    ),
    "auditory": (
        "Write as if you're explaining aloud. Use conversational tone, rhymes, or mnemonics. "
        "Include 'imagine hearing...' or 'think of it like a conversation...'"
    ),
    "kinesthetic": (
        "Focus on hands-on, step-by-step activities. Include 'try this...' exercises. "
        "Relate concepts to physical actions or real-world manipulation."
    ),
    "reading": (
        "Provide detailed written explanations with definitions, key terms highlighted, "
        "and references. Use formal academic structure with clear paragraphs."
    ),
}

# Grade-appropriate vocabulary guidelines
GRADE_VOCAB = {
    (1, 3): "Use very simple words. Short sentences. Concrete examples only. For ages 6-8.",
    (4, 6): "Use simple but expanding vocabulary. Introduce new terms gently. For ages 9-11.",
    (7, 9): "Use grade-appropriate academic vocabulary. Some abstraction allowed. For ages 12-14.",
    (10, 12): "Use advanced vocabulary. Abstract reasoning welcome. For ages 15-18.",
}


def _get_vocab_guide(grade_level: int) -> str:
    """Get appropriate vocabulary guidelines for grade level."""
    for (low, high), guide in GRADE_VOCAB.items():
        if low <= grade_level <= high:
            return guide
    return GRADE_VOCAB[(7, 9)]


@router.post("/explanation", response_model=ExplanationResponse)
async def generate_explanation(request: ExplanationRequest) -> ExplanationResponse:
    """
    Generate a learning-style-adapted explanation.
    Tries GPT-4o first, falls back to template-based generation.
    """
    style_prompt = STYLE_PROMPTS.get(request.learningStyle, STYLE_PROMPTS["visual"])
    vocab_guide = _get_vocab_guide(request.gradeLevel)

    # Try OpenAI if API key available
    if OPENAI_API_KEY and OPENAI_API_KEY not in ("sk-...", "sk-placeholder", ""):
        try:
            result = await _generate_with_openai(
                request.topic, request.gradeLevel, request.language,
                style_prompt, vocab_guide
            )
            if result:
                return result
        except Exception as e:
            logger.warning(f"OpenAI generation failed: {e}")

    # Fallback: template-based generation
    return _generate_template(request, style_prompt, vocab_guide)


async def _generate_with_openai(
    topic: str, grade_level: int, language: str,
    style_prompt: str, vocab_guide: str
) -> Optional[ExplanationResponse]:
    """Generate explanation using OpenAI GPT-4o."""
    import httpx

    system_prompt = (
        f"You are an expert educator creating content for grade {grade_level} students. "
        f"{vocab_guide} "
        f"Learning style adaptation: {style_prompt} "
        f"Language: {language}. "
        "Respond in JSON with keys: summary, mainExplanation, example, checkQuestion"
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Explain: {topic}"},
                ],
                "temperature": 0.7,
                "max_tokens": 1000,
                "response_format": {"type": "json_object"},
            },
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]

        import json
        parsed = json.loads(content)

        return ExplanationResponse(
            summary=parsed.get("summary", ""),
            mainExplanation=parsed.get("mainExplanation", ""),
            example=parsed.get("example", ""),
            checkQuestion=parsed.get("checkQuestion", ""),
            learningStyle=topic,
            generatedBy="gpt-4o",
        )


def _generate_template(
    request: ExplanationRequest,
    style_prompt: str,
    vocab_guide: str,
) -> ExplanationResponse:
    """Fallback template-based explanation generation."""
    topic = request.topic
    grade = request.gradeLevel
    style = request.learningStyle

    if style == "visual":
        explanation = (
            f"Imagine {topic} as a picture in your mind. "
            f"Think of it like building blocks that fit together. "
            f"Each part connects to make the whole concept clear."
        )
        example = f"Picture this: {topic} works like a puzzle where each piece has its place."
    elif style == "kinesthetic":
        explanation = (
            f"Let's learn {topic} by doing! "
            f"Try this activity: take a piece of paper and work through each step. "
            f"Practice makes this concept stick."
        )
        example = f"Hands-on activity: work through a {topic} problem step by step."
    elif style == "auditory":
        explanation = (
            f"Think of {topic} like a story being told. "
            f"Listen to the rhythm of how the ideas connect. "
            f"Each concept flows naturally into the next."
        )
        example = f"Imagine someone explaining {topic} to you in a conversation."
    else:
        explanation = (
            f"{topic} is an important concept to understand thoroughly. "
            f"Here are the key points to study and remember. "
            f"Take notes as you read through each section."
        )
        example = f"Read the following detailed example about {topic} carefully."

    check_question = f"Can you explain {topic} in your own words? What are the key points?"

    return ExplanationResponse(
        summary=f"A {style}-focused explanation of {topic} for grade {grade} students.",
        mainExplanation=explanation,
        example=example,
        checkQuestion=check_question,
        learningStyle=style,
        generatedBy="template",
    )
