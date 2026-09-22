"""Profiles API: Accessibility profile management for profile-based routing."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.database.session import get_db
from app.models import AccessibilityProfile, User
from app.schemas import AccessibilityProfileCreate, AccessibilityProfileUpdate, AccessibilityProfileResponse

router = APIRouter(prefix="/profiles", tags=["Profiles"])

# In-memory fallback profiles when database is unavailable
FALLBACK_PROFILES = [
    AccessibilityProfileResponse(
        id="profile-wheelchair",
        profile_name="Manual Wheelchair",
        mobility_type="wheelchair_manual",
        max_incline_percent=5.0,
        require_step_free=True,
        require_tactile_paving=False,
        require_well_lit=False,
        avoid_broken_surfaces=True,
        avoid_cobblestones=True,
        min_door_width_inches=32.0,
        is_default=True,
        user_id=None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    ),
    AccessibilityProfileResponse(
        id="profile-power-chair",
        profile_name="Power Chair / Scooter",
        mobility_type="wheelchair_power",
        max_incline_percent=8.0,
        require_step_free=True,
        require_tactile_paving=False,
        require_well_lit=False,
        avoid_broken_surfaces=True,
        avoid_cobblestones=True,
        min_door_width_inches=32.0,
        is_default=False,
        user_id=None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    ),
    AccessibilityProfileResponse(
        id="profile-walker",
        profile_name="Walker / Cane Support",
        mobility_type="walker",
        max_incline_percent=6.0,
        require_step_free=False,
        require_tactile_paving=False,
        require_well_lit=True,
        avoid_broken_surfaces=True,
        avoid_cobblestones=True,
        min_door_width_inches=32.0,
        is_default=False,
        user_id=None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    ),
    AccessibilityProfileResponse(
        id="profile-visual",
        profile_name="Visual Assistance",
        mobility_type="visual_guide",
        max_incline_percent=10.0,
        require_step_free=False,
        require_tactile_paving=True,
        require_well_lit=True,
        avoid_broken_surfaces=True,
        avoid_cobblestones=True,
        min_door_width_inches=32.0,
        is_default=False,
        user_id=None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    ),
]


def get_db_or_fallback(db: Session):
    """Try to use database, return None if unavailable."""
    try:
        # Test connection
        db.execute("SELECT 1")
        return db
    except Exception:
        return None


@router.get("/", response_model=List[AccessibilityProfileResponse])
def get_profiles(user_id: str = None, db: Session = Depends(get_db)):
    """Get all accessibility profiles, optionally filtered by user."""
    db_conn = get_db_or_fallback(db)
    if not db_conn:
        profiles = FALLBACK_PROFILES
        if user_id:
            profiles = [p for p in profiles if p.user_id == user_id]
        return profiles
    
    query = db.query(AccessibilityProfile)
    if user_id:
        query = query.filter(AccessibilityProfile.user_id == user_id)
    return query.all()


@router.get("/default", response_model=AccessibilityProfileResponse)
def get_default_profile(db: Session = Depends(get_db)):
    """Get the default accessibility profile."""
    db_conn = get_db_or_fallback(db)
    if not db_conn:
        return FALLBACK_PROFILES[0]  # Return first fallback as default
    
    profile = db.query(AccessibilityProfile).filter(AccessibilityProfile.is_default == True).first()
    if not profile:
        # Create a default profile if none exists
        profile = AccessibilityProfile(
            profile_name="Default Wheelchair",
            mobility_type="wheelchair_manual",
            max_incline_percent=5.0,
            require_step_free=True,
            require_tactile_paving=False,
            require_well_lit=False,
            avoid_broken_surfaces=True,
            is_default=True,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("/{profile_id}", response_model=AccessibilityProfileResponse)
def get_profile(profile_id: str, db: Session = Depends(get_db)):
    """Get a specific accessibility profile by ID."""
    db_conn = get_db_or_fallback(db)
    if not db_conn:
        # Check fallback profiles
        for p in FALLBACK_PROFILES:
            if p.id == profile_id:
                return p
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile = db.query(AccessibilityProfile).filter(AccessibilityProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/", response_model=AccessibilityProfileResponse)
def create_profile(profile_in: AccessibilityProfileCreate, db: Session = Depends(get_db)):
    """Create a new accessibility profile."""
    db_conn = get_db_or_fallback(db)
    if not db_conn:
        # Return a mock response for fallback
        import uuid
        return AccessibilityProfileResponse(
            id=str(uuid.uuid4()),
            profile_name=profile_in.profile_name,
            mobility_type=profile_in.mobility_type,
            max_incline_percent=profile_in.max_incline_percent,
            require_step_free=profile_in.require_step_free,
            require_tactile_paving=profile_in.require_tactile_paving,
            require_well_lit=profile_in.require_well_lit,
            avoid_broken_surfaces=profile_in.avoid_broken_surfaces,
            avoid_cobblestones=profile_in.avoid_cobblestones,
            min_door_width_inches=profile_in.min_door_width_inches,
            is_default=profile_in.is_default,
            user_id=profile_in.user_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
    
    # If this is marked as default, unset other defaults for this user
    if profile_in.is_default and profile_in.user_id:
        db.query(AccessibilityProfile).filter(
            AccessibilityProfile.user_id == profile_in.user_id,
            AccessibilityProfile.is_default == True
        ).update({AccessibilityProfile.is_default: False})
    
    profile = AccessibilityProfile(**profile_in.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.patch("/{profile_id}", response_model=AccessibilityProfileResponse)
def update_profile(profile_id: str, profile_in: AccessibilityProfileUpdate, db: Session = Depends(get_db)):
    """Update an accessibility profile."""
    db_conn = get_db_or_fallback(db)
    if not db_conn:
        # Update fallback profile
        for i, p in enumerate(FALLBACK_PROFILES):
            if p.id == profile_id:
                update_data = profile_in.model_dump(exclude_unset=True)
                updated = p.model_copy(update=update_data)
                FALLBACK_PROFILES[i] = updated
                return updated
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile = db.query(AccessibilityProfile).filter(AccessibilityProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile_in.model_dump(exclude_unset=True)
    
    # If setting as default, unset other defaults for this user
    if update_data.get("is_default") and profile.user_id:
        db.query(AccessibilityProfile).filter(
            AccessibilityProfile.user_id == profile.user_id,
            AccessibilityProfile.is_default == True
        ).update({AccessibilityProfile.is_default: False})
    
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/{profile_id}")
def delete_profile(profile_id: str, db: Session = Depends(get_db)):
    """Delete an accessibility profile."""
    db_conn = get_db_or_fallback(db)
    if not db_conn:
        # Remove from fallback
        global FALLBACK_PROFILES
        FALLBACK_PROFILES = [p for p in FALLBACK_PROFILES if p.id != profile_id]
        return {"message": "Profile deleted successfully"}
    
    profile = db.query(AccessibilityProfile).filter(AccessibilityProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    db.delete(profile)
    db.commit()
    return {"message": "Profile deleted successfully"}