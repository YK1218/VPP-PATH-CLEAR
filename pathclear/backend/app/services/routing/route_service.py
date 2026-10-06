from app.db.neo4j.queries import routing_queries
from app.services.routing.audit_service import calculate_route_audit
from app.schemas.navigation import RouteResponse
from typing import Dict, Any

def get_accessible_route(origin: Dict[str, float], destination: Dict[str, float], profile: Dict[str, Any]) -> RouteResponse:
    # 1. Query Neo4j for the shortest accessible path
    path_data = routing_queries.calculate_shortest_path(
        origin["lat"], origin["lng"],
        destination["lat"], destination["lng"],
        profile
    )
    
    if not path_data:
        # Fallback to the straight line mock if Neo4j is not connected or fails
        path_data = {
            "coordinates": [
                [origin["lng"], origin["lat"]],
                [(origin["lng"] + destination["lng"]) / 2, (origin["lat"] + destination["lat"]) / 2],
                [destination["lng"], destination["lat"]]
            ],
            "total_cost": 500
        }
        
    # 2. Audit the route
    audit = calculate_route_audit(path_data)
    
    # 3. Format response
    return RouteResponse(
        geometry={
            "type": "LineString",
            "coordinates": path_data["coordinates"]
        },
        distance_m=int(path_data["total_cost"]),
        duration_min=int(path_data["total_cost"] / 80), # Roughly 80m per min walk speed
        audit=audit
    )
