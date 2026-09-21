"use client";

import React from "react";
import { AlertTriangle, AlertCircle, ShieldAlert } from "lucide-react";
import { Hazard } from "@/types";

interface HazardMarkerProps {
  hazard: Hazard;
  onClick?: (hazard: Hazard) => void;
}

export const HazardMarker: React.FC<HazardMarkerProps> = ({ hazard, onClick }) => {
  const isBlocker = hazard.severity === "blocker";
  const confidencePercent = Math.round(hazard.confidenceScore * 100);

  return (
    <button
      type="button"
      onClick={() => onClick?.(hazard)}
      aria-label={`Hazard alert: ${hazard.hazardType}, severity ${hazard.severity}`}
      className={`group relative flex items-center justify-center p-2 rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-400 ${
        isBlocker ? "bg-red-600 text-white" : "bg-amber-500 text-black"
      }`}
      style={{ minWidth: "48px", minHeight: "48px" }}
    >
      {isBlocker ? (
        <ShieldAlert className="w-6 h-6 animate-pulse" />
      ) : (
        <AlertTriangle className="w-5 h-5" />
      )}

      {/* Floating Tooltip */}
      <span className="absolute bottom-full mb-2 hidden group-hover:flex group-focus:flex flex-col items-center z-30 pointer-events-none">
        <span className="bg-zinc-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-xl whitespace-nowrap border border-zinc-700">
          <span className="capitalize font-bold">{hazard.hazardType.replace("_", " ")}</span>
          <span className="text-zinc-400 text-[10px] block">
            {confidencePercent}% confidence • {hazard.verificationCount} reports
          </span>
        </span>
      </span>
    </button>
  );
};

export default HazardMarker;
