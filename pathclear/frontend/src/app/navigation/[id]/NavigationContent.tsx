"use client";

import React from "react";
import { submitVerification } from "@/lib/api";
import NavHeader from "@/components/navigation/NavHeader";
import NavMapOverlay from "@/components/navigation/NavMapOverlay";
import TurnInstructionCard from "@/components/navigation/TurnInstructionCard";
import RouteAlertCard from "@/components/navigation/RouteAlertCard";
import MapControls from "@/components/navigation/MapControls";
import NavFooter from "@/components/navigation/NavFooter";
import { Entrance, Route, Hazard } from "@/types";

interface NavigationContentProps {
  data: {
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
  };
}

export default function NavigationContent({ data }: NavigationContentProps) {
  const handleVerify = (response: "clear" | "blocked") => {
    if (data.routeAlert.hazardId) {
      submitVerification({
        targetType: "hazard",
        targetId: data.routeAlert.hazardId,
        userResponse: response,
        latitude: data.entrance.latitude,
        longitude: data.entrance.longitude,
      });
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f5f8fa]">
      {/* 1. Top Header */}
      <NavHeader destination={data.destination} />

      {/* 2. Map Background */}
      <NavMapOverlay 
        route={data.route} 
        entrance={data.entrance} 
        hazards={data.hazards} 
      />

      {/* 3. Floating Left Card: Turn Instructions */}
      <TurnInstructionCard {...data.turnInstruction} />

      {/* 4. Floating Right Card: Route Alert (1-Tap Verification) */}
      <RouteAlertCard 
        {...data.routeAlert} 
        onVerify={handleVerify}
      />

      {/* 5. Map Controls */}
      <MapControls />

      {/* 6. Bottom Footer */}
      <NavFooter {...data.footer} />
    </div>
  );
}