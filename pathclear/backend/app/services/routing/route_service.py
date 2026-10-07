from app.schemas.navigation import RouteResponse, RouteSegment
from typing import Dict, Any, List
import uuid

def get_accessible_route(origin: List[float], destination: List[float], profile: Dict[str, Any]) -> RouteResponse:
    # Fallback to the straight line mock matching frontend expectation
    
    coordinates = [
        origin,
        [origin[0] + 0.0002, origin[1] + 0.0002],
        [destination[0] - 0.0002, destination[1] - 0.0002],
        destination
    ]
    
    distance_m = 850
    duration_s = 780
    
    segments = [
        RouteSegment(
            distance_meters=distance_m,
            duration_seconds=duration_s,
            incline_percent=2.5,
            surface_type="paved",
            is_step_free=True,
            confidence_score=0.9,
            geometry=coordinates
        )
    ]
    
    return RouteResponse(
        route_id=str(uuid.uuid4()),
        total_distance_meters=distance_m,
        total_duration_seconds=duration_s,
        stress_score=0.15,
        is_recommended=True,
        step_count=0,
        max_incline_percent=3.5,
        segments=segments,
        coordinates=coordinates
    )
