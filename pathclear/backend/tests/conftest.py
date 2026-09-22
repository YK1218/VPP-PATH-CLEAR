"""Pytest configuration and fixtures for PathClear backend tests."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def sample_entrance_data():
    """Sample entrance data for testing."""
    return {
        "building_name": "Test Building",
        "entrance_name": "Main Accessible Entrance",
        "latitude": 19.0680,
        "longitude": 72.8680,
        "door_type": "push_button",
        "step_count": 0,
        "ramp_available": True,
        "ramp_slope_percent": 3.5,
        "width_cm": 95,
        "photo_url": "https://example.com/photo.jpg",
        "notes": "Test entrance",
    }
