"""Unit tests validating Logic.md v3.0 core features:
1. Go/No-Go Gatekeeper Unit Test (steps & slope hard-block)
2. Deterministic RFI calculation
3. Asymptotic half-life time-decay confidence engine with 0.05 floor & freshness tags
"""

import pytest
from datetime import datetime, timezone, timedelta
from app.services.routing import evaluate_segment_cost, compute_accessible_route, INFINITE_COST
from app.services.verification import calculate_decayed_confidence, get_freshness_label, ASYMPTOTIC_FLOOR
from app.schemas import RouteRequest, AccessibilityProfileSchema


def test_gatekeeper_blocks_stairs_for_step_free():
    """Go/No-Go Gatekeeper Unit Test: inject stairs into step-free wheelchair path."""
    profile = AccessibilityProfileSchema(
        mobility_type="wheelchair_manual",
        max_incline_percent=5.0,
        require_step_free=True,
    )
    weight, blocked, reason = evaluate_segment_cost(
        length_meters=20.0,
        incline_percent=0.0,
        surface="concrete",
        has_steps=True,
        has_tactile=False,
        is_hazard=False,
        profile=profile,
    )
    assert blocked is True
    assert weight == INFINITE_COST
    assert "stairs" in reason.lower()


def test_gatekeeper_blocks_steep_slope_exceeding_profile():
    """Gatekeeper blocks slope exceeding user maximum limit."""
    profile = AccessibilityProfileSchema(
        mobility_type="wheelchair_manual",
        max_incline_percent=5.0,
        require_step_free=True,
    )
    weight, blocked, reason = evaluate_segment_cost(
        length_meters=50.0,
        incline_percent=8.5,  # 8.5% > 5.0%
        surface="asphalt",
        has_steps=False,
        has_tactile=False,
        is_hazard=False,
        profile=profile,
    )
    assert blocked is True
    assert weight == INFINITE_COST
    assert "exceeds maximum limit" in reason.lower()


def test_asymptotic_time_decay_with_floor():
    """Verify asymptotic half-life decay formula: S(t) = S_0 * 2^(-t / t_half) with floor 0.05."""
    now = datetime.now(timezone.utc)
    base_conf = 1.0

    # 1. Immediate: elapsed 0 hours -> score == 1.0
    s_0 = calculate_decayed_confidence(base_conf, now, half_life_hours=24.0)
    assert s_0 == 1.0

    # 2. Exactly 1 half-life elapsed (24h) -> score == 0.5
    s_1 = calculate_decayed_confidence(base_conf, now - timedelta(hours=24), half_life_hours=24.0)
    assert abs(s_1 - 0.5) < 0.02

    # 3. Exactly 2 half-lives elapsed (48h) -> score == 0.25
    s_2 = calculate_decayed_confidence(base_conf, now - timedelta(hours=48), half_life_hours=24.0)
    assert abs(s_2 - 0.25) < 0.02

    # 4. Long duration elapsed (e.g. 500 hours) -> score flatted at asymptotic floor 0.05
    s_floor = calculate_decayed_confidence(base_conf, now - timedelta(hours=500), half_life_hours=24.0)
    assert s_floor == ASYMPTOTIC_FLOOR


def test_freshness_label_formatting():
    """Verify human-readable freshness label formatting."""
    now = datetime.now(timezone.utc)

    # 15 mins ago
    label_mins = get_freshness_label(now - timedelta(minutes=15))
    assert label_mins == "Verified 15 mins ago"

    # 3 hours ago
    label_hours = get_freshness_label(now - timedelta(hours=3))
    assert label_hours == "Verified 3 hours ago"

    # 5 days ago
    label_days = get_freshness_label(now - timedelta(days=5))
    assert label_days == "Verified 5 days ago"


def test_compute_accessible_route_audit_and_rfi():
    """Verify RouteResponse contains deterministic audit and RFI."""
    req = RouteRequest(
        origin=[72.8640, 19.0640],
        destination=[72.8680, 19.0680],
        profile=AccessibilityProfileSchema(
            mobility_type="wheelchair_manual",
            max_incline_percent=5.0,
            require_step_free=True,
        ),
    )
    resp = compute_accessible_route(req)
    assert resp.status == "PASS"
    assert resp.audit is not None
    assert resp.audit.step_free is True
    assert resp.audit.route_friction_index >= 0.0
    assert resp.stress_score == resp.audit.route_friction_index
