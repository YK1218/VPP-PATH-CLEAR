"""API v1 router registry."""

from fastapi import APIRouter
from app.api.v1.routes import router as routes_router
from app.api.v1.entrances import router as entrances_router
from app.api.v1.hazards import router as hazards_router
from app.api.v1.verifications import router as verifications_router
from app.api.v1.profiles import router as profiles_router
from app.api.v1.websockets import router as websockets_router

api_router = APIRouter()
api_router.include_router(routes_router)
api_router.include_router(entrances_router)
api_router.include_router(hazards_router)
api_router.include_router(verifications_router)
api_router.include_router(profiles_router)
api_router.include_router(websockets_router)
