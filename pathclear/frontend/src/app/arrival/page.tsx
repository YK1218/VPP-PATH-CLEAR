"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle2, Volume2, Share2, AlertTriangle, Maximize2, TrendingUp, Sun, GripHorizontal, DoorClosed, ShieldCheck, MapPin, Mic, Play, Pause, Loader2, Headphones, Phone } from "lucide-react";

// ============================================================
// MOCK DATA - Self-contained, no backend required
// ============================================================

interface ArrivalData {
  statusBanner: {
    proximity: string;
    title: string;
    elevationStatus: string;
  };
  entrancePhoto: {
    src: string;
    alt: string;
    hotspots: Array<{
      text: string;
      position: "top-left" | "top-right" | "center" | "mid-left" | "bottom-center" | "bottom-strip";
    }>;
  };
  telemetry: Array<{
    label: string;
    value: string;
    subtitle: string;
  }>;
  destinationSpecs: {
    portalTag: string;
    name: string;
    verified: string;
    specs: Array<{
      title: string;
      description: string;
    }>;
    audioGuide: {
      duration: string;
    };
    ctaPrimary: string;
    ctaSecondary: Array<{ label: string; icon: React.ReactNode }>;
    supportBox: {
      title: string;
      actionLabel: string;
    };
  };
}

const MOCK_ARRIVAL_DATA: ArrivalData = {
  statusBanner: {
    proximity: "Live Proximity • Bandra Kurla Complex, G-Block",
    title: "Arrival ahead — 20 meters to entrance",
    elevationStatus: "Elevation Status: 100% Step-Free Verified",
  },
  entrancePhoto: {
    src: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
    alt: "Jio World Centre South Accessible Entrance - modern glass convention center exterior with ramp",
    hotspots: [
      { text: "South Pavilion Gate — Ground Level", position: "top-left" },
      { text: "Sensor Lock 0.4m Precision", position: "top-right" },
      { text: "Door B: 42.5\" Clear", position: "center" },
      { text: "Ramp: 2.1% Slope", position: "mid-left" },
      { text: "Threshold: 0.0\" Flush", position: "bottom-center" },
      { text: "Tactile Path Continuous", position: "bottom-strip" },
    ],
  },
  telemetry: [
    { label: "CLEAR WIDTH", value: "106 cm", subtitle: "Exceeds standard (>90cm)" },
    { label: "MAX INCLINE", value: "1:48 grade", subtitle: "Gentle 2.1% slope" },
    { label: "LIGHTING LEVEL", value: "420 lux", subtitle: "High daylight contrast" },
    { label: "SURFACE GRIP", value: "0.82 COF", subtitle: "Dry/Wet certified high-traction" },
  ],
  destinationSpecs: {
    portalTag: "Gate 4",
    name: "Jio World Centre — South Accessible Entrance",
    verified: "Verified 12 min ago • High Confidence (Physical confirmation by Mumbai Path Steward Priya S.)",
    specs: [
      {
        title: "Touchless Motion Sensor Access",
        description: "Dual radar triggers 8 ft out; low actuator push plate at 34\"",
      },
      {
        title: "Security Wide-Gate #1 Dedicated",
        description: "1,190mm power-chair security aisle on direct left inside foyer",
      },
      {
        title: "Concourse Elevator 15m Inside",
        description: "Braille & tactile button elevators servicing Convention Halls 1-3",
      },
    ],
    audioGuide: {
      duration: "0:35 sec",
    },
    ctaPrimary: "Arrived at Door • Complete Trip",
    ctaSecondary: [
      { label: "Share Exact Pin", icon: <Share2 size={16} strokeWidth={2.5} /> },
      { label: "Report Change", icon: <AlertTriangle size={16} strokeWidth={2.5} /> },
    ],
    supportBox: {
      title: "Jio World Centre Accessibility Desk",
      actionLabel: "Dial Desk",
    },
  },
};

// ============================================================
// SUB-COMPONENT: StatusBanner
// ============================================================

