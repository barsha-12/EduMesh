"""
Classification Router — Zero-shot content classification using scikit-learn.
"""

import logging
from fastapi import APIRouter
from pydantic import BaseModel

logger = logging.getLogger("edumesh-ai.classify")

router = APIRouter()

# Predefined categories
SUBJECTS = [
    "Mathematics", "Science", "English", "Civic Education",
    "History", "Geography", "Computer Science", "Arts",
]
CONTENT_TYPES = ["VIDEO", "ARTICLE", "QUIZ", "EXERCISE", "PODCAST"]
GRADE_RANGES = [(1, 3), (4, 6), (7, 9), (10, 12)]

# Keywords for simple keyword-based classification (production would use ML)
SUBJECT_KEYWORDS = {
    "Mathematics": ["math", "algebra", "geometry", "calculus", "fraction", "equation", "number", "arithmetic"],
    "Science": ["science", "biology", "chemistry", "physics", "experiment", "atom", "cell", "energy"],
    "English": ["english", "grammar", "reading", "writing", "vocabulary", "literature", "essay", "poem"],
    "Civic Education": ["civic", "government", "democracy", "rights", "constitution", "law", "citizen", "vote"],
    "History": ["history", "war", "civilization", "ancient", "revolution", "century", "empire"],
    "Geography": ["geography", "map", "climate", "continent", "ocean", "country", "terrain"],
    "Computer Science": ["computer", "programming", "code", "algorithm", "software", "data", "internet"],
    "Arts": ["art", "music", "painting", "sculpture", "dance", "theater", "creative"],
}


class ClassifyRequest(BaseModel):
    title: str
    body: str
    tags: list[str] = []


class ClassifyResponse(BaseModel):
    subject: str
    topic: str
    gradeRange: list[int]
    contentType: str
    safetyScore: float
    confidence: float
    tags: list[str]


# Unsafe content keywords
UNSAFE_KEYWORDS = [
    "violence", "weapon", "drug", "explicit", "hate", "abuse",
    "gambling", "extremism", "harassment",
]


@router.post("/content", response_model=ClassifyResponse)
async def classify_content(request: ClassifyRequest) -> ClassifyResponse:
    """
    Classify content by subject, topic, grade level, and content type.
    Uses keyword-based classification with safety scoring.
    """
    text = f"{request.title} {request.body} {' '.join(request.tags)}".lower()

    # Classify subject
    subject_scores: dict[str, int] = {}
    for subject, keywords in SUBJECT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            subject_scores[subject] = score

    if subject_scores:
        subject = max(subject_scores, key=subject_scores.get)
        confidence = min(1.0, subject_scores[subject] / 5)
    else:
        subject = "General"
        confidence = 0.3

    # Extract topic from title
    topic = request.title.strip()
    if len(topic) > 50:
        topic = topic[:50]

    # Estimate grade level from text complexity
    words = text.split()
    avg_word_length = sum(len(w) for w in words) / max(len(words), 1)
    sentence_count = max(text.count(".") + text.count("!") + text.count("?"), 1)
    avg_sentence_length = len(words) / sentence_count

    if avg_word_length < 4 and avg_sentence_length < 10:
        grade_range = [1, 3]
    elif avg_word_length < 5 and avg_sentence_length < 15:
        grade_range = [4, 6]
    elif avg_word_length < 6 and avg_sentence_length < 20:
        grade_range = [7, 9]
    else:
        grade_range = [10, 12]

    # Detect content type
    content_type = "ARTICLE"  # default
    if any(kw in text for kw in ["video", "watch", "tutorial"]):
        content_type = "VIDEO"
    elif any(kw in text for kw in ["quiz", "question", "test", "exam"]):
        content_type = "QUIZ"
    elif any(kw in text for kw in ["exercise", "practice", "solve", "worksheet"]):
        content_type = "EXERCISE"
    elif any(kw in text for kw in ["podcast", "listen", "audio", "episode"]):
        content_type = "PODCAST"

    # Safety scoring
    unsafe_count = sum(1 for kw in UNSAFE_KEYWORDS if kw in text)
    safety_score = round(max(0, 1.0 - (unsafe_count * 0.2)), 2)

    # Auto-generate tags
    auto_tags = list(set(request.tags + [subject.lower(), content_type.lower()]))

    logger.info(
        f"Classified: subject={subject}, type={content_type}, "
        f"grade={grade_range}, safety={safety_score}"
    )

    return ClassifyResponse(
        subject=subject,
        topic=topic,
        gradeRange=grade_range,
        contentType=content_type,
        safetyScore=safety_score,
        confidence=round(confidence, 2),
        tags=auto_tags,
    )
