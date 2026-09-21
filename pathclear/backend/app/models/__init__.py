"""SQLAlchemy ORM models for PathClear."""

from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class Entrance(Base):
    """Destination doorway / entrance model ('The Last 50 Feet')."""
    __tablename__ = "entrances"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    building_name = Column(String(255), nullable=False, index=True)
    entrance_name = Column(String(255), default="Main Entrance")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Entrance characteristics
    door_type = Column(String(50), default="push_button")  # automatic, push_button, manual_light, manual_heavy
    step_count = Column(Integer, default=0)
    ramp_available = Column(Boolean, default=True)
    ramp_slope_percent = Column(Float, nullable=True)
    width_cm = Column(Integer, default=90)
    photo_url = Column(String(1024), nullable=True)
    notes = Column(Text, nullable=True)

    # Verification & Confidence
    confidence_score = Column(Float, default=1.0)  # 0.0 to 1.0 (with time-decay)
    last_verified_at = Column(DateTime(timezone=True), default=utcnow)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Hazard(Base):
    """Reported accessibility barriers / hazards."""
    __tablename__ = "hazards"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    hazard_type = Column(String(50), nullable=False)  # step, steep_slope, broken_surface, broken_elevator, construction
    severity = Column(String(50), default="medium")   # low, medium, high, blocker
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Confidence & Verification
    is_active = Column(Boolean, default=True)
    confidence_score = Column(Float, default=1.0)
    verification_count = Column(Integer, default=1)
    last_verified_at = Column(DateTime(timezone=True), default=utcnow)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class VerificationLog(Base):
    """1-Tap verification event logs for crowd-verified data freshness."""
    __tablename__ = "verification_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    target_type = Column(String(50), nullable=False)  # entrance, hazard, route_segment
    target_id = Column(String, nullable=False, index=True)
    user_response = Column(String(50), nullable=False)  # clear, blocked, unknown
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
