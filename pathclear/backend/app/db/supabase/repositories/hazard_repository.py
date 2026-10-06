from app.db.supabase.client import get_supabase_client
from typing import List, Dict, Any

def get_active_hazards_near_route(lat: float, lng: float, radius: float) -> List[Dict[str, Any]]:
    # Mocking DB response
    return [{
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "type": "construction",
        "geometry": {
            "type": "Point",
            "coordinates": [lng + 0.001, lat + 0.001]
        },
        "severity": "high",
        "confidence": 0.9
    }]

def create_hazard(hazard_data: Dict[str, Any]) -> Dict[str, Any]:
    # Mock insert into DB
    return {
        "id": "new-mock-id",
        "type": hazard_data["type"],
        "geometry": {"type": "Point", "coordinates": [hazard_data["lng"], hazard_data["lat"]]},
        "severity": hazard_data["severity"],
        "confidence": 0.5,
        "status": "active"
    }
