from pydantic import BaseModel
from typing import Dict, Any, Optional

class AgentRequest(BaseModel):
    query: str
    user_location: Optional[Dict[str, float]] = None # {"lat": 19.0, "lng": 72.8}

class AgentResponse(BaseModel):
    message: str
    action: Optional[str] = None # e.g. "SHOW_ROUTE", "SHOW_HAZARDS", "NAVIGATE_ENTRANCE"
    payload: Optional[Dict[str, Any]] = None # The route or hazard data
