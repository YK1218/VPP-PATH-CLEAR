from fastapi import APIRouter
from app.schemas.navigation import RouteRequest, RouteResponse
from app.services.routing import route_service

router = APIRouter()

@router.post("/route", response_model=RouteResponse)
async def get_route(request: RouteRequest):
    return route_service.get_accessible_route(
        {"lat": request.origin.lat, "lng": request.origin.lng},
        {"lat": request.destination.lat, "lng": request.destination.lng},
        request.profile.model_dump()
    )
