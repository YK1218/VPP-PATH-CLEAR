"""Routes API: Calculate accessible routes with entrance door targets."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database.session import get_db
from app.schemas import RouteRequest, RouteResponse
from app.api.v1.entrances import MOCK_ENTRANCES
from app.api.v1.hazards import MOCK_HAZARDS
from app.services.routing import compute_accessible_route

router = APIRouter(prefix="/routes", tags=["Routes"])


@router.post("/calculate", response_model=RouteResponse)
def calculate_route(route_req: RouteRequest, db: Session = Depends(get_db)):
    """Calculate an accessibility-scored route leading directly to the accessible doorway."""
    # Match the requested Mumbai destination to the closest known accessible entrance.
    destination_lng, destination_lat = route_req.destination
    target_entrance = min(
        MOCK_ENTRANCES,
        key=lambda entrance: (
            (entrance.longitude - destination_lng) ** 2
            + (entrance.latitude - destination_lat) ** 2
        ),
    )
    return compute_accessible_route(
        request=route_req,
        target_entrance=target_entrance,
        known_hazards=MOCK_HAZARDS,
    )
