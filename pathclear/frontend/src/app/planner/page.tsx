"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, TrendingUp, Volume2, Send, CheckCircle2, AlertTriangle, BarChart2, Mountain, Droplet, Sun, Loader2, Map, GripVertical } from "lucide-react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ============================================================
// MOCK DATA - Self-contained, no backend required
// ============================================================

interface RoutePreviewData {
  header: {
    title: string;
    verifiedAgo: string;
  };
  origin: string;
  destination: string;
  stats: {
    totalTime: string;
    distance: string;
    maxIncline: string;
  };
  elevationProfile: {
    segments: Array<{
      distance: number;
      elevation: number;
      incline: number;
      label: string;
    }>;
    totalGain: number;
    totalLoss: number;
  };
  surfaceComposition: Array<{
    type: string;
    percentage: number;
    color: string;
    icon: React.ReactNode;
  }>;
  hazards: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    distanceAhead: string;
    description: string;
  }>;
  navigationTargetId: string;
}

const MOCK_ROUTE_DATA: RoutePreviewData = {
  header: {
    title: "100% Step-Free Route",
    verifiedAgo: "Verified 12 min ago",
  },
  origin: "Bandra West (Hill Road)",
  destination: "Jio World Centre (South Accessible Entrance • Gate 2)",
  stats: {
    totalTime: "18 min total",
    distance: "3.2 km distance",
    maxIncline: "2.4% max incline",
  },
  elevationProfile: {
    segments: [
      { distance: 0, elevation: 8, incline: 0, label: "Start" },
      { distance: 0.5, elevation: 12, incline: 0.8, label: "Hill Rd" },
      { distance: 1.2, elevation: 18, incline: 1.5, label: "Carter Rd" },
      { distance: 2.0, elevation: 22, incline: 2.4, label: "BKC Approach" },
      { distance: 2.8, elevation: 20, incline: -0.5, label: "G Block" },
      { distance: 3.2, elevation: 18, incline: -0.6, label: "Destination" },
    ],
    totalGain: 14,
    totalLoss: 4,
  },
  surfaceComposition: [
    { type: "Smooth Asphalt", percentage: 65, color: "bg-gray-700", icon: <Mountain size={12} /> },
    { type: "Tactile Paving", percentage: 20, color: "bg-amber-600", icon: <Droplet size={12} /> },
    { type: "Concrete Ramp", percentage: 10, color: "bg-blue-600", icon: <TrendingUp size={12} /> },
    { type: "Indoor Concourse", percentage: 5, color: "bg-pathclear-primary", icon: <Sun size={12} /> },
  ],
  hazards: [
    {
      type: "construction",
      severity: "low",
      distanceAhead: "1.1 km",
      description: "Minor sidewalk works near Carter Rd junction. Ramp detour in place.",
    },
    {
      type: "steep_slope",
      severity: "medium",
      distanceAhead: "2.0 km",
      description: "BKC Approach ramp reaches 2.4% for ~80m. Power-assist recommended.",
    },
  ],
  navigationTargetId: "ent-101",
};

// Route coordinates: Bandra West (Hill Road) -> Jio World Centre (Gate 2, BKC)
// User provided in [lat, lng] format; MapLibre expects [lng, lat]
const ROUTE_COORDINATES: [number, number][] = [
  [72.8315, 19.0558],  // Bandra West (Hill Road)
  [72.8432, 19.0575],
  [72.8520, 19.0598],
  [72.8590, 19.0610],
  [72.8684, 19.0633],  // Jio World Centre (BKC Gate 2)
];

const ORIGIN_COORDS: [number, number] = ROUTE_COORDINATES[0];
const DEST_COORDS: [number, number] = ROUTE_COORDINATES[ROUTE_COORDINATES.length - 1];
const MAP_CENTER: [number, number] = [72.850, 19.0595]; // Midpoint approx

// ============================================================
// Planner Map Overlay Component
// ============================================================

