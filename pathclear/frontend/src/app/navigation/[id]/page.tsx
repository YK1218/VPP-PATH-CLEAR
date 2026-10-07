import NavHeader from "@/components/navigation/NavHeader";
import NavMapOverlay from "@/components/navigation/NavMapOverlay";
import TurnInstructionCard from "@/components/navigation/TurnInstructionCard";

import MapControls from "@/components/navigation/MapControls";
import NavFooter from "@/components/navigation/NavFooter";
import Link from "next/link";
import { fetchEntrances, calculateRoute, fetchHazards } from "@/lib/api";
import { AccessibilityProfile, Entrance, Hazard, MobilityProfileType, Route } from "@/types";
import NavigationContent from "@/components/navigation/NavigationContent";

interface NavigationPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    dest?: string;
    origin?: string;
    origin_lng?: string;
    origin_lat?: string;
    mobility_type?: string;
    max_incline_percent?: string;
    require_step_free?: string;
    require_tactile_paving?: string;
    require_well_lit?: string;
    avoid_broken_surfaces?: string;
  }>;
}

interface NavigationData {
  destination: string;
  turnInstruction: {
    distance: string;
    instruction: string;
    street: string;
    slope: string;
    width: string;
  };
  routeAlert: {
    timeReported: string;
    title: string;
    distanceAhead: string;
    question: string;
    travelerImpactCount?: number;
    hazardId?: string;
  };
  footer: {
    eta: string;
    timeRemaining: string;
    distance: string;
    entranceName: string;
  };
  route: Route;
  entrance: Entrance;
  hazards: Hazard[];
}

async function fetchNavigationData(
  entranceId: string, 
  customDest?: string, 
  customOrigin?: string,
  profile?: AccessibilityProfile,
  originCoordinates?: [number, number]
): Promise<NavigationData> {
  // Fetch all entrances to find the target entrance
  const entrances = await fetchEntrances();
  const entrance = entrances.find(e => e.id === entranceId);

  if (!entrance) {
    throw new Error(`Entrance ${entranceId} not found`);
  }

  // Use the origin from the planner's backend route when provided.
  if (!originCoordinates) {
    throw new Error("The planner did not provide origin coordinates. Return to the planner and calculate a route first.");
  }
  const routeProfile = profile || {
    id: "wheelchair",
    name: "Wheelchair",
    mobilityType: "wheelchair_manual" as const,
    maxInclinePercent: 5.0,
    requireStepFree: true,
    requireTactilePaving: false,
    requireWellLit: false,
    avoidBrokenSurfaces: true,
  };

  const route = await calculateRoute(
    originCoordinates,
    [entrance.longitude, entrance.latitude],
    routeProfile
  );

  // Fetch hazards
  // The backend accepts a point query, so request hazards near the route midpoint.
  const routePoint = route.coordinates[Math.floor(route.coordinates.length / 2)] || [entrance.longitude, entrance.latitude];
  const routeHazards = await fetchHazards(routePoint[1], routePoint[0]);

  // Format data for navigation components
  const now = new Date();
  const eta = new Date(now.getTime() + route.totalDurationSeconds * 1000);

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}min`;
  };

  // Get first hazard for route alert (or create default)
  const primaryHazard = routeHazards[0];
  const destinationName = customDest || [entrance.buildingName, entrance.entranceName].filter(Boolean).join(", ");

  return {
    destination: destinationName,
    turnInstruction: {
      distance: route.segments[0]
        ? `${Math.round(route.segments[0].distanceMeters)} M`
        : "100 M",
      instruction: "Head toward destination",
      street: customOrigin ? `${customOrigin} approach` : "Accessible Route",
      slope: route.segments[0]
        ? `${route.segments[0].inclinePercent}% slope`
        : "Gentle slope",
      width: entrance.widthCm === undefined ? "Width not provided by backend" : `${entrance.widthCm} cm width`,
    },
    routeAlert: {
      timeReported: primaryHazard?.lastVerifiedAt
        ? `${Math.round((Date.now() - new Date(primaryHazard.lastVerifiedAt).getTime()) / 60000)} MIN AGO`
        : primaryHazard ? "TIME UNKNOWN" : "NONE NEAR ROUTE POINT",
      title: primaryHazard?.description || primaryHazard?.hazardType || "No nearby hazards returned",
      distanceAhead: primaryHazard
        ? `${Math.round(Math.sqrt(
            Math.pow(primaryHazard.latitude - routePoint[1], 2) +
            Math.pow(primaryHazard.longitude - routePoint[0], 2)
          ) * 111000)}m`
        : "",
      question: primaryHazard
        ? `Can you confirm if this ${primaryHazard.hazardType} is still present?${primaryHazard.description ? ` ${primaryHazard.description}` : ""}`
        : "No nearby hazard was returned for the queried point.",
      travelerImpactCount: primaryHazard?.verificationCount,
      hazardId: primaryHazard?.id,
    },
    footer: {
      eta: formatTime(eta),
      timeRemaining: formatDuration(route.totalDurationSeconds),
      distance: `${(route.totalDistanceMeters / 1000).toFixed(1)} km`,
      entranceName: destinationName,
    },
    route,
    entrance,
    hazards: routeHazards,
  };
}

export default async function NavigationPage(props: NavigationPageProps) {
  const { id } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const customDest = searchParams.dest;
  const customOrigin = searchParams.origin;
  const parsedIncline = Number(searchParams.max_incline_percent);
  const parsedOriginLng = Number(searchParams.origin_lng);
  const parsedOriginLat = Number(searchParams.origin_lat);
  const originCoordinates: [number, number] | undefined =
    Number.isFinite(parsedOriginLng) && Number.isFinite(parsedOriginLat)
      ? [parsedOriginLng, parsedOriginLat]
      : undefined;
  const profile: AccessibilityProfile = {
    id: "navigation-profile",
    name: "Navigation profile",
    mobilityType: (searchParams.mobility_type || "wheelchair_manual") as MobilityProfileType,
    maxInclinePercent: Number.isFinite(parsedIncline) ? parsedIncline : 5,
    requireStepFree: searchParams.require_step_free !== "false",
    requireTactilePaving: searchParams.require_tactile_paving === "true",
    requireWellLit: searchParams.require_well_lit === "true",
    avoidBrokenSurfaces: searchParams.avoid_broken_surfaces !== "false",
  };

  try {
    const data = await fetchNavigationData(id, customDest, customOrigin, profile, originCoordinates);

    return <NavigationContent data={data} />;
  } catch (error) {
    return (
      <main className="min-h-screen bg-[#f5f8fa] flex items-center justify-center p-6">
        <section className="max-w-lg bg-white rounded-2xl border border-gray-200 shadow-lg p-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">Unable to load this navigation</h1>
          <p className="mt-3 text-sm text-gray-600">{error instanceof Error ? error.message : "The backend request failed."}</p>
          <Link href="/planner" className="inline-block mt-5 px-4 py-2 rounded-lg bg-emerald-800 text-white font-semibold">Return to planner</Link>
        </section>
      </main>
    );
  }
}
