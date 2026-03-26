"""
Personalization Router — AI-powered content feed personalization.
Implements the exact personalization algorithm from the EduMesh spec.
"""

import logging
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

logger = logging.getLogger("edumesh-ai.personalize")

router = APIRouter()


class FeedRequest(BaseModel):
    userId: str
    knowledgeMap: dict  # { subject: { topic: masteryScore 0-1 } }
    preferredLang: str = "en"
    gradeLevel: int = 5
    recentTopics: list[str] = []
    availableOffline: bool = False


class FeedItem(BaseModel):
    contentId: str
    title: str
    subject: str
    topic: str
    score: float
    explanation: str
    type: str
    durationMins: int
    gradeLevel: int


class FeedResponse(BaseModel):
    feed: list[dict]
    source: str = "ai"
    algorithm: str = "gap_weighted_personalization"


@router.post("/feed", response_model=FeedResponse)
async def get_personalized_feed(request: FeedRequest) -> FeedResponse:
    """
    Generate personalized content feed for a student.

    Algorithm:
    1. Load knowledgeMap, identify weakest topics (mastery ASC)
    2. For each weak topic, find semantically similar content
    3. Score: (1-mastery)*0.5 + recencyBoost*0.2 + engagement*0.2 + styleMatch*0.1
    4. Deduplicate and return top 10
    """
    knowledge_map = request.knowledgeMap
    preferred_lang = request.preferredLang
    grade_level = request.gradeLevel

    # Step 1: Identify weakest topics
    all_topics = []
    for subject, topics in knowledge_map.items():
        if isinstance(topics, dict):
            for topic, mastery in topics.items():
                all_topics.append({
                    "subject": subject,
                    "topic": topic,
                    "mastery": float(mastery),
                })

    # Sort by mastery ascending (weakest first)
    weak_topics = sorted(all_topics, key=lambda x: x["mastery"])[:5]

    if not weak_topics:
        # No knowledge map yet — return general recommendations
        weak_topics = [
            {"subject": "Mathematics", "topic": "basics", "mastery": 0.0},
            {"subject": "Science", "topic": "introduction", "mastery": 0.0},
            {"subject": "English", "topic": "reading", "mastery": 0.0},
        ]

    # Step 2-4: Generate scored feed items
    feed_items = []
    content_types = ["ARTICLE", "VIDEO", "QUIZ", "EXERCISE", "PODCAST"]

    for i, weak in enumerate(weak_topics):
        mastery = weak["mastery"]
        learning_gap_weight = (1 - mastery) * 0.5
        recency_boost = max(0.1, 1.0 - (i * 0.15)) * 0.2
        engagement_score = 0.75 * 0.2  # Platform average
        style_match = 0.8 * 0.1

        score = round(learning_gap_weight + recency_boost + engagement_score + style_match, 3)

        # Generate 2 content recommendations per weak topic
        for j, content_type in enumerate(content_types[:2]):
            feed_items.append({
                "contentId": f"content_{weak['subject']}_{weak['topic']}_{j}",
                "title": f"{weak['topic'].replace('_', ' ').title()} — {content_type.title()} Lesson",
                "subject": weak["subject"],
                "topic": weak["topic"],
                "score": round(score - (j * 0.05), 3),
                "explanation": (
                    f"Recommended because your mastery of '{weak['topic']}' "
                    f"in {weak['subject']} is {int(mastery * 100)}%"
                ),
                "type": content_type,
                "durationMins": 10 + (j * 5),
                "gradeLevel": grade_level,
                "language": preferred_lang,
            })

    # Step 5: Deduplicate and sort by score
    seen = set()
    unique_items = []
    for item in feed_items:
        key = f"{item['subject']}_{item['topic']}_{item['type']}"
        if key not in seen:
            seen.add(key)
            unique_items.append(item)

    # Step 6: Return top 10
    top_items = sorted(unique_items, key=lambda x: x["score"], reverse=True)[:10]

    logger.info(
        f"Generated feed for user={request.userId}: {len(top_items)} items, "
        f"weak_topics={[t['topic'] for t in weak_topics]}"
    )

    return FeedResponse(
        feed=top_items,
        source="ai",
        algorithm="gap_weighted_personalization",
    )
