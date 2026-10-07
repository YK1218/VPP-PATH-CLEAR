"use client";

import { Compass, Plus, Minus, Layers } from "lucide-react";
import { useMap } from "@/contexts/MapContext";

export default function MapControls() {
  const { is3DMode, toggle3DMode, zoomIn, zoomOut, recenter } = useMap();

  return (
    <div className="absolute bottom-[96px] right-4 md:right-6 flex flex-col gap-2 z-40">
      {/* 3D / 2D Perspective Toggle Button */}
      <button
        type="button"
        onClick={toggle3DMode}
        className={`w-11 h-11 rounded-2xl shadow-lg flex flex-col items-center justify-center font-black transition-all border cursor-pointer hover:scale-105 ${
          is3DMode
            ? "bg-slate-900 text-emerald-400 border-emerald-500/60 shadow-emerald-950/30 ring-2 ring-emerald-500/20"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
        }`}
        title={is3DMode ? "3D buildings active. Click to switch to 2D view" : "2D view active. Click to switch to 3D perspective"}
        aria-label="Toggle 3D Perspective Mode"
      >
        <span className="text-[12px] leading-none tracking-tight">{is3DMode ? "3D" : "2D"}</span>
        <span className="text-[8px] font-mono opacity-70 leading-none mt-0.5">{is3DMode ? "VIEW" : "PLAN"}</span>
      </button>

      {/* Recenter / My Location Button */}
      <button 
        type="button"
        onClick={() => recenter()}
        className="w-11 h-11 bg-white rounded-2xl shadow-md flex items-center justify-center text-pathclear-primary border border-gray-100 hover:bg-gray-50 transition-colors focus-visible:outline-pathclear-primary cursor-pointer hover:scale-105"
        aria-label="My Location"
        title="Recenter map"
      >
        <Compass size={20} strokeWidth={2.5} />
      </button>

      {/* Zoom Controls */}
      <div className="flex flex-col bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <button 
          type="button"
          onClick={zoomIn}
          className="w-11 h-11 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors focus-visible:outline-pathclear-primary cursor-pointer"
          aria-label="Zoom In"
          title="Zoom in"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
        <div className="w-full h-px bg-gray-100 mx-auto max-w-[28px]"></div>
        <button 
          type="button"
          onClick={zoomOut}
          className="w-11 h-11 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors focus-visible:outline-pathclear-primary cursor-pointer"
          aria-label="Zoom Out"
          title="Zoom out"
        >
          <Minus size={20} strokeWidth={2.5} />
        </button>
      </div>

    </div>
  );
}
