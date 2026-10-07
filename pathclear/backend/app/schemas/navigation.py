from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class ProfileConstraints(BaseModel):
    mobility_type: str = "wheelchair_manual"
    max_incline_percent: float = 5.0
    require_step_free: bool = True
    require_tactile_paving: bool = False
    require_well_lit: bool = False
    avoid_broken_surfaces: bool = True

class RouteRequest(BaseModel):
    origin: List[float] # [lon, lat]
    destination: List[float] # [lon, lat]
    profile: ProfileConstraints

class RouteSegment(BaseModel):
    distance_meters: float
    duration_seconds: float
    incline_percent: float
    surface_type: str
    is_step_free: bool
    confidence_score: float
    geometry: List[List[float]] # [[lon, lat], ...]

class RouteResponse(BaseModel):
    route_id: str
    total_distance_meters: float
    total_duration_seconds: float
    stress_score: float
    is_recommended: bool
    step_count: int
    max_incline_percent: float
    segments: List[RouteSegment]
    hazards_en_route: List[Any] = []
    destination_entrance: Optional[Any] = None
    coordinates: List[List[float]] # [[lon, lat], ...]
