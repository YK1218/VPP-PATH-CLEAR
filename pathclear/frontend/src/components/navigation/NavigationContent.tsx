"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { submitVerification } from "@/lib/api";
import NavHeader from "@/components/navigation/NavHeader";
import NavMapOverlay from "@/components/navigation/NavMapOverlay";
import TurnInstructionCard from "@/components/navigation/TurnInstructionCard";

import MapControls from "@/components/navigation/MapControls";
import NavFooter from "@/components/navigation/NavFooter";
import Last50FeetCard from "@/components/navigation/Last50FeetCard";
import { Entrance, Route, Hazard } from "@/types";
import { CheckCircle2, ArrowRight, Sparkles, Navigation, DoorOpen } from "lucide-react";
import { useVoiceAgent } from "@/contexts/VoiceAgentContext";
import { useProfile } from "@/contexts/ProfileContext";

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
  const { profileMode } = useProfile();
  const [isHazardVerified, setIsHazardVerified] = useState(false);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  
  // Simulated distance to destination (starts at 180m, can simulate down to 35m)
  const [distanceRemainingMeters, setDistanceRemainingMeters] = useState(180);
  const isWithinArrivalRange = distanceRemainingMeters <= 50;

  const { speak, isMuted } = useVoiceAgent();
  const [showApproach, setShowApproach] = useState(false);

  // Speak initial turn instruction for blind / low-vision users via VoiceAgent (respects mute & accessibility)
  useEffect(() => {
    if (profileMode === "blind" || profileMode === "low-vision") {
      const text = `Navigation started for ${data.destination}. ${data.turnInstruction.instruction} on ${data.turnInstruction.street}. ${data.turnInstruction.slope}.`;
      speak(text);
    }
  }, [data.destination, profileMode, speak]);

  // Handle 1-tap hazard verification
  const handleVerify = (response: "clear" | "blocked") => {
    setIsHazardVerified(true);
    if (data.routeAlert.hazardId) {
      submitVerification({
        targetType: "hazard",
        targetId: data.routeAlert.hazardId,
        userResponse: response,
        latitude: data.entrance.latitude,
        longitude: data.entrance.longitude,
      });
    }

    // Auto-dismiss confirmed alert after 4 seconds to eliminate clutter
    setTimeout(() => {
      setIsAlertDismissed(true);
    }, 4000);
  };

  const handleSimulateArrival = () => {
    setDistanceRemainingMeters((prev) => (prev <= 50 ? 180 : 35));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f5f8fa]">
      {/* 1. Top Header */}
      <NavHeader destination={data.destination} />

      {/* Arrival Proximity Alert Banner (Triggers within 50m) */}
      {isWithinArrivalRange && (
        <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 border border-emerald-300/50 flex items-center justify-center text-white shrink-0">
              <DoorOpen size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-extrabold bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Arrival Imminent • 35m Ahead
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                Approaching {data.destination}
              </p>
              <p className="text-xs text-emerald-100">
                100% Step-free doorway with motion sensor & 2.1% ramp ready.
              </p>
            </div>
          </div>

          <Link
            href={`/arrival?dest=${encodeURIComponent(data.destination)}`}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Arrival Guide</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* 2. Map Background */}
      <NavMapOverlay 
        route={data.route} 
        entrance={data.entrance} 
        hazards={data.hazards} 
      />

      {/* 3. Floating Left Card: Turn Instructions */}
      <TurnInstructionCard {...data.turnInstruction} />



      {/* 5. Map Controls (Floating Bottom-Right above NavFooter) */}
      <MapControls />

      {/* Live Simulation Toolbar (Top-Right under header) */}
      <div className="absolute top-[88px] right-4 md:right-6 z-30 hidden md:flex items-center gap-2">
        <button
          onClick={handleSimulateArrival}
          className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200 text-xs font-bold text-gray-700 hover:text-emerald-700 shadow-md hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
          title="Simulate approaching within 50m of the destination entrance"
        >
          <Navigation size={13} className="text-emerald-600" />
          <span>{isWithinArrivalRange ? "Reset Distance (180m)" : "Simulate Arrival (<50m)"}</span>
        </button>
      </div>

      {/* 6. Bottom Footer */}
      <NavFooter
        eta={data.footer.eta}
        timeRemaining={isWithinArrivalRange ? "1 min" : data.footer.timeRemaining}
        distance={isWithinArrivalRange ? "35 m" : data.footer.distance}
        entranceName={data.footer.entranceName}
        onViewApproach={() => setShowApproach(true)}
      />

      {/* 7. Last 50 Feet Overlay */}
      {showApproach && (
        <Last50FeetCard 
          entrance={data.entrance} 
          onClose={() => setShowApproach(false)} 
        />
      )}
    </div>
  );
}