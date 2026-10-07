from fastapi import APIRouter
from app.schemas.hazard import HazardResponse, HazardReportRequest
from app.services.hazards import hazard_service
from typing import List

router = APIRouter()

@router.get("/nearby", response_model=List[HazardResponse])
async def get_nearby_hazards(lat: float, lng: float, radius: float = 500):
    return await hazard_service.fetch_nearby_hazards(lat, lng, radius)

@router.post("/report", response_model=HazardResponse)
async def report_hazard(request: HazardReportRequest):
    return await hazard_service.report_hazard(request)
