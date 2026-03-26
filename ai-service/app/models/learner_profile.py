"""
Pydantic models for learner profile data.
"""

from pydantic import BaseModel
from typing import Optional


class KnowledgeMapEntry(BaseModel):
    """A single topic mastery entry."""
    topic: str
    mastery: float  # 0.0 to 1.0


class LearnerProfile(BaseModel):
    """Complete learner profile for AI processing."""
    userId: str
    knowledgeMap: dict  # { subject: { topic: mastery } }
    learningStyle: str = "visual"
    pace: float = 1.0
    preferredLang: str = "en"
    gradeLevel: int = 5
    weeklyGoalMins: int = 60
    streakDays: int = 0
    totalMinutes: int = 0


class LearnerUpdate(BaseModel):
    """Partial update to a learner profile."""
    learningStyle: Optional[str] = None
    pace: Optional[float] = None
    preferredLang: Optional[str] = None
    weeklyGoalMins: Optional[int] = None
