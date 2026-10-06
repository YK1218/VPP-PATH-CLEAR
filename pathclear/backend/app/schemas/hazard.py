from pydantic import BaseModel
from typing import Dict, Any

class HazardResponse(BaseModel):
    id: str
    type: str
    geometry: Dict[str, Any]
    severity: str
    confidence: float
