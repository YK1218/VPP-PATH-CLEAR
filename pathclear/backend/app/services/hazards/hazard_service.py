from app.db.supabase.repositories import hazard_repository
from app.schemas.hazard import HazardResponse
from typing import List

async def fetch_nearby_hazards(lat: float, lng: float, radius: float) -> List[HazardResponse]:
    raw_data = hazard_repository.get_active_hazards_near_route(lat, lng, radius)
    return [HazardResponse(**hazard) for hazard in raw_data]
