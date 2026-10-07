from pydantic import BaseModel
from typing import Optional

class EntranceDetail(BaseModel):
    id: str
    building_name: str
    latitude: float
    longitude: float
    door_type: str # "automatic", "heavy_manual", "sliding"
    has_ramp: bool
    ramp_slope: Optional[float] = None
    curb_step_height: Optional[float] = None
    tactile_paving: bool
    photo_url: Optional[str] = None
    last_50_feet_instructions: Optional[str] = None
