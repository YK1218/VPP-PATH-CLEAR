"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { X, Camera, Volume2, ShieldCheck, Activity, AlertTriangle } from "lucide-react";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Obstacle {
  label: string;
  confidence: number;
  distance_meters: number;
  position: string;
  bbox: BoundingBox;
}

interface VisionResponse {
  obstacles: Obstacle[];
  haptic_pattern: number[];
  instruction_audio: string | null;
}

export default function VirtualCanePage() {
  const [isActive, setIsActive] = useState(false);
  const [visionData, setVisionData] = useState<VisionResponse | null>(null);
  const audioRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(async () => {
        try {
          const res = await fetch("http://localhost:8000/api/v1/vision/analyze", {
            method: "POST"
          });
          const data: VisionResponse = await res.json();
          setVisionData(data);

          // 1. Play Haptics
          if (data.haptic_pattern.length > 0 && "vibrate" in navigator) {
            navigator.vibrate(data.haptic_pattern);
          }

          // 2. Play Audio Instruction
          if (data.instruction_audio && "speechSynthesis" in window) {
            // Cancel previous speech so it doesn't queue up endlessly
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(data.instruction_audio);
            utterance.rate = 1.1; // Slightly faster for immediate feedback
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
          }

        } catch (err) {
          console.error("Vision API Error:", err);
        }
      }, 3000); // Poll every 3 seconds for the demo
    }

    return () => {
      clearInterval(interval);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isActive]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col select-none">
      
      {/* Fake Camera Feed Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-80"
          src="https://cdn.pixabay.com/vimeo/328828946/street-23055.mp4?width=720&hash=8c30d9fb1363404c0d1cf50db4d1a1b553e198b5"
        />
        {/* Dark overlay when inactive */}
        {!isActive && <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-500" />}
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <Link 
          href="/" 
          className="w-12 h-12 bg-black/40 backdrop-blur border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <X size={24} />
        </Link>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur border border-white/10 px-4 py-2 rounded-full">
          <Activity size={16} className={isActive ? "text-emerald-400 animate-pulse" : "text-gray-400"} />
          <span className="text-white font-bold text-sm tracking-wider uppercase">
            {isActive ? "Vision Active" : "Standby"}
          </span>
        </div>
      </div>

      {/* Render Bounding Boxes */}
      {isActive && visionData && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {visionData.obstacles.map((obs, i) => (
            <div 
              key={i}
              className="absolute border-4 border-red-500 bg-red-500/20 rounded-xl transition-all duration-500 animate-pulse flex flex-col items-center justify-center"
              style={{
                left: `${obs.bbox.x * 100}%`,
                top: `${obs.bbox.y * 100}%`,
                width: `${obs.bbox.width * 100}%`,
                height: `${obs.bbox.height * 100}%`,
              }}
            >
              <div className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1.5 absolute -top-4">
                <AlertTriangle size={14} />
                {obs.label.replace("_", " ")} ({obs.distance_meters}m)
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main UI Controls (Bottom) */}
      <div className="relative z-20 mt-auto p-6 pb-12 flex flex-col items-center">
        
        {/* Status Text */}
        <div className="mb-8 text-center h-16 flex items-center justify-center">
          {isActive ? (
            visionData?.obstacles.length ? (
              <p className="text-red-400 text-2xl font-black bg-black/50 backdrop-blur px-6 py-3 rounded-2xl border border-red-500/30">
                {visionData.instruction_audio}
              </p>
            ) : (
              <p className="text-emerald-400 text-2xl font-black bg-black/50 backdrop-blur px-6 py-3 rounded-2xl border border-emerald-500/30 flex items-center gap-2">
                <ShieldCheck size={24} />
                Path is clear
              </p>
            )
          ) : (
            <p className="text-white/70 font-medium text-lg text-center max-w-sm">
              Tap to activate Virtual Cane. The camera will scan for obstacles and provide haptic + audio feedback.
            </p>
          )}
        </div>

        {/* Big Activation Button */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 shadow-2xl ${
            isActive 
              ? "bg-red-600 hover:bg-red-700 shadow-red-900/50 scale-95" 
              : "bg-pathclear-primary hover:bg-pathclear-secondary shadow-emerald-900/50 scale-100"
          }`}
        >
          {isActive ? (
            <>
              <div className="w-8 h-8 rounded-sm bg-white animate-pulse" />
              <span className="text-white font-bold text-sm tracking-widest uppercase mt-1">Stop</span>
            </>
          ) : (
            <>
              <Camera size={40} className="text-white" />
              <span className="text-white font-bold text-sm tracking-widest uppercase mt-1">Start</span>
            </>
          )}
        </button>

        {/* Info Icons */}
        <div className="flex items-center gap-6 mt-10 opacity-60">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1"/><path d="M22 7v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1V7"/><path d="M12 22v-4"/><path d="M12 6V2"/></svg>
            </div>
            <span className="text-white text-[10px] font-bold tracking-widest uppercase">Haptics</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
              <Volume2 size={24} className="text-white" />
            </div>
            <span className="text-white text-[10px] font-bold tracking-widest uppercase">Audio</span>
          </div>
        </div>

      </div>
    </div>
  );
}

