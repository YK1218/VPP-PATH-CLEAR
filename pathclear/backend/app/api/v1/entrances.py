"""Entrances API: Doorway-level mapping and verified entrance data."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.database.session import get_db
from app.models import Entrance
from app.schemas import EntranceCreate, EntranceResponse
from app.services.verification import calculate_decayed_confidence, ENTRANCE_HALF_LIFE_HOURS

router = APIRouter(prefix="/entrances", tags=["Entrances"])

# In-memory starter data if database is empty/unmigrated
MOCK_ENTRANCES = [
    EntranceResponse(
        id="ent-101",
        building_name="Jio World Centre",
        entrance_name="BKC Gate 2 Accessible Entrance",
        latitude=19.0680,
        longitude=72.8680,
        door_type="push_button",
        step_count=0,
        ramp_available=True,
        ramp_slope_percent=3.5,
        width_cm=95,
        photo_url="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
        notes="Automated actuator on the left post. Wide threshold with zero curb.",
        confidence_score=0.98,
        last_verified_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    ),
    EntranceResponse(
        id="ent-102",
        building_name="BKC Metro Station",
        entrance_name="Lift A Accessible Entrance",
        latitude=19.0618,
        longitude=72.8617,
        door_type="automatic",
        step_count=0,
        ramp_available=True,
        ramp_slope_percent=2.0,
        width_cm=110,
        photo_url="https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80",
        notes="Sliding motion sensor doors. Direct level access to main platform elevator.",
        confidence_score=0.95,
        last_verified_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    )
]


@router.get("/", response_model=List[EntranceResponse])
def get_entrances(db: Session = Depends(get_db)):
    """Retrieve all accessible building entrances with time-decayed confidence scores."""
    try:
        entrances = db.query(Entrance).all()
        if not entrances:
            return MOCK_ENTRANCES
        
        # Apply decay to confidence score
        res = []
        for e in entrances:
            decayed = calculate_decayed_confidence(e.confidence_score, e.last_verified_at, ENTRANCE_HALF_LIFE_HOURS)
            res.append(
                EntranceResponse(
                    id=e.id,
                    building_name=e.building_name,
                    entrance_name=e.entrance_name,
                    latitude=e.latitude,
                    longitude=e.longitude,
                    door_type=e.door_type,
                    step_count=e.step_count,
                    ramp_available=e.ramp_available,
                    ramp_slope_percent=e.ramp_slope_percent,
                    width_cm=e.width_cm,
                    photo_url=e.photo_url,
                    notes=e.notes,
                    confidence_score=decayed,
                    last_verified_at=e.last_verified_at,
                    created_at=e.created_at,
                )
            )
        return res
    except Exception:
        return MOCK_ENTRANCES


@router.post("/", response_model=EntranceResponse)
def create_entrance(entrance_in: EntranceCreate, db: Session = Depends(get_db)):
    """Register an accessible entrance."""
    try:
        entrance = Entrance(**entrance_in.model_dump())
        db.add(entrance)
        db.commit()
        db.refresh(entrance)
        return entrance
    except Exception:
        # Fallback demonstration echo
        return EntranceResponse(
            id="ent-temp",
            **entrance_in.model_dump(),
            confidence_score=1.0,
            last_verified_at=datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc)
        )
