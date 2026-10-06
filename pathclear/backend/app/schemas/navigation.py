from pydantic import BaseModel, Field
from typing import Dict, Any, List

class Coordinate(BaseModel):
    lat: float
    lng: float

class ProfileConstraints(BaseModel):
    mode: str = "wheelchair"
    step_free: bool = True
    max_slope: float = 5.0

class RouteRequest(BaseModel):
    origin: Coordinate
    destination: Coordinate
    profile: ProfileConstraints

class RouteAudit(BaseModel):
    step_free: bool
    max_slope: float
    surface: str
    tactile_coverage: int
    accessible_crossings: int
    known_hazards: int
    confidence: float
    rfi: float

class RouteResponse(BaseModel):
    geometry: Dict[str, Any] # GeoJSON LineString
    distance_m: int
    duration_min: int
    audit: RouteAudit
