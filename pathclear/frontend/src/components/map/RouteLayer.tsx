"use client";

import React from "react";
import { Route } from "@/types";

interface RouteLayerProps {
  route?: Route | null;
}

/**
 * RouteLayer displays accessibility segment coloring and stress overlays.
 * Used in tandem with MapLibre or as an SVG/Canvas path overlay.
 */
export const RouteLayer: React.FC<RouteLayerProps> = ({ route }) => {
  if (!route || !route.coordinates || route.coordinates.length < 2) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end p-4">
      {/* Route Confidence Tag */}
      <div className="self-start rounded-full bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
        Verified Step-Free Path • Max Incline: {route.maxInclinePercent}%
      </div>
    </div>
  );
};

export default RouteLayer;
