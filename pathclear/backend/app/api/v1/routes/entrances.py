from fastapi import APIRouter
from typing import List
from app.schemas.entrance import EntranceDetail

router = APIRouter()

# Mock database of precise entrance data for Last 50 Feet
MOCK_ENTRANCES = [
    EntranceDetail(
        id="ent-1",
        building_name="Jio World Centre - East Gate",
        latitude=19.0655,
        longitude=72.8643,
        door_type="automatic",
        has_ramp=True,
        ramp_slope=2.5,
        curb_step_height=0.0,
        tactile_paving=True,
        photo_url="https://images.unsplash.com/photo-1541888078513-33e38c41f71a?q=80&w=600&auto=format&fit=crop",
        last_50_feet_instructions="The ramp is located on the far left of the main stairs. The automatic doors are the second set on your right."
    ),
    EntranceDetail(
        id="ent-2",
        building_name="Bandra Kurla Complex Station - North",
        latitude=19.0601,
        longitude=72.8550,
        door_type="sliding",
        has_ramp=True,
        ramp_slope=4.0,
        curb_step_height=0.0,
        tactile_paving=False,
        photo_url="https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=600&auto=format&fit=crop",
        last_50_feet_instructions="Approaching the station, stay to the right side of the sidewalk to avoid the bollards. The ramp leads directly to the elevator."
    )
]

@router.get("/", response_model=List[EntranceDetail])
def get_entrances():
    """Returns a list of detailed entrances for testing."""
    return MOCK_ENTRANCES

@router.get("/{entrance_id}", response_model=EntranceDetail)
def get_entrance(entrance_id: str):
    """Returns exact Last-50-Feet data for a specific entrance."""
    for ent in MOCK_ENTRANCES:
        if ent.id == entrance_id:
            return ent
    return MOCK_ENTRANCES[0]
