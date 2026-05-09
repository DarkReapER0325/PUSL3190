from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional
from datetime import datetime, timezone

from database import Base


class User(Base):
    # Primary user account table used for authentication and profile data.
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    # Temporary password-reset token and expiry managed by forgot/reset flows.
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)


class GenerationHistory(Base):
    # Stores generated test-case outputs per user for history retrieval.
    __tablename__ = "generation_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user_story = Column(Text, nullable=False)
    detected_intent = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    # Persist test cases as serialized JSON text to keep a simple schema.
    test_cases_json = Column(Text, nullable=False)

    # Use UTC timestamps so ordering stays consistent across environments.
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    # ORM relationship for joining history rows back to the owning user.
    user = relationship("User")

    rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    feedback_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)



# New tables for DB-driven system

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String, unique=True, index=True)
    description = Column(String)


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    intent = Column(String, index=True)
    scenario_type = Column(String)


class UserStory(Base):
    __tablename__ = "user_stories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    story = Column(Text)
    detected_intent = Column(String)
    confidence = Column(Float)


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer)
    scenario = Column(String)
    steps = Column(Text)
    expected_result = Column(Text)


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    story = Column(Text)
    predicted_intent = Column(String)
    correct_intent = Column(String)
    suggested_category = Column(String, nullable=True)
    rating = Column(Integer)