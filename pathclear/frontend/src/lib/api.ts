import { AccessibilityProfile, Entrance, Hazard, Route, VerificationLog } from "./types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

export class ApiRequestError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch (error) {
    throw new ApiRequestError(error instanceof Error ? error.message : "Could not reach the PathClear backend");
  }
  if (!response.ok) {
    throw new ApiRequestError(`PathClear API request failed (${response.status})`, response.status);
  }
  return response.json() as Promise<T>;
}

function mapEntrance(item: any): Entrance {
  return {
    id: String(item.id),
    buildingName: item.building_name,
    entranceName: item.entrance_name ?? undefined,
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    doorType: item.door_type ?? undefined,
    stepCount: item.step_count ?? undefined,
    rampAvailable: item.has_ramp ?? item.ramp_available ?? undefined,
    rampSlopePercent: item.ramp_slope ?? item.ramp_slope_percent ?? undefined,
    curbStepHeight: item.curb_step_height ?? undefined,
    tactilePaving: item.tactile_paving ?? item.has_tactile_paving ?? undefined,
    widthCm: item.width_cm ?? undefined,
    photoUrl: item.photo_url ?? undefined,
    notes: item.notes ?? undefined,
    last50FeetInstructions: item.last_50_feet_instructions ?? undefined,
    confidenceScore: item.confidence_score ?? item.confidence ?? undefined,
    lastVerifiedAt: item.last_verified_at ?? item.verified_at ?? undefined,
  };
}

function mapHazard(item: any): Hazard {
  const coordinates = item.geometry?.coordinates;
  const latitude = item.latitude ?? (Array.isArray(coordinates) ? Number(coordinates[1]) : NaN);
  const longitude = item.longitude ?? (Array.isArray(coordinates) ? Number(coordinates[0]) : NaN);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new ApiRequestError("Hazard response did not include valid coordinates");
  }
  return {
    id: String(item.id),
    hazardType: item.type ?? item.hazard_type,
    severity: item.severity,
    description: item.description ?? undefined,
    latitude: Number(latitude),
    longitude: Number(longitude),
    isActive: item.is_active ?? (item.status === "active" ? true : undefined),
    confidenceScore: item.confidence ?? item.confidence_score ?? undefined,
    verificationCount: item.verification_count ?? undefined,
    lastVerifiedAt: item.last_verified_at ?? item.verified_at ?? undefined,
  };
}

/**
 * Fetch accessible entrances with real-time confidence scores
 */
export async function fetchEntrances(): Promise<Entrance[]> {
  const data = await requestJson<any[]>("/entrances/");
  return data.map(mapEntrance);
}

/**
 * Fetch active route hazards
 */
export async function fetchHazards(latitude: number, longitude: number, radius = 500): Promise<Hazard[]> {
  const query = new URLSearchParams({ lat: String(latitude), lng: String(longitude), radius: String(radius) });
  const data = await requestJson<any[]>(`/hazards/nearby?${query.toString()}`);
  return data.map(mapHazard);
}

export interface HazardReport {
  type: string;
  latitude: number;
  longitude: number;
  severity: string;
  description: string;
}

export async function reportHazard(payload: HazardReport): Promise<Hazard> {
  const data = await requestJson<any>("/hazards/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: payload.type,
      lat: payload.latitude,
      lng: payload.longitude,
      severity: payload.severity,
      description: payload.description,
    }),
  });
  return mapHazard(data);
}

/**
 * Request an accessible route to destination doorway
 */
export async function calculateRoute(
  origin: [number, number],
  destination: [number, number],
  profile: AccessibilityProfile
): Promise<Route> {
  const data = await requestJson<any>("/navigation/route", {
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
    hazardsEnRoute: (data.hazards_en_route || []).map(mapHazard),
    destinationEntrance: data.destination_entrance
      ? mapEntrance(data.destination_entrance)
      : undefined,
    coordinates: data.coordinates,
  };
}

/**
 * 1-Tap verification submission
 */
export async function submitVerification(payload: VerificationLog): Promise<{ message: string }> {
  return requestJson<{ status: string; message: string }>("/verifications/", {
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
}
