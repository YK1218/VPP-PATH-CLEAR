from fastapi import APIRouter
from app.schemas.vision import VisionAnalyzeResponse, Obstacle, BoundingBox
import random

router = APIRouter()

# Mock states for the virtual cane simulation
MOCK_SCENARIOS = [
    {
        "obstacles": [],
        "haptic_pattern": [],
        "instruction_audio": "Path is clear."
    },
    {
        "obstacles": [
            Obstacle(
                label="pothole",
                confidence=0.92,
                distance_meters=1.5,
                position="center",
                bbox=BoundingBox(x=0.4, y=0.7, width=0.2, height=0.1)
            )
        ],
        "haptic_pattern": [200, 50, 200], # Warning vibration
        "instruction_audio": "Pothole directly ahead. Move right."
    },
    {
        "obstacles": [
            Obstacle(
                label="parked_scooter",
                confidence=0.88,
                distance_meters=2.0,
                position="right",
                bbox=BoundingBox(x=0.7, y=0.5, width=0.25, height=0.4)
            )
        ],
        "haptic_pattern": [100, 50, 100], # Light vibration on right side
        "instruction_audio": "Parked scooter on the right. Stay left."
    }
]

@router.post("/analyze", response_model=VisionAnalyzeResponse)
async def analyze_camera_frame():
    """
    Mock endpoint that simulates processing a camera frame.
    In reality, this would accept an image (UploadFile or base64) and run a YOLO or lightweight CNN model.
    For the hackathon, we return a randomized hazard scenario to demonstrate the Virtual Cane loop.
    """
    # Pick a random scenario to simulate a dynamic environment
    scenario = random.choice(MOCK_SCENARIOS)
    
    return VisionAnalyzeResponse(**scenario)
