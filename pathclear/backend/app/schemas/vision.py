from pydantic import BaseModel
from typing import List, Optional

class BoundingBox(BaseModel):
    x: float # 0 to 1
    y: float # 0 to 1
    width: float # 0 to 1
    height: float # 0 to 1

class Obstacle(BaseModel):
    label: str # e.g. "scooter", "construction_cone", "pothole"
    confidence: float
    distance_meters: float
    position: str # "left", "center", "right"
    bbox: BoundingBox

class VisionAnalyzeResponse(BaseModel):
    obstacles: List[Obstacle]
    haptic_pattern: List[int] # e.g. [200, 100, 200] for vibrate pattern
    instruction_audio: Optional[str] = None # e.g. "Move slightly left to avoid scooter"
