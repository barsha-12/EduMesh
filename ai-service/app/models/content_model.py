"""
Pydantic models for content data.
"""

from pydantic import BaseModel
from typing import Optional
from enum import Enum


class ContentType(str, Enum):
    VIDEO = "VIDEO"
    ARTICLE = "ARTICLE"
    QUIZ = "QUIZ"
    EXERCISE = "EXERCISE"
    PODCAST = "PODCAST"


class ContentModel(BaseModel):
    """Content item structure for AI processing."""
    id: str
    title: str
    body: str
    type: ContentType
    subject: str
    topic: str
    gradeLevel: int
    language: str
    durationMins: int
    tags: list[str] = []


class ContentScore(BaseModel):
    """Scored content item for feed ranking."""
    contentId: str
    title: str
    subject: str
    topic: str
    score: float
    explanation: str
    type: str
    durationMins: int
    gradeLevel: int
