from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes import navigation, hazards

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

@app.get("/health")
def health_check():
    return {"status": "healthy"}
