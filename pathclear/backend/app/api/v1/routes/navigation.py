from fastapi import APIRouter
from app.schemas.navigation import RouteRequest, RouteResponse, RouteAudit

router = APIRouter()

@router.post("/route", response_model=RouteResponse)
async def get_route(request: RouteRequest):
    # Mock response based on the blueprint contract
    return RouteResponse(
        geometry={
            "type": "LineString",
            "coordinates": [
                [request.origin.lng, request.origin.lat],
                [(request.origin.lng + request.destination.lng) / 2, (request.origin.lat + request.destination.lat) / 2],
                [request.destination.lng, request.destination.lat]
            ]
        },
        distance_m=1200,
        duration_min=16,
        audit=RouteAudit(
            step_free=True,
            max_slope=3.2,
            surface="paved",
            tactile_coverage=80,
            accessible_crossings=2,
            known_hazards=1,
            confidence=0.87,
            rfi=0.23
        )
    )
