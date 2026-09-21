export type MobilityProfileType =
  | "wheelchair_manual"
  | "wheelchair_power"
  | "walker"
  | "cane"
  | "visual_guide";

export interface AccessibilityProfile {
  id: string;
  name: string;
  mobilityType: MobilityProfileType;
  maxInclinePercent: number;
  requireStepFree: boolean;
  requireTactilePaving: boolean;
  requireWellLit: boolean;
  avoidBrokenSurfaces: boolean;
}

export type DoorType = "automatic" | "push_button" | "manual_light" | "manual_heavy";

export interface Entrance {
  id: string;
  buildingName: string;
  entranceName: string;
  latitude: number;
  longitude: number;
  doorType: DoorType;
  stepCount: number;
  rampAvailable: boolean;
  rampSlopePercent?: number;
  widthCm?: number;
  photoUrl?: string;
  notes?: string;
  confidenceScore: number; // 0.0 - 1.0 with decay
  lastVerifiedAt: string;
}

export type HazardType =
  | "step"
  | "steep_slope"
  | "broken_surface"
  | "broken_elevator"
  | "construction";

export type HazardSeverity = "low" | "medium" | "high" | "blocker";

export interface Hazard {
  id: string;
  hazardType: HazardType;
  severity: HazardSeverity;
  description: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  confidenceScore: number;
  verificationCount: number;
  lastVerifiedAt: string;
}

export interface RouteSegment {
  distanceMeters: number;
  durationSeconds: number;
  inclinePercent: number;
  surfaceType: string;
  isStepFree: boolean;
  confidenceScore: number;
  geometry: [number, number][]; // [lon, lat][]
}

export interface Route {
  routeId: string;
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  stressScore: number; // 0.0 to 1.0
  isRecommended: boolean;
  stepCount: number;
  maxInclinePercent: number;
  segments: RouteSegment[];
  hazardsEnRoute: Hazard[];
  destinationEntrance?: Entrance;
  coordinates: [number, number][]; // [lon, lat][]
}

export interface VerificationLog {
  id?: string;
  targetType: "entrance" | "hazard";
  targetId: string;
  userResponse: "clear" | "blocked";
  latitude?: number;
  longitude?: number;
}
