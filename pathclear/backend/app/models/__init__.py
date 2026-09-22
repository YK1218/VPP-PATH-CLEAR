"""SQLAlchemy ORM models for PathClear aligning with DB/db.sql vertical slices."""

from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey
from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    """User accounts and accessibility preferences."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=True)
    full_name = Column(String(150), nullable=True)
    avatar_url = Column(Text, nullable=True)
    preferred_city_id = Column(String(50), default="mumbai")
    high_contrast_enabled = Column(Boolean, default=False)
    audio_guidance_enabled = Column(Boolean, default=True)
    haptic_feedback_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow)


class City(Base):
    """Supported geographical regions / cities."""
    __tablename__ = "cities"

    id = Column(String(50), primary_key=True)  # 'mumbai', 'delhi', etc.
    name = Column(String(100), nullable=False)
    country_code = Column(String(3), default="IND")
    center_latitude = Column(Float, nullable=False)
    center_longitude = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Building(Base):
    """Destination buildings and complexes."""
    __tablename__ = "buildings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    city_id = Column(String(50), ForeignKey("cities.id"), nullable=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), default="commercial")
    formatted_address = Column(Text, nullable=False)
    street_latitude = Column(Float, nullable=False)
    street_longitude = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow)


class Entrance(Base):
    """Destination doorway / entrance model ('The Last 50 Feet')."""
    __tablename__ = "building_entrances"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    building_id = Column(String, ForeignKey("buildings.id", ondelete="CASCADE"), nullable=True, index=True)
    building_name = Column(String(255), nullable=True)
    entrance_name = Column(String(150), default="Main Entrance")
    is_primary_accessible = Column(Boolean, default=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Doorway specs & dimensions
    door_type = Column(String(50), default="automatic_sliding")
    clear_width_inches = Column(Float, default=36.0)
    width_cm = Column(Integer, default=90)
    sensor_range_meters = Column(Float, default=2.4)
    push_pad_height_inches = Column(Float, default=34.0)
    
    # Step & ramp geometry
    step_count = Column(Integer, default=0)
    threshold_lip_inches = Column(Float, default=0.0)
    has_continuous_ramp = Column(Boolean, default=True)
    ramp_available = Column(Boolean, default=True)
    ramp_slope_percent = Column(Float, default=2.1)
    has_safety_handrails = Column(Boolean, default=True)
    has_tactile_paving = Column(Boolean, default=True)
    turning_radius_inches = Column(Float, default=60.0)
    
    # Media & Notes
    photo_url = Column(Text, nullable=True)
    primary_photo_url = Column(Text, nullable=True)
    annotated_photo_url = Column(Text, nullable=True)
    photo_caption = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    guidance_notes = Column(Text, nullable=True)

    # Verification & Confidence
    confidence_score = Column(Float, default=1.0)
    base_confidence_score = Column(Float, default=1.0)
    current_confidence_score = Column(Float, default=1.0)
    confidence_decay_half_life_hours = Column(Float, default=168.0)
    verification_count = Column(Integer, default=1)
    last_verified_at = Column(DateTime(timezone=True), default=utcnow)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow)


class Hazard(Base):
    """Reported accessibility barriers / hazards."""
    __tablename__ = "hazards"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    city_id = Column(String(50), ForeignKey("cities.id", ondelete="SET NULL"), nullable=True, index=True)
    hazard_type = Column(String(50), nullable=False)  # step, curb_lip, steep_slope, gravel_debris, broken_surface, construction_trench
    severity = Column(String(50), default="medium_friction")   # low_caution, medium_friction, high_barrier, critical_blocker
    title = Column(String(200), default="Reported Hazard")
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_description = Column(String(255), nullable=True)
    photo_url = Column(Text, nullable=True)
    
    # Confidence & Verification
    is_active = Column(Boolean, default=True, index=True)
    confidence_score = Column(Float, default=1.0)
    base_confidence_score = Column(Float, default=1.0)
    current_confidence_score = Column(Float, default=1.0)
    decay_half_life_hours = Column(Float, default=24.0)
    verification_count = Column(Integer, default=1)
    reported_at = Column(DateTime(timezone=True), default=utcnow)
    last_verified_at = Column(DateTime(timezone=True), default=utcnow)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow)


class VerificationLog(Base):
    """1-Tap verification event logs for crowd-verified data freshness."""
    __tablename__ = "verifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    target_type = Column(String(50), nullable=False)  # entrance, hazard, route_segment
    target_id = Column(String, nullable=False, index=True)
    user_response = Column(String(50), nullable=False)  # clear, blocked, smooth, issue_reported
    device_latitude = Column(Float, nullable=True)
    device_longitude = Column(Float, nullable=True)
    previous_confidence = Column(Float, nullable=True)
    updated_confidence = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
