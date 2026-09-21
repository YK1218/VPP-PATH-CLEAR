import NavHeader from "@/components/navigation/NavHeader";
import NavMapOverlay from "@/components/navigation/NavMapOverlay";
import TurnInstructionCard from "@/components/navigation/TurnInstructionCard";
import RouteAlertCard from "@/components/navigation/RouteAlertCard";
import MapControls from "@/components/navigation/MapControls";
import NavFooter from "@/components/navigation/NavFooter";
import { notFound } from "next/navigation";

// Mock database
const navigationData: Record<string, any> = {
  "jio-world-centre": {
    destination: "Jio World Centre, BKC",
    turnInstruction: {
      distance: "120 M",
      instruction: "Turn slightly right",
      street: "BKC Avenue 3 Accessible Ramp",
      slope: "Gentle 1.8% slope",
      width: "1.8m width safe",
    },
    routeAlert: {
      timeReported: "35 MIN AGO",
      title: "Utility roadworks near G Block curb cut",
      distanceAhead: "45m",
      question: "Gravel near dropped curb. Can you confirm if the ramp is still passable?",
      travelerImpactCount: 38,
    },
    footer: {
      eta: "10:42 AM",
      timeRemaining: "4 min remaining",
      distance: "0.3 km",
      entranceName: "Jio World Centre - BKC Gate 2 Entrance (Ramped)",
    }
  },
  "bkc-metro-station": {
    destination: "BKC Metro Station",
    turnInstruction: {
      distance: "50 M",
      instruction: "Continue straight",
      street: "Metro Station Lift A Entrance",
      slope: "Flat",
      width: "2.2m width safe",
    },
    routeAlert: {
      timeReported: "12 MIN AGO",
      title: "Temporary barrier near Lift B",
      distanceAhead: "15m",
      question: "Cleaning in progress. Is the path to Lift A still clear?",
      travelerImpactCount: 14,
    },
    footer: {
      eta: "09:15 AM",
      timeRemaining: "2 min remaining",
      distance: "0.1 km",
      entranceName: "BKC Metro Station - Lift A (Operational)",
    }
  },
  "bandra-west-station": {
    destination: "Bandra West Station",
    turnInstruction: {
      distance: "200 M",
      instruction: "Turn left",
      street: "Station Road West Footbridge",
      slope: "Moderate 3% slope",
      width: "1.5m width safe",
    },
    routeAlert: {
      timeReported: "2 HRS AGO",
      title: "Crowded footbridge entrance",
      distanceAhead: "100m",
      question: "High foot traffic reported. Is there space for a wheelchair to pass?",
      travelerImpactCount: 112,
    },
    footer: {
      eta: "06:30 PM",
      timeRemaining: "8 min remaining",
      distance: "0.5 km",
      entranceName: "Bandra West Station - Platform 1 Ramp",
    }
  }
};

export default async function NavigationPage(props: { params: Promise<{ id: string }> }) {
  // Await the params due to Next.js 16 breaking change
  const { id } = await props.params;

  const data = navigationData[id];

  if (!data) {
    notFound();
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f5f8fa]">
      {/* 1. Top Header */}
      <NavHeader destination={data.destination} />

      {/* 2. Map Background */}
      <NavMapOverlay />

      {/* 3. Floating Left Card: Turn Instructions */}
      <TurnInstructionCard {...data.turnInstruction} />

      {/* 4. Floating Right Card: Route Alert (1-Tap Verification) */}
      <RouteAlertCard {...data.routeAlert} />

      {/* 5. Map Controls */}
      <MapControls />

      {/* 6. Bottom Footer */}
      <NavFooter {...data.footer} />
    </div>
  );
}
