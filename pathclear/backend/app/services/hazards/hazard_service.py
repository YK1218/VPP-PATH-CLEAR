from app.db.supabase.repositories import hazard_repository
from app.schemas.hazard import HazardResponse, HazardReportRequest
from typing import List

async def fetch_nearby_hazards(lat: float, lng: float, radius: float) -> List[HazardResponse]:
    raw_data = hazard_repository.get_active_hazards_near_route(lat, lng, radius)
    return [HazardResponse(**hazard) for hazard in raw_data]

async def report_hazard(hazard_req: HazardReportRequest) -> HazardResponse:
    data = {
        "type": hazard_req.type,
        "lat": hazard_req.lat,
        "lng": hazard_req.lng,
        "severity": hazard_req.severity,
        "description": hazard_req.description
    }
    raw_data = hazard_repository.create_hazard(data)
    return HazardResponse(**raw_data)
