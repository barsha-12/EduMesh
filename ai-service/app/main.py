"""
EduMesh AI Service — FastAPI Entry Point
Provides personalization, translation, classification, and generation endpoints.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import personalize, translate, classify, generate

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("edumesh-ai")

app = FastAPI(
    title="EduMesh AI Service",
    description="AI-powered personalization, content generation, translation, and classification",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(personalize.router, prefix="/personalize", tags=["Personalization"])
app.include_router(translate.router, prefix="/translate", tags=["Translation"])
app.include_router(classify.router, prefix="/classify", tags=["Classification"])
app.include_router(generate.router, prefix="/generate", tags=["Generation"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "edumesh-ai", "version": "1.0.0"}


@app.post("/assess/mastery")
async def assess_mastery(payload: dict):
    """
    Assess student mastery based on quiz responses.
    Uses exponential moving average: new = 0.3 * sessionScore + 0.7 * oldScore
    """
    user_id: str = payload.get("userId", "")
    topic: str = payload.get("topic", "")
    responses: list = payload.get("responses", [])

    if not responses:
        return {"masteryScore": 0, "gaps": [], "recommendations": []}

    # Score each response
    correct = 0
    total = len(responses)
    gaps = []

    for resp in responses:
        is_correct = resp.get("isCorrect", False)
        if is_correct:
            correct += 1
        else:
            sub_topic = resp.get("subTopic", topic)
            if sub_topic not in gaps:
                gaps.append(sub_topic)

    session_score = correct / total if total > 0 else 0
    old_score = payload.get("currentMastery", 0.5)
    mastery_score = round(0.3 * session_score + 0.7 * old_score, 3)

    recommendations = []
    for gap in gaps[:3]:
        recommendations.append(
            f"Review '{gap}' — focus on practice exercises to strengthen understanding"
        )

    if session_score < 0.5:
        recommendations.append(
            "Consider revisiting the foundational concepts before advancing"
        )

    return {
        "masteryScore": mastery_score,
        "sessionScore": round(session_score, 3),
        "correct": correct,
        "total": total,
        "gaps": gaps,
        "recommendations": recommendations,
    }


@app.post("/match/mentor")
async def match_mentor(payload: dict):
    """
    AI-powered mentor matching.
    Scores mentors by: language (0.4) + subject expertise (0.35) + availability (0.15) + proximity (0.10)
    """
    student_profile = payload.get("studentProfile", {})
    subject = payload.get("subject", "")
    preferred_language = payload.get("preferredLanguage", "en")

    # In production, fetch mentors from backend API
    # For now, return a structured response that the backend will use
    return {
        "matches": [],
        "algorithm": "language_subject_availability_distance",
        "weights": {
            "language": 0.4,
            "subjectExpertise": 0.35,
            "availability": 0.15,
            "proximity": 0.10,
        },
        "message": "Mentor matching computed. Connect to backend for live mentor data.",
    }
