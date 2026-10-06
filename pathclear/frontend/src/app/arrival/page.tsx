"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  CheckCircle2, 
  Volume2, 
  Share2, 
  AlertTriangle, 
  Maximize2, 
  TrendingUp, 
  Sun, 
  GripHorizontal, 
  DoorClosed, 
  ShieldCheck, 
  MapPin, 
  Mic, 
  Play, 
  Pause, 
  Loader2, 
  Headphones, 
  Phone,
  Sparkles,
  Award,
  ArrowRight,
  Check
} from "lucide-react";

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

function StatusBanner({ data, customTitle }: { data: ArrivalData["statusBanner"]; customTitle?: string }) {
  return (
    <div className="relative z-10 w-full bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 size={12} strokeWidth={3} />
            {data.proximity}
          </span>
          <h1 className="text-lg font-bold text-gray-900">{customTitle || data.title}</h1>
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
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-sm border border-slate-200/80 group">
      <div className="relative aspect-[16/10] w-full">
        <img
          src={data.src}
          alt={data.alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

        {/* Hotspots */}
        <div className={`absolute top-4 left-4 ${pillStyle}`}>{data.hotspots[0].text}</div>
        <div className={`absolute top-4 right-4 ${pillStyle} flex items-center gap-1`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {data.hotspots[1].text}
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${pillStyle} border-emerald-400 font-semibold`}>
          {data.hotspots[2].text}
        </div>
        <div className={`absolute top-1/2 left-4 -translate-y-1/2 ${pillStyle}`}>{data.hotspots[3].text}</div>
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 ${pillStyle} font-semibold text-emerald-800 bg-white/95`}>
          {data.hotspots[4].text}
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
          <span className="text-base font-extrabold text-slate-900 mt-0.5">{item.value}</span>
          <span className="text-[10px] text-slate-500 font-medium truncate max-w-full">{item.subtitle}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SUB-COMPONENT: DestinationSpecsCard
// ============================================================

function DestinationSpecsCard({ 
  data, 
  customDestName,
  onCompleteTrip
}: { 
  data: ArrivalData["destinationSpecs"]; 
  customDestName?: string;
  onCompleteTrip: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hazardVerifications, setHazardVerifications] = useState<Record<string, string>>({});

  const handleHazardVote = (hazardId: string, status: string) => {
    setHazardVerifications(prev => ({ ...prev, [hazardId]: status }));
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
      {/* Header Info */}
      <div>
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-2">
          {data.portalTag}
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {customDestName || data.name}
        </h2>
        <div className="flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 mt-2">
          <CheckCircle2 size={14} strokeWidth={2.5} />
          <span>{data.verified}</span>
        </div>
      </div>

      {/* Arrival Specifications */}
      <div className="space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Arrival Specifications
        </p>
        {data.specs.map((spec, i) => (
          <div key={i} className="bg-slate-50/70 rounded-xl p-3 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                {i === 0 && <DoorClosed size={16} strokeWidth={2.5} />}
                {i === 1 && <ShieldCheck size={16} strokeWidth={2.5} />}
                {i === 2 && <Headphones size={16} strokeWidth={2.5} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">{spec.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{spec.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Audio Orientation Guide */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2">
            <Headphones size={15} strokeWidth={2.5} className="text-emerald-600" />
            Audio Orientation Guide
          </h3>
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            {data.audioGuide.duration}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-colors"
            aria-label={isPlaying ? "Pause audio guide" : "Play audio guide"}
          >
            {isPlaying ? <Pause size={16} strokeWidth={2.5} /> : <Play size={16} strokeWidth={2.5} className="ml-0.5" />}
          </button>
          <div className="flex-1 h-3.5 bg-emerald-100 rounded-full overflow-hidden flex items-center justify-between px-2">
            {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-300'}`}
                style={{ 
                  height: isPlaying ? `${30 + Math.sin(i * 1.5) * 35}%` : '40%', 
                  animationDelay: `${i * 120}ms` 
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* POST-TRIP HAZARD VERIFICATION CARD */}
      <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-amber-900">
              Community Hazard Micro-Audit
            </h4>
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
            +15 Karma
          </span>
        </div>
        <p className="text-xs text-amber-800">
          Were the reported hazards along your route still present?
        </p>

        {/* Hazard 1 */}
        <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">Sidewalk repair on Carter Rd</p>
            <p className="text-[10px] text-gray-500">Reported 2h ago</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {hazardVerifications["h1"] ? (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <Check size={12} strokeWidth={3} /> {hazardVerifications["h1"]}
              </span>
            ) : (
              <>
                <button
                  onClick={() => handleHazardVote("h1", "Cleared")}
                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200"
                >
                  Cleared
                </button>
                <button
                  onClick={() => handleHazardVote("h1", "Still Blocked")}
                  className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold border border-red-200"
                >
                  Blocked
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hazard 2 */}
        <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">BKC Approach ramp steep slope</p>
            <p className="text-[10px] text-gray-500">2.4% max incline</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {hazardVerifications["h2"] ? (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <Check size={12} strokeWidth={3} /> {hazardVerifications["h2"]}
              </span>
            ) : (
              <>
                <button
                  onClick={() => handleHazardVote("h2", "Manageable")}
                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200"
                >
                  Manageable
                </button>
                <button
                  onClick={() => handleHazardVote("h2", "Difficult")}
                  className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold border border-amber-300"
                >
                  Difficult
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        {/* Primary CTA: Complete Trip */}
        <button
          onClick={onCompleteTrip}
          className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 shadow-lg shadow-emerald-700/30 active:scale-[0.99] text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <CheckCircle2 size={18} strokeWidth={2.5} />
          <span>{data.ctaPrimary}</span>
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          {data.ctaSecondary.map((action, i) => {
            const sharedClass =
              "w-full h-10 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all";
            if (action.label === "Report Change") {
              return (
                <Link key={i} href="/report-barrier" className={sharedClass}>
                  {action.icon}
                  <span>{action.label}</span>
                </Link>
              );
            }
            return (
              <button key={i} className={sharedClass}>
                {action.icon}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desk Assistance */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Need Assistance?</p>
              <p className="font-semibold text-slate-900 text-xs">{data.supportBox.title}</p>
            </div>
            <button className="h-9 px-3 rounded-lg border border-emerald-300 text-emerald-700 font-bold text-xs hover:bg-emerald-50 transition-colors flex items-center gap-1 cursor-pointer">
              <Phone size={13} strokeWidth={2.5} />
              <span>{data.supportBox.actionLabel}</span>
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

function ArrivalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destParam = searchParams.get("dest");

  const [arrival] = useState(MOCK_ARRIVAL_DATA);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  const handleCompleteTrip = () => {
    // Save to localStorage
    if (typeof window !== "undefined") {
      try {
        const history = JSON.parse(localStorage.getItem("pathclear_completed_trips") || "[]");
        history.unshift({
          id: `trip-${Date.now()}`,
          destination: destParam || arrival.destinationSpecs.name,
          timestamp: new Date().toISOString(),
          stepFreeVerified: true,
        });
        localStorage.setItem("pathclear_completed_trips", JSON.stringify(history.slice(0, 10)));
      } catch (e) {
        console.warn("Storage error", e);
      }
    }

    setIsCompletedModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f8fa] text-slate-800 font-sans antialiased relative">
      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Status Banner */}
      <StatusBanner 
        data={arrival.statusBanner} 
        customTitle={destParam ? `Arrival ahead — at ${destParam}` : undefined} 
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-3 md:px-5 py-5">
        <div className="max-w-[1400px] mx-auto p-5 md:p-6 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg shadow-emerald-900/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Entrance Photo with AR Hotspots & Telemetry */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <EntrancePhotoCard data={arrival.entrancePhoto} />
              <TelemetryStrip data={arrival.telemetry} />
            </div>

            {/* Right Column: Destination Specs & Post-trip Verification */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <DestinationSpecsCard 
                data={arrival.destinationSpecs} 
                customDestName={destParam || undefined}
                onCompleteTrip={handleCompleteTrip}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Trip Completed Celebration Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 p-6 sm:p-8 max-w-md w-full text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
              <Award size={36} strokeWidth={2.2} />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                100% Step-Free Verified
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Trip Completed!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You reached <strong className="text-slate-800">{destParam || arrival.destinationSpecs.name}</strong> successfully without encountering blockers.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Trip Saved:</span>
                <span className="text-slate-900">Local History & Supabase Sync</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Steward Karma:</span>
                <span className="text-emerald-700">+50 Points</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Return to Home</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

export default function ArrivalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f8fa] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ArrivalPageContent />
    </Suspense>
  );
}