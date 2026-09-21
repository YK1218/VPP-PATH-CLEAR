"use client";

import React from "react";
import { Clock, ShieldCheck, Footprints, TrendingUp, AlertTriangle } from "lucide-react";
import { Route } from "@/types";

interface RouteCardProps {
  route: Route;
  onStartNavigation?: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onStartNavigation }) => {
  const durationMin = Math.round(route.totalDurationSeconds / 60);
  const stressPercent = Math.round(route.stressScore * 100);

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl text-white">
      {/* Top Details */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Recommended Accessible Route</h3>
            <span className="text-xs text-zinc-400">Step-free guaranteed • 0 curb drops</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-white">{durationMin} min</span>
          <span className="block text-xs text-zinc-400">{(route.totalDistanceMeters / 1000).toFixed(1)} km</span>
        </div>
      </div>

      {/* Friction / Stress Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            Max Slope: {route.maxInclinePercent}%
          </span>
          <span className={`font-semibold ${stressPercent < 20 ? "text-emerald-400" : "text-amber-400"}`}>
            Physical Stress: {stressPercent < 20 ? "Very Low" : "Moderate"}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              stressPercent < 20 ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${Math.max(12, stressPercent)}%` }}
          />
        </div>
      </div>

      {/* Segment Badges */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-zinc-800/60 p-2.5 border border-zinc-700/50">
          <Footprints className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
          <span className="text-zinc-400 block text-[10px]">Steps</span>
          <span className="font-bold text-white">0 Steps</span>
        </div>
        <div className="rounded-xl bg-zinc-800/60 p-2.5 border border-zinc-700/50">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-blue-400" />
          <span className="text-zinc-400 block text-[10px]">Max Incline</span>
          <span className="font-bold text-white">&lt; {route.maxInclinePercent}%</span>
        </div>
        <div className="rounded-xl bg-zinc-800/60 p-2.5 border border-zinc-700/50">
          <Clock className="w-4 h-4 mx-auto mb-1 text-purple-400" />
          <span className="text-zinc-400 block text-[10px]">Pace Rate</span>
          <span className="font-bold text-white">1.1 m/s</span>
        </div>
      </div>

      {/* Start Action */}
      <button
        type="button"
        onClick={onStartNavigation}
        className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base shadow-lg shadow-emerald-500/20 transition-all focus:ring-4 focus:ring-emerald-300"
      >
        Start Turn-by-Turn Navigation
      </button>
    </div>
  );
};

export default RouteCard;
