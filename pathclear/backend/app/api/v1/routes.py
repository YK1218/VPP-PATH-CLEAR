"""Routes API: Calculate accessible routes with entrance door targets."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.database.session import get_db
from app.models import AccessibilityProfile, Entrance, Hazard
from app.schemas import RouteRequest, RouteResponse, AccessibilityProfileSchema, EntranceResponse, HazardResponse
from app.services.routing import compute_accessible_route

router = APIRouter(prefix="/routes", tags=["Routes"])

# Fallback mock data when database is unavailable
MOCK_ENTRANCES = [
    EntranceResponse(
        id="ent-101",
        building_name="Civic Center & Library",
        entrance_name="West Ramp Accessible Entrance",
        latitude=37.7792,
        longitude=-122.4191,
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
        building_name="Market Street Transit Hub",
        entrance_name="South Concourse Elevator & Door",
        latitude=37.7833,
        longitude=-122.4080,
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

MOCK_PROFILES = [
    AccessibilityProfileSchema(
        mobility_type="wheelchair_manual",
        max_incline_percent=5.0,
        require_step_free=True,
        require_tactile_paving=False,
        require_well_lit=False,
        avoid_broken_surfaces=True,
    ),
    AccessibilityProfileSchema(
        mobility_type="wheelchair_power",
        max_incline_percent=8.0,
        require_step_free=True,
        require_tactile_paving=False,
        require_well_lit=False,
        avoid_broken_surfaces=True,
    ),
    AccessibilityProfileSchema(
        mobility_type="walker",
        max_incline_percent=6.0,
        require_step_free=False,
        require_tactile_paving=False,
        require_well_lit=True,
        avoid_broken_surfaces=True,
    ),
    AccessibilityProfileSchema(
        mobility_type="visual_guide",
        max_incline_percent=10.0,
        require_step_free=False,
        require_tactile_paving=True,
        require_well_lit=True,
        avoid_broken_surfaces=True,
    ),
]


def get_db_or_fallback(db: Session):
    """Try to use database, return None if unavailable."""
    try:
        db.execute("SELECT 1")
        return db
    except Exception:
        return None


def get_profile_from_request(route_req: RouteRequest, db: Session) -> AccessibilityProfileSchema:
    """Get the accessibility profile from either profile_id or inline profile."""
    db_conn = get_db_or_fallback(db)
    
    if route_req.profile_id:
        if db_conn:
            profile = db.query(AccessibilityProfile).filter(AccessibilityProfile.id == route_req.profile_id).first()
            if not profile:
                raise HTTPException(status_code=404, detail="Profile not found")
            return AccessibilityProfileSchema(
                mobility_type=profile.mobility_type,
                max_incline_percent=profile.max_incline_percent,
                require_step_free=profile.require_step_free,
                require_tactile_paving=profile.require_tactile_paving,
                require_well_lit=profile.require_well_lit,
                avoid_broken_surfaces=profile.avoid_broken_surfaces,
            )
        else:
            # Check mock profiles
            for p in MOCK_PROFILES:
                if p.mobility_type == route_req.profile_id or route_req.profile_id in ["profile-wheelchair", "profile-power-chair", "profile-walker", "profile-visual"]:
                    # Match by index for demo
                    pass
            # Default to first mock profile
            return MOCK_PROFILES[0]
    return route_req.profile


def find_target_entrance(destination: List[float], building_name: str = None, db: Session = None) -> EntranceResponse:
    """Find the target entrance from database or mock data."""
    dest_lng, dest_lat = destination
    
    db_conn = get_db_or_fallback(db) if db else None
    
    if db_conn:
        query = db.query(Entrance).filter(Entrance.is_primary_accessible == True)
        
        if building_name:
            building_entrance = query.filter(Entrance.building_name.ilike(f"%{building_name}%")).first()
            if building_entrance:
                return building_entrance
        
        entrances = query.all()
        if not entrances:
            raise HTTPException(status_code=404, detail="No accessible entrances found")
        
        entrance = min(
            entrances,
            key=lambda e: (e.longitude - dest_lng) ** 2 + (e.latitude - dest_lat) ** 2
        )
        return EntranceResponse(
            id=entrance.id,
            building_name=entrance.building_name or "",
            entrance_name=entrance.entrance_name,
            latitude=entrance.latitude,
            longitude=entrance.longitude,
            door_type=entrance.door_type,
            step_count=entrance.step_count,
            ramp_available=entrance.ramp_available,
            ramp_slope_percent=entrance.ramp_slope_percent,
            width_cm=entrance.width_cm,
            photo_url=entrance.photo_url,
            notes=entrance.notes,
            confidence_score=entrance.current_confidence_score or entrance.confidence_score,
            last_verified_at=entrance.last_verified_at,
            created_at=entrance.created_at,
        )
    
    # Use mock data
    return min(
        MOCK_ENTRANCES,
        key=lambda e: (e.longitude - dest_lng) ** 2 + (e.latitude - dest_lat) ** 2
    )


def get_active_hazards(db: Session) -> List[HazardResponse]:
    """Get all active hazards from database or mock data."""
    db_conn = get_db_or_fallback(db)
    
    if db_conn:
        hazards = db.query(Hazard).filter(Hazard.is_active == True).all()
        return [
            HazardResponse(
                id=h.id,
                hazard_type=h.hazard_type,
                severity=h.severity,
                description=h.description,
                latitude=h.latitude,
                longitude=h.longitude,
                is_active=h.is_active,
                confidence_score=h.current_confidence_score or h.confidence_score,
                verification_count=h.verification_count,
                last_verified_at=h.last_verified_at,
                created_at=h.created_at,
            )
            for h in hazards
        ]
    
    return MOCK_HAZARDS


router = APIRouter(prefix="/routes", tags=["Routes"])


@router.post("/calculate", response_model=RouteResponse)
def calculate_route(route_req: RouteRequest, db: Session = Depends(get_db)):
    """Calculate an accessibility-scored route leading directly to the accessible doorway."""
    # Get profile
    profile = get_profile_from_request(route_req, db)
    
    # Find target entrance
    target_entrance = find_target_entrance(
        route_req.destination, 
        route_req.destination_building_name, 
        db
    )
    
    # Get active hazards
    hazards = get_active_hazards(db)
    
    # Compute route
    route_response = compute_accessible_route(
        request=RouteRequest(
            origin=route_req.origin,
            destination=route_req.destination,
            profile=profile,
        ),
        target_entrance=target_entrance,
        known_hazards=hazards,
    )
    
    return route_response
