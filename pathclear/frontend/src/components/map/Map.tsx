"use client";

import React, { useEffect, useRef, useState } from "react";
import { Navigation, Plus, Minus, Compass, Layers, CheckCircle2 } from "lucide-react";
import { Entrance, Hazard, Route } from "@/types";
import RouteLayer from "./RouteLayer";
import HazardMarker from "./HazardMarker";

interface MapProps {
  route?: Route | null;
  entrance?: Entrance | null;
  hazards?: Hazard[];
  onHazardClick?: (hazard: Hazard) => void;
  onEntranceClick?: (entrance: Entrance) => void;
}

export const Map: React.FC<MapProps> = ({
  route,
  entrance,
  hazards = [],
  onHazardClick,
  onEntranceClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [highContrast, setHighContrast] = useState(false);

  return (
    <div
      className={`relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl border transition-colors ${
        highContrast
          ? "bg-black border-yellow-400"
          : "bg-zinc-900 border-zinc-800"
      }`}
      role="region"
      aria-label="Interactive Accessible Navigation Map"
    >
      {/* Visual Canvas / Interactive Representation */}
      <div
        ref={mapContainerRef}
        className="relative w-full h-full flex items-center justify-center bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]"
      >
        {/* SVG Route Visualization */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <path
            d="M 120 320 Q 280 200 420 260 T 700 160"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="1 0"
            className="drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]"
          />
        </svg>

        {/* Origin Marker */}
        <div
          className="absolute z-20 flex flex-col items-center"
          style={{ left: "110px", top: "305px" }}
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-xl animate-pulse" />
          <span className="mt-1 text-[11px] font-bold text-emerald-300 bg-zinc-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
            Start
          </span>
        </div>

        {/* Hazard Marker on Route */}
        {hazards.length > 0 && (
          <div
            className="absolute z-20"
            style={{ left: "320px", top: "220px" }}
          >
            <HazardMarker hazard={hazards[0]} onClick={onHazardClick} />
          </div>
        )}

        {/* Destination Entrance Marker ('The Last 50 Feet') */}
        {entrance && (
          <div
            className="absolute z-20 flex flex-col items-center cursor-pointer group"
            style={{ left: "680px", top: "135px" }}
            onClick={() => onEntranceClick?.(entrance)}
          >
            <div className="relative flex items-center justify-center w-11 h-11 bg-blue-600 rounded-full border-4 border-white shadow-2xl transition-transform group-hover:scale-110">
              <CheckCircle2 className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-900" />
            </div>
            <span className="mt-1 text-[11px] font-bold text-blue-200 bg-zinc-950/90 px-2.5 py-1 rounded-md border border-blue-500/40 shadow-lg">
              {entrance.buildingName} • Accessible Door
            </span>
          </div>
        )}

        {/* Route Layer Metadata Overlay */}
        <RouteLayer route={route} />
      </div>

      {/* Floating Controls (High-contrast 48px touch targets for accessibility) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button
          type="button"
          onClick={() => setHighContrast(!highContrast)}
          aria-label={`Toggle high-contrast mode, currently ${highContrast ? "on" : "off"}`}
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900/90 text-white border border-zinc-700 shadow-xl backdrop-blur-md hover:bg-zinc-800 focus:ring-4 focus:ring-blue-400"
        >
          <Layers className={`w-5 h-5 ${highContrast ? "text-yellow-400" : "text-zinc-300"}`} />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(z + 1, 20))}
          aria-label="Zoom in"
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900/90 text-white border border-zinc-700 shadow-xl backdrop-blur-md hover:bg-zinc-800 focus:ring-4 focus:ring-blue-400"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(z - 1, 10))}
          aria-label="Zoom out"
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900/90 text-white border border-zinc-700 shadow-xl backdrop-blur-md hover:bg-zinc-800 focus:ring-4 focus:ring-blue-400"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Recenter to current location"
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-xl hover:bg-blue-500 focus:ring-4 focus:ring-blue-400"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Map;
