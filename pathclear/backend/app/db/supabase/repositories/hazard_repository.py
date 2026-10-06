from app.db.supabase.client import get_supabase_client
from typing import List, Dict, Any

def get_active_hazards_near_route(lat: float, lng: float, radius: float) -> List[Dict[str, Any]]:
    # In reality this uses PostGIS ST_DWithin via Supabase RPC or postgrest
    # supabase = get_supabase_client()
    # response = supabase.rpc("get_nearby_hazards", {"lat": lat, "lng": lng, "radius": radius}).execute()
    # return response.data
    
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