function StatusBanner({ data }: { data: ArrivalData["statusBanner"] }) {
  return (
    <div className="relative z-10 w-full bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 size={12} strokeWidth={3} />
            {data.proximity}
          </span>
          <h1 className="text-lg font-bold text-gray-900">{data.title}</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-white text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-100">
          <CheckCircle2 size={12} strokeWidth={3} className="text-teal-500" />
          {data.elevationStatus}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENT: EntrancePhotoCard
// ============================================================

function EntrancePhotoCard({ data }: { data: ArrivalData["entrancePhoto"] }) {
  const pillStyle = "backdrop-blur-md bg-white/85 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm border border-white/60";

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-inner aspect-[16/10]">
      <img
        src={data.src}
        alt={data.alt}
        className="w-full h-full object-cover"
      />

      {/* AR Overlay Hotspot Pills */}
      <div className="absolute inset-0 p-4 pointer-events-none">
        {data.hotspots.map((hotspot, i) => {
          const positionClasses = {
            "top-left": "top-4 left-4",
            "top-right": "top-4 right-4",
            "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "mid-left": "top-1/2 left-4 -translate-y-1/2",
            "bottom-center": "bottom-16 left-1/2 -translate-x-1/2",
            "bottom-strip": "bottom-4 left-1/2 -translate-x-1/2",
          };

          const isBottomStrip = hotspot.position === "bottom-strip";

          return (
            <div
              key={i}
              className={`absolute pointer-events-auto ${positionClasses[hotspot.position]} ${isBottomStrip ? "" : pillStyle} ${isBottomStrip ? "flex items-center gap-1.5 bg-slate-900/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-slate-700" : ""}`}
            >
              {isBottomStrip && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              )}
              {hotspot.text}
            </div>
          );
        })}

        {/* Distance indicator bottom-right */}
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <div className={`${pillStyle} flex items-center gap-1.5`}>
            <MapPin size={12} className="text-emerald-500" />
            20m to door
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENT: TelemetryStrip
// ============================================================

function TelemetryStrip({ data }: { data: ArrivalData["telemetry"] }) {
  return (
    <div className="grid grid-cols-4 gap-3 bg-slate-50/70 border border-slate-100 rounded-xl p-3.5">
      {data.map((metric, i) => (
        <div key={i} className="text-center">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{metric.label}</p>
          <p className="text-base font-bold text-slate-900 mt-0.5">{metric.value}</p>
          <p className="text-[11px] text-slate-500">{metric.subtitle}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SUB-COMPONENT: DestinationSpecsCard
// ============================================================

function DestinationSpecsCard({ data }: { data: ArrivalData["destinationSpecs"] }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex flex-col gap-4 relative z-10">
      {/* Header Section */}
      <div className="space-y-3">
        {/* Portal Tag */}
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
          <MapPin size={12} />
          Destination Portal • {data.portalTag}
        </span>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{data.name}</h2>

        {/* Steward Verified Badge */}
        <div className="flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <CheckCircle2 size={14} strokeWidth={2.5} />
          <span>{data.verified}</span>
        </div>
      </div>

      {/* Arrival Specifications List */}
      <div className="space-y-3">
        {/* Section Header */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Arrival Specifications</p>
        {data.specs.map((spec, i) => (
          <div key={i} className="bg-slate-50/70 rounded-xl p-3 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                {i === 0 && <DoorClosed size={18} strokeWidth={2.5} />}
                {i === 1 && <ShieldCheck size={18} strokeWidth={2.5} />}
                {i === 2 && <Headphones size={18} strokeWidth={2.5} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm">{spec.title}</h3>
                <p className="text-sm text-slate-600 mt-0.5">{spec.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Audio Orientation Guide */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Headphones size={18} strokeWidth={2.5} className="text-emerald-600" />
            Audio Orientation Guide
          </h3>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{data.audioGuide.duration}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-colors focus-visible:outline-emerald-500"
            aria-label={isPlaying ? "Pause audio guide" : "Play audio guide"}
          >
            {isPlaying ? <Pause size={20} strokeWidth={2.5} /> : <Play size={20} strokeWidth={2.5} className="ml-1" />}
          </button>
          <div className="flex-1 h-4 bg-emerald-100 rounded-full overflow-hidden relative flex items-center justify-between px-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-300'}`}
                style={{ 
                  height: isPlaying ? `${25 + Math.sin(i * 1.5) * 35}%` : `${20 + (i * 3) % 15}%`, 
                  animationDelay: `${i * 120}ms` 
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Primary CTA - Fixed duplicate rounded-xl, added glow */}
        <Link href="/" className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 shadow-lg shadow-emerald-700/40 hover:shadow-emerald-600/60 hover:scale-[1.01] text-sm flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-emerald-500">
          <CheckCircle2 size={20} strokeWidth={2.5} />
          {data.ctaPrimary}
        </Link>

        {/* Secondary Actions - Added glow */}
        <div className="grid grid-cols-2 gap-3">
          {data.ctaSecondary.map((action, i) => (
            <button
              key={i}
              className="w-full h-11 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-md hover:scale-[1.01] transition-all duration-200 focus-visible:outline-emerald-500"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        {/* Bottom Assistance Card - Added glow */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Need Assistance?</p>
              <p className="font-semibold text-slate-900">{data.supportBox.title}</p>
            </div>
            <button className="h-10 px-4 rounded-lg border border-emerald-300 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 hover:shadow-md hover:shadow-emerald-200/50 transition-all duration-200 focus-visible:outline-emerald-500 flex items-center gap-1.5">
              <Phone size={16} strokeWidth={2.5} />
              {data.supportBox.actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function ArrivalPage() {
  const arrival = MOCK_ARRIVAL_DATA;

  return (
    <div className="flex flex-col min-h-screen bg-pathclear-bg relative overflow-hidden">
      {/* Inline keyframes for blob animation */}
      <style>{`
        @keyframes blob-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(40px, 30px) scale(1.05); }
        }
        @keyframes blob-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.15); }
          66% { transform: translate(25px, -40px) scale(0.9); }
        }
        @keyframes blob-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(-30px, -20px) scale(1.1) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Animated decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"
          style={{ animation: 'blob-float-1 20s ease-in-out infinite' }}
        />
        <div 
          className="absolute -bottom-48 -left-24 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-3xl"
          style={{ animation: 'blob-float-2 25s ease-in-out infinite' }}
        />
        <div 
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-emerald-50/50 rounded-full blur-2xl"
          style={{ animation: 'blob-float-3 18s ease-in-out infinite' }}
        />
        {/* Additional subtle pulse glow */}
        <div 
          className="absolute top-1/4 left-1/3 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl"
          style={{ animation: 'pulse-glow 8s ease-in-out infinite' }}
        />
      </div>

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Status Banner */}
      <StatusBanner data={arrival.statusBanner} />

      {/* Main Content - Clean Elevated Container - Reduced whitespace */}
      <main className="relative z-10 flex-1 px-3 md:px-5 py-5">
        <div className="max-w-[1400px] mx-auto p-5 md:p-6 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg shadow-emerald-900/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - 7/12 */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Entrance Photo with AR Hotspots */}
              <EntrancePhotoCard data={arrival.entrancePhoto} />

              {/* Telemetry Strip - Compact Horizontal */}
              <TelemetryStrip data={arrival.telemetry} />
            </div>

            {/* Right Column - 5/12 */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <DestinationSpecsCard data={arrival.destinationSpecs} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}