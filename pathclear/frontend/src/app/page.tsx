"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Compass, ShieldAlert, CheckCircle, Navigation, Sliders } from "lucide-react";
import Map from "@/components/map/Map";
import RouteCard from "@/components/navigation/RouteCard";
import EntranceCard from "@/components/navigation/EntranceCard";
import VerificationPrompt from "@/components/navigation/VerificationPrompt";
import AccessibilityProfile from "@/components/profile/AccessibilityProfile";
import { Entrance, Hazard, Route, AccessibilityProfile as ProfileType } from "@/types";
import { fetchEntrances, fetchHazards, calculateRoute, submitVerification } from "@/lib/api";

const DEFAULT_PROFILE: ProfileType = {
  id: "manual-wheelchair",
  name: "Manual Wheelchair",
  mobilityType: "wheelchair_manual",
  maxInclinePercent: 5.0,
  requireStepFree: true,
  requireTactilePaving: false,
  requireWellLit: false,
  avoidBrokenSurfaces: true,
};

export default function Home() {
  const [profile, setProfile] = useState<ProfileType>(DEFAULT_PROFILE);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("Civic Center & Library");
  const [entrances, setEntrances] = useState<Entrance[]>([]);
  const [selectedEntrance, setSelectedEntrance] = useState<Entrance | null>(null);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [route, setRoute] = useState<Route | null>(null);
  const [showVerification, setShowVerification] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      const fetchedEntrances = await fetchEntrances();
      setEntrances(fetchedEntrances);
      if (fetchedEntrances.length > 0) {
        setSelectedEntrance(fetchedEntrances[0]);
      }

      const fetchedHazards = await fetchHazards();
      setHazards(fetchedHazards);

      // Default sample route
      const demoRoute = await calculateRoute(
        [-122.422, 37.777],
        [-122.4191, 37.7792],
        DEFAULT_PROFILE
      );
      setRoute(demoRoute);
    }
    loadInitialData();
  }, []);

  const handleProfileChange = async (newProfile: ProfileType) => {
    setProfile(newProfile);
    if (selectedEntrance) {
      const updatedRoute = await calculateRoute(
        [-122.422, 37.777],
        [selectedEntrance.longitude, selectedEntrance.latitude],
        newProfile
      );
      setRoute(updatedRoute);
    }
  };

  const handleVerification = async (userResponse: "clear" | "blocked") => {
    await submitVerification({
      targetType: "entrance",
      targetId: selectedEntrance?.id || "ent-101",
      userResponse,
    });
  };

  return (
    <main className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20">
            P
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              PathClear
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                Last 50 Feet Verified
              </span>
            </h1>
          </div>
        </div>

        {/* Profile Quick Toggle */}
        <button
          type="button"
          onClick={() => setShowProfileModal(!showProfileModal)}
          aria-label="Customize accessibility mobility profile"
          className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors focus:ring-4 focus:ring-blue-400"
        >
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>{profile.name}</span>
          <span className="text-zinc-500 text-[10px]">({profile.maxInclinePercent}% max)</span>
        </button>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Route Controls & Signature Cards */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Destination Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accessible destination..."
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-semibold text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Profile Modal / Drawer Overlay */}
          {showProfileModal && (
            <AccessibilityProfile
              currentProfile={profile}
              onUpdateProfile={(p) => {
                handleProfileChange(p);
                setShowProfileModal(false);
              }}
            />
          )}

          {/* Differentiating Feature 1: The "Last 50 Feet" Entrance Card */}
          {selectedEntrance && (
            <EntranceCard
              entrance={selectedEntrance}
              onConfirmTarget={() => {
                setIsNavigating(true);
              }}
            />
          )}

          {/* Route Overview Card */}
          {route && (
            <RouteCard
              route={route}
              onStartNavigation={() => setIsNavigating(true)}
            />
          )}

          {/* Differentiating Feature 2: 1-Tap Passive Micro-Verification */}
          {showVerification && (
            <VerificationPrompt
              question="Is the West Library entrance ramp clear right now?"
              targetName="Civic Center West Ramp"
              onVerify={handleVerification}
              onDismiss={() => setShowVerification(false)}
            />
          )}
        </div>

        {/* Right Column: Full Interactive Map */}
        <div className="lg:col-span-7 flex flex-col min-h-[500px] lg:min-h-full">
          <Map
            route={route}
            entrance={selectedEntrance}
            hazards={hazards}
            onHazardClick={(h) => alert(`Hazard details: ${h.description}`)}
            onEntranceClick={(e) => setSelectedEntrance(e)}
          />
        </div>
      </div>
    </main>
  );
}
