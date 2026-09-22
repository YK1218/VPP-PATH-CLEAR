"""Pydantic schemas for request validation and API responses."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# --- Accessibility Profile ---
class AccessibilityProfileBase(BaseModel):
    profile_name: str = Field(..., description="Name of the profile (e.g., 'Manual Wheelchair')")
    mobility_type: str = Field("wheelchair_manual", description="wheelchair_manual, wheelchair_power, walker, cane, visual_guide")
    max_incline_percent: float = Field(5.0, description="Max acceptable slope percentage")
    require_step_free: bool = Field(True, description="Strictly avoid steps/curbs")
    require_tactile_paving: bool = Field(False)
    require_well_lit: bool = Field(False)
    avoid_broken_surfaces: bool = Field(True)
    avoid_cobblestones: bool = Field(True)
    min_door_width_inches: float = Field(32.0)
    is_default: bool = Field(False)


class AccessibilityProfileCreate(AccessibilityProfileBase):
    user_id: Optional[str] = None


class AccessibilityProfileUpdate(BaseModel):
    profile_name: Optional[str] = None
    mobility_type: Optional[str] = None
    max_incline_percent: Optional[float] = None
    require_step_free: Optional[bool] = None
    require_tactile_paving: Optional[bool] = None
    require_well_lit: Optional[bool] = None
    avoid_broken_surfaces: Optional[bool] = None
    avoid_cobblestones: Optional[bool] = None
    min_door_width_inches: Optional[float] = None
    is_default: Optional[bool] = None


class AccessibilityProfileResponse(AccessibilityProfileBase):
    id: str
    user_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AccessibilityProfileSchema(BaseModel):
    """Legacy schema for inline profile in route requests."""
    mobility_type: str = Field("wheelchair", description="wheelchair, motorized_scooter, walker, cane, visual_guide")
    max_incline_percent: float = Field(5.0, description="Max acceptable slope percentage")
    require_step_free: bool = Field(True, description="Strictly avoid steps/curbs")
    require_tactile_paving: bool = Field(False)
    require_well_lit: bool = Field(False)
    avoid_broken_surfaces: bool = Field(True)


# --- Entrance Schemas ---
class EntranceBase(BaseModel):
    building_name: str
    entrance_name: str = "Main Entrance"
    latitude: float
    longitude: float
    door_type: str = "push_button"
    step_count: int = 0
    ramp_available: bool = True
    ramp_slope_percent: Optional[float] = None
    width_cm: Optional[int] = 90
    photo_url: Optional[str] = None
    notes: Optional[str] = None


class EntranceCreate(EntranceBase):
    pass


class EntranceResponse(EntranceBase):
    id: str
    confidence_score: float
    last_verified_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# --- Hazard Schemas ---
class HazardBase(BaseModel):
    hazard_type: str
    severity: str = "medium"
    description: Optional[str] = None
    latitude: float
    longitude: float


class HazardCreate(HazardBase):
    pass


class HazardResponse(HazardBase):
    id: str
    is_active: bool
    confidence_score: float
    verification_count: int
    last_verified_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# --- Routing Schemas ---
class RouteRequest(BaseModel):
    origin: List[float] = Field(..., description="[longitude, latitude]")
    destination: List[float] = Field(..., description="[longitude, latitude]")
    profile: AccessibilityProfileSchema = Field(default_factory=AccessibilityProfileSchema)
    profile_id: Optional[str] = Field(None, description="Optional profile ID to use instead of inline profile")
    destination_building_name: Optional[str] = None


class RouteSegment(BaseModel):
    distance_meters: float
    duration_seconds: float
    incline_percent: float
    surface_type: str
    is_step_free: bool = True
    confidence_score: float
    geometry: List[List[float]] = []  # [[lng, lat], ...]


class RouteResponse(BaseModel):
    route_id: str
    total_distance_meters: float
    total_duration_seconds: float
    stress_score: float  # 0.0 to 1.0 friction/stress score
    is_recommended: bool
    step_count: int = 0
    max_incline_percent: float = 0.0
    segments: List[RouteSegment] = []
    hazards_en_route: List[HazardResponse] = []
    destination_entrance: Optional[EntranceResponse] = None
    coordinates: List[List[float]] = []  # GeoJSON path


# --- Verification Schemas ---
class VerificationCreate(BaseModel):
    target_type: str = Field(..., description="entrance or hazard")
    target_id: str
    user_response: str = Field(..., description="'clear' or 'blocked'")
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class VerificationResponse(BaseModel):
    id: str
    target_type: str
    target_id: str
    user_response: str
    new_confidence_score: float
    message: str
