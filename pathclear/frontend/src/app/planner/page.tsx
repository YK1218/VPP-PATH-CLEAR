"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, TrendingUp, Volume2, Send, CheckCircle2, AlertTriangle, BarChart2, Mountain, Droplet, Sun, Loader2, Map, GripVertical, ArrowUpDown } from "lucide-react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { OSM_RASTER_STYLE, DEFAULT_MAP_ZOOM, DEFAULT_MAP_PITCH, DEFAULT_MAP_BEARING } from "@/lib/map-config";
import { setup3DMapLayers } from "@/lib/map-3d-config";
import { calculateRoute, fetchEntrances } from "@/lib/api";
import { Entrance, Route } from "@/types";
import { useProfile } from "@/contexts/ProfileContext";

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

function PlannerMapOverlay({
  originCoords = ORIGIN_COORDS,
  destCoords = DEST_COORDS,
  routeCoordinates,
  destinationLabel,
}: {
  originCoords?: [number, number];
  destCoords?: [number, number];
  routeCoordinates?: [number, number][];
  destinationLabel: string;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const activeRouteCoordinates = routeCoordinates && routeCoordinates.length > 1
    ? routeCoordinates
    : ROUTE_COORDINATES;

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    let animationActive = true;
    const centerPoint: [number, number] = [
      (originCoords[0] + destCoords[0]) / 2,
      (originCoords[1] + destCoords[1]) / 2,
    ];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: OSM_RASTER_STYLE,
      center: centerPoint,
      zoom: DEFAULT_MAP_ZOOM,
      maxZoom: 19,
      pitch: DEFAULT_MAP_PITCH,
      bearing: DEFAULT_MAP_BEARING,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", () => {
      setup3DMapLayers(map);

      // Current position at ~30% along the route (simulated progress)
      const progressIndex = Math.max(1, Math.floor((activeRouteCoordinates.length - 1) * 0.3));
      const currentPosition = activeRouteCoordinates[progressIndex];

      // Already-traveled path (start → current position)
      const completedCoords: [number, number][] = [activeRouteCoordinates[0], currentPosition];

      // Remaining path (current position → destination)
      const remainingCoords: [number, number][] = [currentPosition, ...activeRouteCoordinates.slice(progressIndex + 1)];
      if (remainingCoords.length === 1) remainingCoords.push(activeRouteCoordinates[activeRouteCoordinates.length - 1]);

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
        .setLngLat(activeRouteCoordinates[0])
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
              <span data-destination-label></span>
            </div>
          </div>
        </div>
      `;
      const destinationLabelNode = destEl.querySelector("[data-destination-label]");
      if (destinationLabelNode) destinationLabelNode.textContent = destinationLabel;
      new maplibregl.Marker({ element: destEl, anchor: "bottom" })
        .setLngLat(activeRouteCoordinates[activeRouteCoordinates.length - 1])
        .addTo(map);

      // Fit bounds to show full route
      const bounds = new maplibregl.LngLatBounds();
      activeRouteCoordinates.forEach((coord) => bounds.extend(coord));
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
  }, [originCoords, destCoords, routeCoordinates, destinationLabel]);

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
      <p className="text-[10px] text-gray-400 mb-2">Illustrative only; elevation data is not included in the backend response.</p>

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
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90 backdrop-blur shadow-xs border ${seg.incline > 2 ? "text-red-600 border-red-200" : seg.incline > 0 ? "text-amber-600 border-amber-200" : "text-blue-600 border-blue-200"
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
      <p className="text-sm text-gray-600 mb-3">{surfaceText || "Surface data not provided by the backend."}</p>
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

function PlannerPageContent() {
  const { profile } = useProfile();
  const searchParams = useSearchParams();
  const destParam = searchParams.get("dest");
  const originParam = searchParams.get("origin");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const idParam = searchParams.get("id");
  const filterParam = searchParams.get("filter");

  const [panelWidth, setPanelWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [originText, setOriginText] = useState(originParam || MOCK_ROUTE_DATA.origin);
  const [destinationText, setDestinationText] = useState(destParam || MOCK_ROUTE_DATA.destination);
  const [backendRoute, setBackendRoute] = useState<Route | null>(null);
  const [backendEntrance, setBackendEntrance] = useState<Entrance | null>(null);
  const [resolvedDestCoords, setResolvedDestCoords] = useState<[number, number] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Sync state if searchParams change
  useEffect(() => {
    if (destParam) setDestinationText(destParam);
    if (originParam) setOriginText(originParam);
  }, [destParam, originParam]);

  const hasDestinationCoordinates = Boolean(latParam && lngParam && Number.isFinite(Number(latParam)) && Number.isFinite(Number(lngParam)));
  const destCoords = useMemo<[number, number]>(() => hasDestinationCoordinates
    ? [Number(lngParam), Number(latParam)]
    : DEST_COORDS, [hasDestinationCoordinates, latParam, lngParam]);
  const originCoords = ORIGIN_COORDS;
  const expectedOrigin = originParam || MOCK_ROUTE_DATA.origin;
  const expectedDestination = destParam || MOCK_ROUTE_DATA.destination;
  const inputsMatchCoordinates = originText.trim() === expectedOrigin.trim() && destinationText.trim() === expectedDestination.trim();

  useEffect(() => {
    let isCurrent = true;
    setBackendRoute(null);
    setBackendEntrance(null);
    setResolvedDestCoords(null);
    if (!inputsMatchCoordinates) {
      setRouteLoading(false);
      setRouteError("Edited locations do not have resolved coordinates. Select a mapped suggestion before routing.");
      return () => { isCurrent = false; };
    }

    setRouteLoading(true);
    setRouteError(null);
    let entranceLookupError: string | null = null;
    fetchEntrances()
      .catch((error: unknown) => {
        entranceLookupError = error instanceof Error ? error.message : "Entrance lookup failed.";
        return [];
      })
      .then((entrances) => {
        if (!isCurrent) return;
        const exactId = idParam ? entrances.find((item) => item.id === idParam) : undefined;
        const normalizedDestination = (destParam || "").toLowerCase();
        const namedMatch = normalizedDestination
          ? entrances.find((item) => `${item.buildingName} ${item.entranceName || ""}`.toLowerCase().includes(normalizedDestination)
            || normalizedDestination.includes(item.buildingName.toLowerCase()))
          : undefined;
        const selectedEntrance = idParam ? exactId || null : namedMatch || null;
        setBackendEntrance(selectedEntrance);
        const targetCoordinates: [number, number] | null = hasDestinationCoordinates
          ? destCoords
          : selectedEntrance ? [selectedEntrance.longitude, selectedEntrance.latitude] : null;
        if (!targetCoordinates) {
          throw new Error(entranceLookupError
            ? `No destination coordinates were supplied, and the entrance lookup failed: ${entranceLookupError}`
            : "No destination coordinates or matching backend entrance were returned.");
        }
        if (entranceLookupError) setRouteError(`Route uses selected coordinates, but backend entrance lookup failed: ${entranceLookupError}`);
        setResolvedDestCoords(targetCoordinates);
        return calculateRoute(originCoords, targetCoordinates, profile);
      })
      .then((calculatedRoute) => {
        if (isCurrent && calculatedRoute) setBackendRoute(calculatedRoute);
      })
      .catch((error: unknown) => {
        if (isCurrent) setRouteError(error instanceof Error ? error.message : "The backend route request failed.");
      })
      .finally(() => {
        if (isCurrent) setRouteLoading(false);
      });

    return () => { isCurrent = false; };
  }, [hasDestinationCoordinates, inputsMatchCoordinates, originCoords, destCoords, profile, idParam, destParam]);

  const route = useMemo<RoutePreviewData>(() => {
    if (!backendRoute) {
      return {
        ...MOCK_ROUTE_DATA,
        origin: originText,
        destination: destinationText,
        header: {
          ...MOCK_ROUTE_DATA.header,
          verifiedAgo: routeLoading ? "Requesting route from backend…" : routeError ? "Demo preview · backend unavailable" : "Demo preview · coordinates required",
        },
      };
    }

    const groupedSurfaces = new Map<string, number>();
    for (const segment of backendRoute.segments) {
      groupedSurfaces.set(segment.surfaceType, (groupedSurfaces.get(segment.surfaceType) || 0) + segment.distanceMeters);
    }
    const segmentDistance = [...groupedSurfaces.values()].reduce((sum, distance) => sum + distance, 0);
    const surfaceComposition = [...groupedSurfaces.entries()].map(([type, distance]) => ({
      type: type.replaceAll("_", " "),
      percentage: segmentDistance > 0 ? Math.round(distance / segmentDistance * 100) : 0,
      color: "bg-gray-600",
      icon: <Mountain size={12} />,
    }));

    return {
      ...MOCK_ROUTE_DATA,
      origin: originText,
      destination: destinationText,
      header: {
        title: backendRoute.isRecommended ? "Backend Recommended Route" : "Backend Route",
        verifiedAgo: "Backend response · demo routing service",
      },
      stats: {
        totalTime: `${Math.round(backendRoute.totalDurationSeconds / 60)} min total`,
        distance: `${(backendRoute.totalDistanceMeters / 1000).toFixed(1)} km distance`,
        maxIncline: `${backendRoute.maxInclinePercent}% max incline`,
      },
      surfaceComposition,
      hazards: [],
      navigationTargetId: backendEntrance?.id || "",
    };
  }, [backendRoute, backendEntrance, originText, destinationText, routeLoading, routeError]);

  const navTargetId = backendEntrance?.id || (idParam && backendEntrance?.id === idParam ? idParam : null);
  const navigationQuery = new URLSearchParams({
    dest: destinationText,
    origin: originText,
    mobility_type: profile.mobilityType,
    max_incline_percent: String(profile.maxInclinePercent),
    require_step_free: String(profile.requireStepFree),
    require_tactile_paving: String(profile.requireTactilePaving),
    require_well_lit: String(profile.requireWellLit),
    avoid_broken_surfaces: String(profile.avoidBrokenSurfaces),
  });
  const routeOrigin = backendRoute?.coordinates[0];
  if (routeOrigin) {
    navigationQuery.set("origin_lng", String(routeOrigin[0]));
    navigationQuery.set("origin_lat", String(routeOrigin[1]));
  }

  const handleSwap = () => {
    const temp = originText;
    setOriginText(destinationText);
    setDestinationText(temp);
  };

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
      <PlannerMapOverlay
        originCoords={originCoords}
        destCoords={resolvedDestCoords || destCoords}
        routeCoordinates={backendRoute?.coordinates}
        destinationLabel={backendEntrance?.entranceName || backendEntrance?.buildingName || "Demo destination"}
      />

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
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-500/20 shrink-0">
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {originText.split("(")[0].trim()} → {destinationText.split("(")[0].trim()}
              </p>
          <p className="text-xs font-medium text-gray-500">{route.header.verifiedAgo}</p>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0" aria-label="Close preview">
            <span className="sr-only">Close</span>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {(routeError || routeLoading) && (
          <div role={routeError ? "alert" : "status"} className={`mx-3 mt-3 rounded-lg px-3 py-2 text-xs ${routeError ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-blue-50 text-blue-800 border border-blue-100"}`}>
            {routeError || "Loading route from the PathClear backend…"}
          </div>
        )}

        {/* Scrollable Content - Compact */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Origin / Destination - Fully Editable */}
          <div className="space-y-2 p-2 rounded-xl bg-gray-50/70 border border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <MapPin size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <label htmlFor="origin-location-input" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    From (Origin)
                  </label>
                  <span className="text-[10px] text-blue-600 font-bold">Editable</span>
                </div>
                <input
                  id="origin-location-input"
                  type="text"
                  value={originText}
                  onChange={(e) => setOriginText(e.target.value)}
                  placeholder="Enter starting location..."
                  className="w-full text-xs sm:text-sm font-bold text-gray-900 bg-white hover:bg-white focus:bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all truncate"
                />
              </div>
            </div>

            <div className="relative pl-6 flex items-center justify-between my-0.5">
              <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200" />
              <button
                type="button"
                onClick={handleSwap}
                title="Swap origin and destination"
                aria-label="Swap origin and destination locations"
                className="ml-auto z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 hover:border-pathclear-secondary text-[10px] font-bold text-gray-600 hover:text-pathclear-primary shadow-2xs hover:shadow-xs transition-all"
              >
                <ArrowUpDown size={11} />
                <span>Swap</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <CheckCircle2 size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <label htmlFor="dest-location-input" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    To (Destination)
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">Editable</span>
                </div>
                <input
                  id="dest-location-input"
                  type="text"
                  value={destinationText}
                  onChange={(e) => setDestinationText(e.target.value)}
                  placeholder="Enter destination location..."
                  className="w-full text-xs sm:text-sm font-bold text-gray-900 bg-white hover:bg-white focus:bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all truncate"
                />
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
                <h4 className="text-sm font-bold text-gray-900">{backendEntrance ? "Backend Entrance Details" : "Entrance Details Unavailable"}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {backendEntrance
                    ? `${backendEntrance.entranceName || backendEntrance.buildingName}. ${backendEntrance.stepCount === undefined ? "Step count not provided." : `${backendEntrance.stepCount} step(s).`} ${backendEntrance.rampAvailable === undefined ? "Ramp status not provided." : backendEntrance.rampAvailable ? `Ramp present${backendEntrance.rampSlopePercent === undefined ? "; slope not provided." : `; ${backendEntrance.rampSlopePercent}% slope.`}` : "No ramp reported."}`
                    : "The backend did not return a matching entrance record. No access guarantee is available."}
                </p>
              </div>
            </div>
          </div>

          {/* Hazard Alerts */}
          <HazardAlertStrip hazards={route.hazards} />
        </div>

        {/* Card Footer: Primary Action + Secondary Actions */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-2xl space-y-3">
          {navTargetId ? (
            <Link
              href={`/navigation/${encodeURIComponent(navTargetId)}?${navigationQuery.toString()}`}
              className="w-full flex items-center justify-center gap-2 bg-pathclear-primary hover:bg-pathclear-secondary text-white px-5 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-pathclear-primary/20 transition-all focus-visible:outline-pathclear-primary"
            >
              <CheckCircle2 size={20} strokeWidth={2.5} />
              Start Step-Free Navigation
            </Link>
          ) : (
            <button type="button" disabled className="w-full flex items-center justify-center gap-2 bg-gray-400 text-white px-5 py-3.5 rounded-xl font-bold text-base cursor-not-allowed">
              <CheckCircle2 size={20} strokeWidth={2.5} />
              No matching backend entrance
            </button>
          )}

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

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-pathclear-bg flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <PlannerPageContent />
    </Suspense>
  );
}
