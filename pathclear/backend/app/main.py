from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes import navigation, hazards, agent, entrances, verifications, vision

app = FastAPI(title="PathClear API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(navigation.router, prefix="/api/v1/navigation", tags=["Navigation"])
app.include_router(hazards.router, prefix="/api/v1/hazards", tags=["Hazards"])
app.include_router(agent.router, prefix="/api/v1/agent", tags=["Agent"])
app.include_router(entrances.router, prefix="/api/v1/entrances", tags=["Entrances"])
app.include_router(verifications.router, prefix="/api/v1/verifications", tags=["Verifications"])
app.include_router(vision.router, prefix="/api/v1/vision", tags=["Vision"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
