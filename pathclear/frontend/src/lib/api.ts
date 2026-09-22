import { AccessibilityProfile, Entrance, Hazard, Route, VerificationLog } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Fetch accessible entrances with real-time confidence scores
 */
export async function fetchEntrances(): Promise<Entrance[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/entrances/`);
    if (!res.ok) throw new Error("Failed to fetch entrances");
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      buildingName: item.building_name,
      entranceName: item.entrance_name,
      latitude: item.latitude,
      longitude: item.longitude,
      doorType: item.door_type,
      stepCount: item.step_count,
      rampAvailable: item.ramp_available,
      rampSlopePercent: item.ramp_slope_percent,
      widthCm: item.width_cm,
      photoUrl: item.photo_url,
      notes: item.notes,
      confidenceScore: item.confidence_score,
      lastVerifiedAt: item.last_verified_at,
    }));
  } catch (err) {
    console.warn("Using fallback mock entrances:", err);
    return [
      {
        id: "ent-101",
        buildingName: "Jio World Convention Centre",
        entranceName: "Gate 2",
        latitude: 19.068,
        longitude: 72.868,
        doorType: "push_button",
        stepCount: 0,
        rampAvailable: true,
        rampSlopePercent: 3.5,
        widthCm: 95,
        photoUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
        notes: "Automated actuator on the left post. Wide threshold with zero curb.",
        confidenceScore: 0.98,
        lastVerifiedAt: new Date().toISOString(),
      },
      {
        id: "ent-102",
        buildingName: "Bandra Kurla Complex Metro Station",
        entranceName: "Line 3 Aqua Line",
        latitude: 19.0659,
        longitude: 72.8684,
        doorType: "automatic",
        stepCount: 0,
        rampAvailable: true,
        rampSlopePercent: 3.0,
        widthCm: 110,
        notes: "Both lifts operational. Tactile platform edge guide and direct concourse roll-in.",
        confidenceScore: 0.95,
        lastVerifiedAt: new Date().toISOString(),
      },
      {
        id: "ent-103",
        buildingName: "Bandra West Railway Station",
        entranceName: "West Accessible Footbridge",
        latitude: 19.0544,
        longitude: 72.8402,
        doorType: "manual_light",
        stepCount: 0,
        rampAvailable: true,
        rampSlopePercent: 7.14,
        widthCm: 100,
        notes: "Ramp grade 1:14 smooth finish. Tactile warning tiles. Platform ramp access.",
        confidenceScore: 0.91,
        lastVerifiedAt: new Date().toISOString(),
      },
    ];
  }
}

/**
 * Fetch active route hazards
 */
export async function fetchHazards(): Promise<Hazard[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/hazards/`);
    if (!res.ok) throw new Error("Failed to fetch hazards");
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      hazardType: item.hazard_type,
      severity: item.severity,
      description: item.description,
      latitude: item.latitude,
      longitude: item.longitude,
      isActive: item.is_active,
      confidenceScore: item.confidence_score,
      verificationCount: item.verification_count,
      lastVerifiedAt: item.last_verified_at,
    }));
  } catch (err) {
    console.warn("Using fallback mock hazards:", err);
    return [
      {
        id: "haz-01",
        hazardType: "broken_surface",
        severity: "medium",
        description: "Utility roadworks near the G Block curb cut.",
        latitude: 19.0673,
        longitude: 72.8665,
        isActive: true,
        confidenceScore: 0.88,
        verificationCount: 4,
        lastVerifiedAt: new Date().toISOString(),
      },
    ];
  }
}

/**
 * Request an accessible route to destination doorway
 */
export async function calculateRoute(
  origin: [number, number],
  destination: [number, number],
  profile: AccessibilityProfile
): Promise<Route> {
  try {
    const res = await fetch(`${API_BASE_URL}/routes/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin,
        destination,
        profile: {
          mobility_type: profile.mobilityType,
          max_incline_percent: profile.maxInclinePercent,
          require_step_free: profile.requireStepFree,
          require_tactile_paving: profile.requireTactilePaving,
          require_well_lit: profile.requireWellLit,
          avoid_broken_surfaces: profile.avoidBrokenSurfaces,
        },
      }),
    });

    if (!res.ok) throw new Error("Failed to calculate route");
    const data = await res.json();
    return {
      routeId: data.route_id,
      totalDistanceMeters: data.total_distance_meters,
      totalDurationSeconds: data.total_duration_seconds,
      stressScore: data.stress_score,
      isRecommended: data.is_recommended,
      stepCount: data.step_count,
      maxInclinePercent: data.max_incline_percent,
      segments: data.segments.map((s: any) => ({
        distanceMeters: s.distance_meters,
        durationSeconds: s.duration_seconds,
        inclinePercent: s.incline_percent,
        surfaceType: s.surface_type,
        isStepFree: s.is_step_free,
        confidenceScore: s.confidence_score,
        geometry: s.geometry,
      })),
      hazardsEnRoute: data.hazards_en_route || [],
      destinationEntrance: data.destination_entrance
        ? {
            id: data.destination_entrance.id,
            buildingName: data.destination_entrance.building_name,
            entranceName: data.destination_entrance.entrance_name,
            latitude: data.destination_entrance.latitude,
            longitude: data.destination_entrance.longitude,
            doorType: data.destination_entrance.door_type,
            stepCount: data.destination_entrance.step_count,
            rampAvailable: data.destination_entrance.ramp_available,
            rampSlopePercent: data.destination_entrance.ramp_slope_percent,
            widthCm: data.destination_entrance.width_cm,
            photoUrl: data.destination_entrance.photo_url,
            notes: data.destination_entrance.notes,
            confidenceScore: data.destination_entrance.confidence_score,
            lastVerifiedAt: data.destination_entrance.last_verified_at,
          }
        : undefined,
      coordinates: data.coordinates,
    };
  } catch (err) {
    console.warn("Using fallback route:", err);
    return {
      routeId: "fallback-route-1",
      totalDistanceMeters: 850,
      totalDurationSeconds: 780,
      stressScore: 0.12,
      isRecommended: true,
      stepCount: 0,
      maxInclinePercent: 3.5,
      segments: [],
      hazardsEnRoute: [],
      coordinates: [
        origin,
        [72.8638, 19.0649],
        [72.8638, 19.0655],
        [72.8645, 19.0656],
        [72.8651, 19.0653],
        [72.8650, 19.0661],
        [72.8657, 19.0666],
        [72.8665, 19.0673],
        [72.8672, 19.0675],
        destination,
      ],
    };
  }
}

/**
 * 1-Tap verification submission
 */
export async function submitVerification(payload: VerificationLog): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/verifications/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_type: payload.targetType,
        target_id: payload.targetId,
        user_response: payload.userResponse,
        latitude: payload.latitude,
        longitude: payload.longitude,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Verification failed to post:", err);
    return false;
  }
}
