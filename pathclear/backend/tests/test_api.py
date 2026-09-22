"""Integration tests for Entrances API endpoints."""

import pytest
from fastapi.testclient import TestClient


class TestEntrancesAPI:
    """Test cases for /api/v1/entrances/ endpoints."""

    def test_get_entrances_returns_list(self, client: TestClient):
        """GET /entrances/ should return a list of entrances."""
        response = client.get("/api/v1/entrances/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2  # At least the 2 mock entrances

    def test_get_entrances_structure(self, client: TestClient):
        """Each entrance should have required fields."""
        response = client.get("/api/v1/entrances/")
        data = response.json()

        entrance = data[0]
        assert "id" in entrance
        assert "building_name" in entrance
        assert "entrance_name" in entrance
        assert "latitude" in entrance
        assert "longitude" in entrance
        assert "door_type" in entrance
        assert "step_count" in entrance
        assert "ramp_available" in entrance
        assert "confidence_score" in entrance
        assert "last_verified_at" in entrance

    def test_get_entrances_confidence_score_range(self, client: TestClient):
        """Confidence scores should be between 0 and 1."""
        response = client.get("/api/v1/entrances/")
        data = response.json()

        for entrance in data:
            assert 0.0 <= entrance["confidence_score"] <= 1.0

    def test_get_entrances_step_free(self, client: TestClient):
        """Mock entrances should be step-free (step_count = 0)."""
        response = client.get("/api/v1/entrances/")
        data = response.json()

        for entrance in data:
            assert entrance["step_count"] == 0

    def test_get_entrances_has_photo_url(self, client: TestClient):
        """Entrances should have photo URLs for the Last 50 Feet preview."""
        response = client.get("/api/v1/entrances/")
        data = response.json()

        for entrance in data:
            assert entrance["photo_url"] is not None
            assert entrance["photo_url"].startswith("http")

    def test_create_entrance(self, client: TestClient, sample_entrance_data):
        """POST /entrances/ should create a new entrance."""
        response = client.post("/api/v1/entrances/", json=sample_entrance_data)
        assert response.status_code == 200
        data = response.json()
        assert data["building_name"] == sample_entrance_data["building_name"]
        assert data["entrance_name"] == sample_entrance_data["entrance_name"]
        assert data["confidence_score"] == 1.0  # New entrances start at 1.0


class TestHazardsAPI:
    """Test cases for /api/v1/hazards/ endpoints."""

    def test_get_hazards_returns_list(self, client: TestClient):
        """GET /hazards/ should return a list of active hazards."""
        response = client.get("/api/v1/hazards/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2

    def test_get_hazards_structure(self, client: TestClient):
        """Each hazard should have required fields."""
        response = client.get("/api/v1/hazards/")
        data = response.json()

        hazard = data[0]
        assert "id" in hazard
        assert "hazard_type" in hazard
        assert "severity" in hazard
        assert "description" in hazard
        assert "latitude" in hazard
        assert "longitude" in hazard
        assert "is_active" in hazard
        assert "confidence_score" in hazard

    def test_get_hazards_active_only(self, client: TestClient):
        """Should only return active hazards."""
        response = client.get("/api/v1/hazards/")
        data = response.json()

        for hazard in data:
            assert hazard["is_active"] is True


class TestRoutesAPI:
    """Test cases for /api/v1/routes/ endpoints."""

    def test_calculate_route(self, client: TestClient):
        """POST /routes/calculate should return a route with entrance."""
        payload = {
            "origin": [72.864, 19.064],
            "destination": [72.868, 19.068],
            "profile": {
                "mobility_type": "wheelchair_manual",
                "max_incline_percent": 5.0,
                "require_step_free": True,
                "require_tactile_paving": False,
                "require_well_lit": False,
                "avoid_broken_surfaces": True,
            },
        }
        response = client.post("/api/v1/routes/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert "route_id" in data
        assert "total_distance_meters" in data
        assert "total_duration_seconds" in data
        assert "stress_score" in data
        assert "segments" in data
        assert "destination_entrance" in data
        assert data["destination_entrance"] is not None
        assert len(data["coordinates"]) > 6
        assert [72.8665, 19.0673] in data["coordinates"]

    def test_calculate_route_step_free(self, client: TestClient):
        """Route should guarantee step-free when profile requires it."""
        payload = {
            "origin": [72.864, 19.064],
            "destination": [72.868, 19.068],
            "profile": {
                "mobility_type": "wheelchair_manual",
                "max_incline_percent": 5.0,
                "require_step_free": True,
                "require_tactile_paving": False,
                "require_well_lit": False,
                "avoid_broken_surfaces": True,
            },
        }
        response = client.post("/api/v1/routes/calculate", json=payload)
        data = response.json()

        assert data["step_count"] == 0
        for segment in data["segments"]:
            assert segment["is_step_free"] is True

    def test_calculate_route_includes_hazards(self, client: TestClient):
        """Route should include hazards en route."""
        payload = {
            "origin": [72.864, 19.064],
            "destination": [72.868, 19.068],
            "profile": {
                "mobility_type": "wheelchair_manual",
                "max_incline_percent": 5.0,
                "require_step_free": True,
                "require_tactile_paving": False,
                "require_well_lit": False,
                "avoid_broken_surfaces": True,
            },
        }
        response = client.post("/api/v1/routes/calculate", json=payload)
        data = response.json()

        assert "hazards_en_route" in data
        assert isinstance(data["hazards_en_route"], list)


class TestVerificationsAPI:
    """Test cases for /api/v1/verifications/ endpoints."""

    def test_submit_verification_clear(self, client: TestClient):
        """POST /verifications/ with 'clear' should update confidence."""
        payload = {
            "target_type": "entrance",
            "target_id": "ent-101",
            "user_response": "clear",
        }
        response = client.post("/api/v1/verifications/", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["target_type"] == "entrance"
        assert data["target_id"] == "ent-101"
        assert data["user_response"] == "clear"
        assert "new_confidence_score" in data

    def test_submit_verification_blocked(self, client: TestClient):
        """POST /verifications/ with 'blocked' should drop confidence."""
        payload = {
            "target_type": "entrance",
            "target_id": "ent-101",
            "user_response": "blocked",
        }
        response = client.post("/api/v1/verifications/", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["user_response"] == "blocked"
        assert data["new_confidence_score"] < 1.0


class TestHealthEndpoint:
    """Test cases for health check endpoint."""

    def test_health_check(self, client: TestClient):
        """GET /health should return healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
        assert "environment" in data
