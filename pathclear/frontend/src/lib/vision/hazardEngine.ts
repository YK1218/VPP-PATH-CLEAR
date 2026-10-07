export interface BoundingBox {
  /** Normalized frame coordinates from 0 to 1. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  className: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export type HazardSeverity = "low" | "medium" | "high";
export type RelativeProximity = "far" | "moderate" | "close";

export interface HazardResult extends Detection {
  /** Relative image-space score only; it does not represent physical distance. */
  relativeProximityScore: number;
  relativeProximity: RelativeProximity;
  severity: HazardSeverity;
  alertText: string;
}

/** Converts model detections supplied by a future integration into generic alerts. */
export function buildHazardResults(detections: readonly Detection[]): HazardResult[] {
  return detections.map((detection) => {
    const relativeProximityScore = scoreRelativeProximity(detection.boundingBox);
    const relativeProximity: RelativeProximity = relativeProximityScore >= 0.67
      ? "close"
      : relativeProximityScore >= 0.34
        ? "moderate"
        : "far";
    const confidence = Math.max(0, Math.min(1, detection.confidence));
    const severity: HazardSeverity = confidence >= 0.75 && relativeProximity === "close"
      ? "high"
      : confidence >= 0.45 && relativeProximity !== "far"
        ? "medium"
        : "low";

    return {
      ...detection,
      relativeProximityScore,
      relativeProximity,
      severity,
      alertText: `Potential ${detection.className} in view; relative proximity appears ${relativeProximity}.`,
    };
  });
}

function scoreRelativeProximity(box: BoundingBox): number {
  const width = Math.max(0, Math.min(1, box.width));
  const height = Math.max(0, Math.min(1, box.height));
  const centerY = Math.max(0, Math.min(1, box.y + box.height / 2));
  const relativeSize = Math.sqrt(width * height);
  return Math.max(0, Math.min(1, relativeSize * 0.7 + centerY * 0.3));
}
