"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle, DoorClosed, Sparkles, Clock, AlertCircle } from "lucide-react";
import { Entrance } from "@/types";

interface EntranceCardProps {
  entrance: Entrance;
  onConfirmTarget?: () => void;
}

export const EntranceCard: React.FC<EntranceCardProps> = ({ entrance, onConfirmTarget }) => {
  const confidencePercent = Math.round(entrance.confidenceScore * 100);

  const getDoorLabel = (type: string) => {
    switch (type) {
      case "automatic":
        return "Automatic Motion Sensor Door";
      case "push_button":
        return "Power Push-Button Actuator";
      case "manual_light":
        return "Manual Lightweight Door (< 5 lbs force)";
      case "manual_heavy":
        return "Manual Heavy Door (May require assistance)";
      default:
        return "Accessible Doorway";
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-zinc-900 border border-blue-500/40 p-5 shadow-2xl text-white relative overflow-hidden">
      {/* Signature Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            The Last 50 Feet • Entrance Preview
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{confidencePercent}% Verified</span>
        </div>
      </div>

      {/* Verified Photo Preview */}
      <div className="relative h-44 w-full overflow-hidden rounded-xl bg-zinc-800 border border-zinc-700">
        {entrance.photoUrl ? (
          <img
            src={entrance.photoUrl}
            alt={`Accessible doorway view of ${entrance.buildingName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-500">
            <span>No doorway photo available</span>
          </div>
        )}
        <div className="absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-md">
          {entrance.entranceName}
        </div>
      </div>

      {/* Building & Door Spec Details */}
      <div>
        <h4 className="text-lg font-black text-white">{entrance.buildingName}</h4>
        <p className="text-sm text-blue-300 font-medium flex items-center gap-1.5 mt-0.5">
          <DoorClosed className="w-4 h-4 text-blue-400" />
          {getDoorLabel(entrance.doorType)}
        </p>
      </div>

      {/* Attributes Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-zinc-800/70 p-2.5 border border-zinc-700/50">
          <span className="text-zinc-400 block text-[10px]">Curb & Steps</span>
          <span className="font-bold text-emerald-400">
            {entrance.stepCount === 0 ? "0 Steps (Zero Threshold)" : `${entrance.stepCount} Steps`}
          </span>
        </div>
        <div className="rounded-lg bg-zinc-800/70 p-2.5 border border-zinc-700/50">
          <span className="text-zinc-400 block text-[10px]">Ramp Incline</span>
          <span className="font-bold text-white">
            {entrance.rampAvailable ? `${entrance.rampSlopePercent || 3.5}% (ADA Compliant)` : "Level Entry"}
          </span>
        </div>
      </div>

      {entrance.notes && (
        <p className="text-xs text-zinc-300 bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-800">
          💡 {entrance.notes}
        </p>
      )}

      {/* Confirmation */}
      {onConfirmTarget && (
        <button
          type="button"
          onClick={onConfirmTarget}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all focus:ring-4 focus:ring-blue-300"
        >
          Route Directly to this Doorway
        </button>
      )}
    </div>
  );
};

export default EntranceCard;
