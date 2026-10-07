from app.schemas.navigation import RouteResponse, RouteSegment
from typing import Dict, Any, List
import uuid

def get_accessible_route(origin: List[float], destination: List[float], profile: Dict[str, Any]) -> RouteResponse:
    # Fallback to the straight line mock matching frontend expectation
    
    import urllib.request
    import json
    
    # Try fetching a real route from OSRM to get a realistic path with edges
    coordinates = [origin, destination]
    distance_m = 850
    duration_s = 780
    
    try:
        url = f"https://router.project-osrm.org/route/v1/foot/{origin[0]},{origin[1]};{destination[0]},{destination[1]}?geometries=geojson"
        req = urllib.request.Request(url, headers={'User-Agent': 'PathClear-Demo/1.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode())
            if data.get('routes') and len(data['routes']) > 0:
                route = data['routes'][0]
                coordinates = route['geometry']['coordinates']
                distance_m = route.get('distance', 850)
                duration_s = route.get('duration', 780)
    except Exception as e:
        print(f"OSRM fallback failed: {e}")
        # Fallback to simple zigzag staircase line if OSRM fails
        coordinates = []
        num_steps = 15
        curr_x, curr_y = origin[0], origin[1]
        step_dx = (destination[0] - origin[0]) / num_steps
        step_dy = (destination[1] - origin[1]) / num_steps
        for i in range(num_steps):
            coordinates.append([curr_x, curr_y])
            curr_x += step_dx
            coordinates.append([curr_x, curr_y])
            curr_y += step_dy
        coordinates.append(destination)
    
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
