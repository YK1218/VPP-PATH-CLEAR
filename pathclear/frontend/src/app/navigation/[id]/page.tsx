import NavHeader from "@/components/navigation/NavHeader";
import NavMapOverlay from "@/components/navigation/NavMapOverlay";
import TurnInstructionCard from "@/components/navigation/TurnInstructionCard";
import RouteAlertCard from "@/components/navigation/RouteAlertCard";
import MapControls from "@/components/navigation/MapControls";
import NavFooter from "@/components/navigation/NavFooter";
import { notFound } from "next/navigation";
import { fetchEntrances, calculateRoute, fetchHazards } from "@/lib/api";
import { Entrance, Route, Hazard } from "@/types";
import NavigationContent from "@/components/navigation/NavigationContent";

interface NavigationPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    dest?: string;
    origin?: string;
    lat?: string;
    lng?: string;
    originLat?: string;
    originLng?: string;
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
    travelerImpactCount: number;
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
  customLat?: string,
  customLng?: string,
  customOriginLat?: string,
  customOriginLng?: string
): Promise<NavigationData> {
  // Fetch all entrances to find the target entrance
  const entrances = await fetchEntrances();
  let entrance = entrances.find(e => e.id === entranceId) || { ...entrances[0] };

  if (customLat && customLng) {
    const parsedLat = parseFloat(customLat);
    const parsedLng = parseFloat(customLng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      entrance = {
        ...entrance,
        id: entranceId,
        buildingName: customDest || entrance.buildingName,
        entranceName: "Verified Accessible Doorway",
        latitude: parsedLat,
        longitude: parsedLng,
      };
    }
  }

  if (!entrance) {
    throw new Error(`Entrance ${entranceId} not found`);
  }

  // Calculate dynamic origin
  let originCoords: [number, number] = [72.864, 19.064];
  if (customOriginLat && customOriginLng) {
    const oLat = parseFloat(customOriginLat);
    const oLng = parseFloat(customOriginLng);
    if (!isNaN(oLat) && !isNaN(oLng)) {
      originCoords = [oLng, oLat];
    }
  } else if (customLat && customLng) {
    originCoords = [entrance.longitude - 0.005, entrance.latitude - 0.003];
  }

  const profile = {
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
    originCoords,
    [entrance.longitude, entrance.latitude],
    profile
  );

  // Fetch hazards
  const hazards = await fetchHazards();

  // Find hazards near the route
  const routeHazards = hazards.filter(h => h.isActive);

  // Format data for navigation components
  const totalDurationMin = Math.round(route.totalDurationSeconds / 60);
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
  const destinationName = customDest || `${entrance.buildingName}, ${entrance.entranceName}`;

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
      width: "2m width safe",
    },
    routeAlert: {
      timeReported: primaryHazard
        ? `${Math.round((Date.now() - new Date(primaryHazard.lastVerifiedAt).getTime()) / 60000)} MIN AGO`
        : "LIVE",
      title: primaryHazard?.description || "Route clear - no active hazards",
      distanceAhead: primaryHazard
        ? `${Math.round(Math.sqrt(
            Math.pow(primaryHazard.latitude - entrance.latitude, 2) +
            Math.pow(primaryHazard.longitude - entrance.longitude, 2)
          ) * 111000)}m`
        : "0m",
      question: primaryHazard
        ? `Can you confirm if this hazard is still present? ${primaryHazard.description}`
        : "No active hazards on this route. Is the path clear?",
      travelerImpactCount: primaryHazard?.verificationCount || 0,
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
  const customLat = searchParams.lat;
  const customLng = searchParams.lng;
  const customOriginLat = searchParams.originLat;
  const customOriginLng = searchParams.originLng;

  try {
    const data = await fetchNavigationData(
      id,
      customDest,
      customOrigin,
      customLat,
      customLng,
      customOriginLat,
      customOriginLng
    );

    return <NavigationContent data={data} />;
  } catch (error) {
    notFound();
  }
}
