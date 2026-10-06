"use client";

import React from "react";
import { Sliders, Shield, Eye, Check, Accessibility } from "lucide-react";
import { useProfile, PRESET_PROFILES } from "@/contexts/ProfileContext";

export const AccessibilityProfile: React.FC = () => {
  const { profile, setProfile, presets } = useProfile();

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-base">Mobility & Friction Preset</h3>
        </div>
        <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
          {profile.name}
        </span>
      </div>

      {/* Profile Selection Chips */}
      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => {
          const isSelected = p.id === profile.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setProfile(p)}
              className={`flex items-center justify-between rounded-xl p-3 text-left text-xs font-bold transition-all border ${
                isSelected
                  ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10"
                  : "bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
              style={{ minHeight: "48px" }}
            >
              <span>{p.name}</span>
              {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Constraints Summary */}
      <div className="flex flex-col gap-2 rounded-xl bg-zinc-800/40 p-3 text-xs border border-zinc-800">
        <div className="flex justify-between items-center text-zinc-300">
          <span>Max Allowed Incline:</span>
          <span className="font-extrabold text-blue-300">{profile.maxInclinePercent}%</span>
        </div>
        <div className="flex justify-between items-center text-zinc-300">
          <span>Step-Free Guarantee:</span>
          <span className={`font-bold ${profile.requireStepFree ? "text-emerald-400" : "text-zinc-400"}`}>
            {profile.requireStepFree ? "Strict (0 Steps)" : "Flexible"}
          </span>
        </div>
        <div className="flex justify-between items-center text-zinc-300">
          <span>Tactile Paving:</span>
          <span className="font-bold text-zinc-400">
            {profile.requireTactilePaving ? "Required" : "Optional"}
          </span>
        </div>
        <div className="flex justify-between items-center text-zinc-300">
          <span>Well-Lit Paths:</span>
          <span className="font-bold text-zinc-400">
            {profile.requireWellLit ? "Required" : "Optional"}
          </span>
        </div>
        <div className="flex justify-between items-center text-zinc-300">
          <span>Avoid Broken Surfaces:</span>
          <span className="font-bold text-zinc-400">
            {profile.avoidBrokenSurfaces ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityProfile;