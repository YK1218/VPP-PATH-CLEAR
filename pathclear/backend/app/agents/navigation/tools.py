from langchain_core.tools import tool
from app.services.routing import route_service
from app.services.hazards import hazard_service
import json

@tool
def calculate_route_tool(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float, profile_mode: str) -> str:
    """Calculates a deterministic accessible route between two GPS coordinates using the Neo4j routing engine."""
    try:
        profile = {"mode": profile_mode, "step_free": profile_mode == "wheelchair", "max_slope": 5.0}
        route = route_service.get_accessible_route(
            {"lat": origin_lat, "lng": origin_lng},
            {"lat": dest_lat, "lng": dest_lng},
            profile
        )
        # We return a JSON string of the route data so the agent can pass it to the UI
        return json.dumps({
            "action": "SHOW_ROUTE",
            "data": route.model_dump()
        })
    except Exception as e:
        return f"Error calculating route: {str(e)}"

@tool
async def find_nearby_hazards_tool(lat: float, lng: float, radius: float = 500) -> str:
    """Finds verified hazards near a specific location."""
    try:
        hazards = await hazard_service.fetch_nearby_hazards(lat, lng, radius)
        return json.dumps({
            "action": "SHOW_HAZARDS",
            "data": [h.model_dump() for h in hazards]
        })
    except Exception as e:
        return f"Error finding hazards: {str(e)}"
