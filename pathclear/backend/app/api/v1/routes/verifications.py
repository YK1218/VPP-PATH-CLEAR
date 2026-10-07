from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class VerificationRequest(BaseModel):
    target_type: str # "entrance" or "hazard"
    target_id: str
    user_response: str # "clear" or "blocked"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.post("/")
def submit_verification(request: VerificationRequest):
    """
    Mock endpoint for 1-Tap Verification.
    In a real system, this would update the confidence score in Supabase/Neo4j.
    """
    return {"status": "success", "message": f"Verification for {request.target_type} {request.target_id} logged."}
