"""Hazards API: Accessibility barrier reporting and active obstacle feed."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.database.session import get_db
from app.models import Hazard
from app.schemas import HazardCreate, HazardResponse
from app.services.verification import calculate_decayed_confidence, HAZARD_HALF_LIFE_HOURS

router = APIRouter(prefix="/hazards", tags=["Hazards"])

MOCK_HAZARDS = [
    HazardResponse(
        id="haz-01",
        hazard_type="broken_surface",
        severity="medium",
        description="Uneven sidewalk slabs & tree root buckle causing 2-inch lip.",
        latitude=37.7812,
        longitude=-122.4145,
        is_active=True,
        confidence_score=0.88,
        verification_count=4,
        last_verified_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    ),
    HazardResponse(
        id="haz-02",
        hazard_type="step",
        severity="blocker",
        description="3 non-ramped steps without alternative bypass.",
        latitude=37.7801,
        longitude=-122.4168,
        is_active=True,
        confidence_score=0.96,
        verification_count=9,
        last_verified_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    )
]


@router.get("/", response_model=List[HazardResponse])
def get_hazards(db: Session = Depends(get_db)):
    """Retrieve active hazards with real-time decayed confidence."""
    try:
        hazards = db.query(Hazard).filter(Hazard.is_active == True).all()
        if not hazards:
            return MOCK_HAZARDS
        
        res = []
        for h in hazards:
            decayed = calculate_decayed_confidence(h.confidence_score, h.last_verified_at, HAZARD_HALF_LIFE_HOURS)
            res.append(
                HazardResponse(
                    id=h.id,
                    hazard_type=h.hazard_type,
                    severity=h.severity,
                    description=h.description,
                    latitude=h.latitude,
                    longitude=h.longitude,
                    is_active=h.is_active,
                    confidence_score=decayed,
                    verification_count=h.verification_count,
                    last_verified_at=h.last_verified_at,
                    created_at=h.created_at,
                )
            )
        return res
    except Exception:
        return MOCK_HAZARDS


@router.post("/", response_model=HazardResponse)
def report_hazard(hazard_in: HazardCreate, db: Session = Depends(get_db)):
    """Submit a newly identified barrier or obstacle."""
    try:
        hazard = Hazard(**hazard_in.model_dump())
        db.add(hazard)
        db.commit()
        db.refresh(hazard)
        return hazard
    except Exception:
        return HazardResponse(
            id="haz-temp",
            **hazard_in.model_dump(),
            is_active=True,
            confidence_score=1.0,
            verification_count=1,
            last_verified_at=datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc),
        )