function PlannerMapOverlay() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    let animationActive = true;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap",
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: MAP_CENTER,
      zoom: 14.5,
      maxZoom: 19,
      pitch: 45,
      bearing: -15,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", () => {
      // Current position at ~30% along the route (simulated progress)
      const currentPosition: [number, number] = [
        ORIGIN_COORDS[0] + (DEST_COORDS[0] - ORIGIN_COORDS[0]) * 0.3,
        ORIGIN_COORDS[1] + (DEST_COORDS[1] - ORIGIN_COORDS[1]) * 0.3,
      ];

      // Already-traveled path (start → current position)
      const completedCoords: [number, number][] = [ORIGIN_COORDS, currentPosition];

      // Remaining path (current position → destination)
      const remainingCoords: [number, number][] = [currentPosition, DEST_COORDS];

      // ---- COMPLETED path source (already traveled) ----
      map.addSource("route-completed", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: completedCoords },
        },
      });

      // Completed path — dimmed, thinner
      map.addLayer({
        id: "completed-shadow",
        type: "line",
        source: "route-completed",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#034f38", "line-width": 10, "line-opacity": 0.1 },
      });
      map.addLayer({
        id: "completed-line",
        type: "line",
        source: "route-completed",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#0e9f6e", "line-width": 8, "line-opacity": 0.35 },
      });

      // ---- REMAINING path source (current → destination) ----
      map.addSource("route-remaining", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: remainingCoords },
        },
      });

      // Remaining path — bright glow shadow
      map.addLayer({
        id: "remaining-glow",
        type: "line",
        source: "route-remaining",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#0e9f6e", "line-width": 20, "line-opacity": 0.15, "line-blur": 8 },
      });

      // Remaining path — main bright line
      map.addLayer({
        id: "remaining-line",
        type: "line",
        source: "route-remaining",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#0e9f6e", "line-width": 10 },
      });

      // Remaining path — white dashed overlay for direction
      map.addLayer({
        id: "remaining-dash",
        type: "line",
        source: "route-remaining",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": 3,
          "line-dasharray": [1.5, 2.5],
          "line-opacity": 0.8,
        },
      });

      // ---- Origin Marker ----
      const originEl = document.createElement("div");
      originEl.className = "w-6 h-6 bg-blue-600 border-4 border-white rounded-full shadow-md";
      new maplibregl.Marker({ element: originEl })
        .setLngLat(ORIGIN_COORDS)
        .addTo(map);

      // ---- Destination Marker: Double-ring target + Badge ----
      const destEl = document.createElement("div");
      destEl.className = "relative";
      destEl.innerHTML = `
        <div class="relative flex flex-col items-center">
          <!-- Double-ring target marker -->
          <div class="relative w-10 h-10">
            <!-- Outer dark green ring -->
            <div class="absolute inset-0 rounded-full border-4 border-pathclear-primary bg-transparent"></div>
            <!-- Middle white ring -->
            <div class="absolute inset-1.5 rounded-full border-2 border-white bg-transparent"></div>
            <!-- Inner teal center dot -->
            <div class="absolute inset-3 rounded-full bg-teal-500"></div>
          </div>
          <!-- Badge above marker -->
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap">
            <div class="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-md flex items-center gap-1.5">
              Gate 2 Accessible Entry
            </div>
          </div>
        </div>
      `;
      new maplibregl.Marker({ element: destEl, anchor: "bottom" })
        .setLngLat(DEST_COORDS)
        .addTo(map);

      // Fit bounds to show full route
      const bounds = new maplibregl.LngLatBounds();
      (ROUTE_COORDINATES as [number, number][]).forEach((coord) => bounds.extend(coord));
      map.fitBounds(bounds, { padding: { top: 80, bottom: 80, left: 50, right: 50 }, maxZoom: 15 });

      // ---- Animated dot flowing from user to destination ----
      map.addSource("nav-dot", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: currentPosition },
        },
      });

      // Outer glow ring
      map.addLayer({
        id: "nav-dot-glow",
        type: "circle",
        source: "nav-dot",
        paint: {
          "circle-radius": 14,
          "circle-color": "#0e9f6e",
          "circle-opacity": 0.25,
          "circle-blur": 1,
        },
      });

      // Mid ring
      map.addLayer({
        id: "nav-dot-mid",
        type: "circle",
        source: "nav-dot",
        paint: {
          "circle-radius": 7,
          "circle-color": "#0e9f6e",
          "circle-opacity": 0.5,
        },
      });

      // Inner bright dot
      map.addLayer({
        id: "nav-dot-inner",
        type: "circle",
        source: "nav-dot",
        paint: {
          "circle-radius": 4,
          "circle-color": "#ffffff",
          "circle-stroke-color": "#0e9f6e",
          "circle-stroke-width": 2,
        },
      });

      // Animate the dot along the REMAINING path only
      let dotProgress = 0;
      const dotSpeed = 0.004;
      const totalRemaining = remainingCoords.length;

      const animateNavDot = () => {
        if (!animationActive) return;

        dotProgress += dotSpeed;
        if (dotProgress >= totalRemaining - 1) dotProgress = 0;

        const segIdx = Math.floor(dotProgress);
        const segFrac = dotProgress - segIdx;
        const ptA = remainingCoords[segIdx];
        const ptB = remainingCoords[Math.min(segIdx + 1, totalRemaining - 1)];

        // Interpolate position
        const lng = ptA[0] + (ptB[0] - ptA[0]) * segFrac;
        const lat = ptA[1] + (ptB[1] - ptA[1]) * segFrac;

        const src = map.getSource("nav-dot") as maplibregl.GeoJSONSource;
        if (src) {
          src.setData({
            type: "Feature",
            properties: {},
            geometry: { type: "Point", coordinates: [lng, lat] },
          });
        }

        requestAnimationFrame(animateNavDot);
      };
      animateNavDot();
    });

    return () => {
      animationActive = false;
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-[#eef1f6] overflow-hidden z-0">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

// ============================================================
// SUB-COMPONENT: ElevationProfileChart
// ============================================================

function ElevationProfileChart({ data }: { data: RoutePreviewData["elevationProfile"] }) {
  const segments = data.segments;
  const maxElevation = Math.max(...segments.map((s) => s.elevation));
  const minElevation = Math.min(...segments.map((s) => s.elevation));
  const range = maxElevation - minElevation || 1;
  const totalDistance = segments[segments.length - 1].distance;
  const maxIncline = Math.max(...segments.map((s) => Math.abs(s.incline)));

  const points = segments.map((seg) => {
    const x = (seg.distance / totalDistance) * 100;
    const y = 100 - ((seg.elevation - minElevation) / range) * 75;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = [
    `${segments[0].distance / totalDistance * 100},100`,
    ...points.split(" "),
    `${segments[segments.length - 1].distance / totalDistance * 100},100`,
  ].join(" ");

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <BarChart2 size={16} className="text-pathclear-primary" />
            Elevation & Slope Profile
          </h4>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
            Max {maxIncline.toFixed(1)}% • Gentle
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-pathclear-primary" />
            +{data.totalGain}m gain
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            -{data.totalLoss}m loss
          </span>
        </div>
      </div>

      <div className="relative h-28 w-full">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0e9f6e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0e9f6e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="#e5e7eb" strokeWidth="0.5">
            {[25, 50, 75].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} />)}
            {[25, 50, 75].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="100" />)}
          </g>
          <path d={`M${areaPoints}Z`} fill="url(#elevationGradient)" />
          <path d={`M${points}`} stroke="#0e9f6e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {segments.map((seg, i) => (
            <circle key={i} cx={(seg.distance / totalDistance) * 100} cy={100 - ((seg.elevation - minElevation) / range) * 75} r="3" fill="#0e9f6e" stroke="white" strokeWidth="2" />
          ))}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-end pointer-events-none">
          {segments.slice(1).map((seg, i) => (
            <div key={i} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-auto" style={{ left: `${((seg.distance + segments[i].distance) / 2 / totalDistance) * 100}%` }}>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90 backdrop-blur shadow-xs border ${
                seg.incline > 2 ? "text-red-600 border-red-200" : seg.incline > 0 ? "text-amber-600 border-amber-200" : "text-blue-600 border-blue-200"
              }`}>
                {seg.incline > 0 ? "+" : ""}{seg.incline.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-2 px-1">
        {segments.map((seg) => (
          <span key={seg.label} className="relative">{seg.label}</span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENT: SurfaceCompositionBar (Simplified)
// ============================================================

function SurfaceCompositionBar({ surfaces }: { surfaces: RoutePreviewData["surfaceComposition"] }) {
  const surfaceText = surfaces.map(s => `${s.type} (${s.percentage}%)`).join(" • ");

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
        <Mountain size={16} className="text-pathclear-primary" />
        Surface Composition
      </h4>
      <p className="text-sm text-gray-600 mb-3">{surfaceText}</p>
      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">
        <CheckCircle2 size={12} strokeWidth={2.5} />
        Zero Cobblestones
      </span>
    </div>
  );
}

// ============================================================
// SUB-COMPONENT: HazardAlertStrip
// ============================================================

function HazardAlertStrip({ hazards }: { hazards: RoutePreviewData["hazards"] }) {
  if (hazards.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
        <AlertTriangle size={16} className="text-amber-500" />
        Route Alerts ({hazards.length})
      </h4>
      <div className="space-y-2">
        {hazards.map((hazard, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
            <div className="flex-shrink-0 mt-0.5">
              {hazard.severity === "high" && <AlertTriangle size={18} className="text-red-500" />}
              {hazard.severity === "medium" && <AlertTriangle size={18} className="text-amber-500" />}
              {hazard.severity === "low" && <span className="w-5 h-5 flex items-center justify-center"><AlertTriangle size={18} className="text-blue-500" /></span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-gray-900 capitalize">{hazard.type.replace("_", " ")}</span>
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{hazard.distanceAhead} ahead</span>
              </div>
              <p className="text-sm text-gray-600">{hazard.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function PlannerPage() {
  const route = MOCK_ROUTE_DATA;
  const [panelWidth, setPanelWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(280, Math.min(520, startWidth + delta));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-pathclear-bg flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Map Background - Full Screen */}
      <PlannerMapOverlay />

      {/* Floating Left Card: Route Preview - Resizable */}
      <aside
        className={`absolute top-[88px] left-4 md:left-6 bottom-4 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 flex flex-col overflow-hidden select-none ${isResizing ? "select-none" : ""}`}
        style={{ width: panelWidth }}
      >
        {/* Drag Handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-pathclear-secondary/30 active:bg-pathclear-secondary/50 transition-colors flex items-center justify-center"
          onMouseDown={handleMouseDown}
          aria-label="Resize panel"
        >
          <div className="w-px h-8 bg-gray-300 rounded-full" />
        </div>

        {/* Card Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-500/20">
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{route.header.title}</p>
              <p className="text-xs font-medium text-gray-500">{route.header.verifiedAgo}</p>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close preview">
            <span className="sr-only">Close</span>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content - Compact */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Origin / Destination */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <MapPin size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">From</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{route.origin}</p>
              </div>
            </div>

            <div className="relative pl-6">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="absolute left-2 top-0 w-2 h-2 -translate-x-1/2 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
              <div className="absolute left-2 bottom-0 w-2 h-2 -translate-x-1/2 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <CheckCircle2 size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">To</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{route.destination}</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-gray-50/50 border border-gray-100">
            <div className="text-center">
              <p className="text-xl font-black text-gray-900">{route.stats.totalTime.split(" ")[0]}</p>
              <p className="text-xs font-medium text-gray-500">min total</p>
            </div>
            <div className="border-x border-gray-200 text-center">
              <p className="text-xl font-black text-gray-900">{route.stats.distance.split(" ")[0]}</p>
              <p className="text-xs font-medium text-gray-500">km distance</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <TrendingUp size={12} strokeWidth={3} className="text-blue-600" />
                <p className="text-xl font-black text-gray-900">{route.stats.maxIncline.split(" ")[0]}</p>
              </div>
              <p className="text-xs font-medium text-gray-500">max incline</p>
            </div>
          </div>

          {/* Elevation & Slope Profile */}
          <ElevationProfileChart data={route.elevationProfile} />

          {/* Surface Composition */}
          <SurfaceCompositionBar surfaces={route.surfaceComposition} />

          {/* Entrance Step-Free Guarantee */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={16} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900">Entrance Guaranteed Step-Free</h4>
                <p className="text-xs text-gray-500 mt-1">Door B: Automatic sliding doors with flush-level threshold. Verified by PathClear community 12 min ago.</p>
              </div>
            </div>
          </div>

          {/* Hazard Alerts */}
          <HazardAlertStrip hazards={route.hazards} />
        </div>

        {/* Card Footer: Primary Action + Secondary Actions */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-2xl space-y-3">
          <Link
            href={`/navigation/${route.navigationTargetId}`}
            className="w-full flex items-center justify-center gap-2 bg-pathclear-primary hover:bg-pathclear-secondary text-white px-5 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-pathclear-primary/20 transition-all focus-visible:outline-pathclear-primary"
          >
            <CheckCircle2 size={20} strokeWidth={2.5} />
            Start Step-Free Navigation
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <button className="w-full flex items-center justify-center gap-2 bg-[#f0f4ff] hover:bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border border-blue-100 focus-visible:outline-pathclear-primary">
              <Volume2 size={18} strokeWidth={2.5} />
              Audio Preview
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border border-gray-200 focus-visible:outline-pathclear-primary">
              <Send size={18} strokeWidth={2.5} />
              Send Route
            </button>
          </div>

          {/* Report Change - tertiary action, full width */}
          <Link
            href="/report-barrier"
            className="w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border border-amber-200 focus-visible:outline-pathclear-primary"
          >
            <AlertTriangle size={16} strokeWidth={2.5} />
            Report Change on This Route
          </Link>
        </div>
      </aside>

      {/* Footer */}
      <Footer />
    </div>
  );
}