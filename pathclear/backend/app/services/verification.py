"""Verification service handling 1-tap crowd confirmations and time-decay confidence calculations."""

from datetime import datetime, timezone
import math

# Decay half-life constants (in hours)
HAZARD_HALF_LIFE_HOURS = 24.0   # Hazards decay faster (temporary barriers get cleaned up)
ENTRANCE_HALF_LIFE_HOURS = 168.0 # Entrances decay slower (physical doors rarely change)


def calculate_decayed_confidence(
    base_confidence: float,
    last_verified_at: datetime,
    half_life_hours: float = HAZARD_HALF_LIFE_HOURS
) -> float:
    """Calculate exponential decay of confidence score based on time elapsed since last verification."""
    now = datetime.now(timezone.utc)
    if last_verified_at.tzinfo is None:
        last_verified_at = last_verified_at.replace(tzinfo=timezone.utc)
    
    elapsed_hours = max(0.0, (now - last_verified_at).total_seconds() / 3600.0)
    decay_factor = math.pow(0.5, elapsed_hours / half_life_hours)
    
    return round(base_confidence * decay_factor, 3)


def apply_verification_update(current_confidence: float, user_response: str) -> float:
    """Update confidence based on a new 1-tap user verification."""
    if user_response.lower() in ("clear", "yes", "confirmed"):
        # Boost confidence towards 1.0
        return round(min(1.0, current_confidence + 0.25 * (1.0 - current_confidence)), 3)
    elif user_response.lower() in ("blocked", "no", "hazard"):
        # Drastic drop if user reports blocked
        return round(max(0.0, current_confidence * 0.4), 3)
    return current_confidence
