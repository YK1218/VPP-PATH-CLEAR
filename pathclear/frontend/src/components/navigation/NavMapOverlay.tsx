"use client";

import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { OSM_RASTER_STYLE, OPENFREEMAP_LIBERTY_STYLE, DEFAULT_MAP_ZOOM, DEFAULT_MAP_PITCH, DEFAULT_MAP_BEARING } from "@/lib/map-config";
import { setup3DMapLayers, MAP_3D_PITCH, MAP_3D_BEARING } from "@/lib/map-3d-config";
import { useMap } from "@/contexts/MapContext";
import { Route, Entrance, Hazard } from "@/types";

interface NavMapOverlayProps {
  route: Route;
  entrance: Entrance;
  hazards: Hazard[];
}

type LngLat = [number, number];

const createLineFeature = (coordinates: LngLat[]) => ({
  type: "Feature" as const,
  properties: {},
  geometry: {
    type: "LineString" as const,
    coordinates,
  },
});

const squaredDistance = (a: LngLat, b: LngLat) =>
  (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

const interpolateCoordinate = (from: LngLat, to: LngLat, progress: number): LngLat => [
  from[0] + (to[0] - from[0]) * progress,
  from[1] + (to[1] - from[1]) * progress,
];

/**
 * Keep the hazard path on the supplied route geometry for as long as possible,
 * then connect its nearest route vertex to the exact hazard coordinate.
 */
const createHazardPath = (routeCoordinates: LngLat[], hazard: LngLat): LngLat[] => {
  let nearestIndex = 0;

  routeCoordinates.forEach((coordinate, index) => {
    if (
      squaredDistance(coordinate, hazard) <
      squaredDistance(routeCoordinates[nearestIndex], hazard)
    ) {
      nearestIndex = index;
    }
  });

  const coordinates = routeCoordinates.slice(0, nearestIndex + 1);
  const lastCoordinate = coordinates[coordinates.length - 1];

  if (squaredDistance(lastCoordinate, hazard) > Number.EPSILON) {
    coordinates.push(hazard);
  }

  // A GeoJSON LineString must contain at least two positions.
  return coordinates.length === 1 ? [coordinates[0], hazard] : coordinates;
};

const addRouteOverlay = (
  map: maplibregl.Map,
  safeCoordinates: LngLat[],
  hazardCoordinates?: LngLat[],
) => {
  const svgNamespace = "http://www.w3.org/2000/svg";
  const overlay = document.createElementNS(svgNamespace, "svg");
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = [
    "position:absolute",
    "inset:0",
    "width:100%",
    "height:100%",
    "overflow:hidden",
    "pointer-events:none",
    "z-index:2",
  ].join(";");

  const createPath = (stroke: string, width: number, opacity = 1) => {
    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", stroke);
    path.setAttribute("stroke-width", String(width));
    path.setAttribute("stroke-opacity", String(opacity));
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    overlay.appendChild(path);
    return path;
  };

  const safeCasing = createPath("#075985", 7, 0.9);
  const safeLine = createPath("#0ea5e9", 4);
  const hazardCasing = hazardCoordinates
    ? createPath("#075985", 7, 0.9)
    : undefined;
  const hazardLine = hazardCoordinates
    ? createPath("#0ea5e9", 4)
    : undefined;

  const toPathData = (coordinates: LngLat[]) =>
    coordinates
      .map((coordinate, index) => {
        const point = map.project(coordinate);
        return `${index === 0 ? "M" : "L"}${point.x},${point.y}`;
      })
      .join(" ");

  const updatePaths = () => {
    const safePathData = toPathData(safeCoordinates);
    safeCasing.setAttribute("d", safePathData);
    safeLine.setAttribute("d", safePathData);

    if (hazardCoordinates && hazardCasing && hazardLine) {
      const hazardPathData = toPathData(hazardCoordinates);
      hazardCasing.setAttribute("d", hazardPathData);
      hazardLine.setAttribute("d", hazardPathData);
    }
  };

  map.getCanvasContainer().appendChild(overlay);
  map.on("move", updatePaths);
  map.on("resize", updatePaths);
  updatePaths();

  return () => {
    map.off("move", updatePaths);
    map.off("resize", updatePaths);
    overlay.remove();
  };
};

export default function NavMapOverlay({ route, entrance, hazards }: NavMapOverlayProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const { registerMap, unregisterMap } = useMap();

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    let removeRouteOverlay: (() => void) | undefined;

    // Initialize MapLibre map with reliable OpenStreetMap raster tiles
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: OSM_RASTER_STYLE,
      center: [entrance.longitude, entrance.latitude],
      zoom: DEFAULT_MAP_ZOOM,
      maxZoom: 20,
      pitch: DEFAULT_MAP_PITCH,
      bearing: DEFAULT_MAP_BEARING,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", () => {
      registerMap(map);
      setup3DMapLayers(map);
      const destinationCoordinate: LngLat = [entrance.longitude, entrance.latitude];
      const routeCoordinates: LngLat[] = route.coordinates.length > 0
        ? route.coordinates
        : [destinationCoordinate];
      const startCoordinate = routeCoordinates[0];
      const safeRouteCoordinates = [...routeCoordinates];
      const routeEnd = safeRouteCoordinates[safeRouteCoordinates.length - 1];

      if (squaredDistance(routeEnd, destinationCoordinate) > Number.EPSILON) {
        safeRouteCoordinates.push(destinationCoordinate);
      }

      if (safeRouteCoordinates.length === 1) {
        safeRouteCoordinates.push(destinationCoordinate);
      }

      // Path B: active/safe route from the green start marker to the black flag.
      map.addSource("safe-route", {
        type: "geojson",
        data: createLineFeature(safeRouteCoordinates),
      });

      map.addLayer({
        id: "safe-route-casing",
        type: "line",
        source: "safe-route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#075985",
          "line-width": 7,
          "line-opacity": 0.9,
        },
      });

      map.addLayer({
        id: "safe-route-line",
        type: "line",
        source: "safe-route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#0ea5e9",
          "line-width": 4,
          "line-opacity": 1,
        },
      });

      const primaryHazard = hazards[0];
      let hazardRouteCoordinates: LngLat[] | undefined;

      if (primaryHazard) {
        const hazardCoordinate: LngLat = [
          primaryHazard.longitude,
          primaryHazard.latitude,
        ];
        hazardRouteCoordinates = createHazardPath(
          safeRouteCoordinates,
          hazardCoordinate,
        );

        // Path A: highlighted branch from the green start marker to the red hazard.
        map.addSource("hazard-route", {
          type: "geojson",
          data: createLineFeature(hazardRouteCoordinates),
        });

        map.addLayer({
          id: "hazard-route-casing",
          type: "line",
          source: "hazard-route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#075985",
            "line-width": 7,
            "line-opacity": 0.9,
          },
        });

        map.addLayer({
          id: "hazard-route-line",
          type: "line",
          source: "hazard-route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#0ea5e9",
            "line-width": 4,
            "line-opacity": 1,
          },
        });
      }

      // ---- Green Start / User Position Marker ----
      if (routeCoordinates.length > 0) {
        const currentEl = document.createElement("div");
        currentEl.className = "relative w-8 h-8 bg-pathclear-primary border-[3px] border-white rounded-full shadow-lg flex items-center justify-center text-white";
        currentEl.innerHTML = `
          <div class="absolute inset-0 bg-pathclear-primary rounded-full animate-ping opacity-50"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="relative z-10"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
        `;

        new maplibregl.Marker({ element: currentEl })
          .setLngLat(startCoordinate)
          .addTo(map);

        if (routeCoordinates.length > 1) {
          const positionEl = document.createElement("div");
          positionEl.className = "w-5 h-5 bg-white border-[3px] border-pathclear-primary rounded-full shadow-lg";
          const positionMarker = new maplibregl.Marker({ element: positionEl })
            .setLngLat(startCoordinate)
            .addTo(map);
          let segmentIndex = 0;
          let segmentProgress = 0;
          let previousFrame = performance.now();

          const animatePosition = (timestamp: number) => {
            const elapsed = timestamp - previousFrame;
            previousFrame = timestamp;
            segmentProgress += elapsed / 4000;

            if (segmentProgress >= 1) {
              segmentProgress = 0;
              segmentIndex = (segmentIndex + 1) % (routeCoordinates.length - 1);
            }

            positionMarker.setLngLat(
              interpolateCoordinate(
                routeCoordinates[segmentIndex],
                routeCoordinates[segmentIndex + 1],
                segmentProgress,
              ),
            );
            animationIdRef.current = requestAnimationFrame(animatePosition);
          };

          animationIdRef.current = requestAnimationFrame(animatePosition);
        }
      }

      // ---- 3D Primary Hazard Marker (Caution Cone & Alert Pulse) ----
      if (primaryHazard) {
        const hazardEl = document.createElement("div");
        hazardEl.className = "relative group cursor-pointer flex flex-col items-center -top-3";
        hazardEl.innerHTML = `
          <div class="mb-1 px-2.5 py-0.5 rounded-lg bg-red-950/90 text-red-200 border border-red-500/60 shadow-xl flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span>${primaryHazard.description || "Hazard Ahead"}</span>
          </div>
          <div class="relative w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-xl shadow-red-950/50 flex items-center justify-center text-white hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        `;

        new maplibregl.Marker({ element: hazardEl })
          .setLngLat([primaryHazard.longitude, primaryHazard.latitude])
          .addTo(map);
      }

      // ---- 3D Destination Entrance Portal Beacon Marker ----
      const destEl = document.createElement("div");
      destEl.className = "relative group cursor-pointer flex flex-col items-center -top-6";
      destEl.innerHTML = `
        <div class="mb-1 px-3 py-1.5 rounded-xl bg-slate-950/90 text-white border border-emerald-400/50 shadow-2xl flex items-center gap-2 whitespace-nowrap backdrop-blur-md">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <div class="flex flex-col text-left">
            <span class="text-[11px] font-extrabold text-white">${entrance.entranceName || entrance.buildingName || "Gate 2 Accessible Entrance"}</span>
            <span class="text-[9px] font-mono font-bold text-emerald-300">0cm Threshold • 2.1m Door Clearance</span>
          </div>
        </div>

        <div class="relative w-12 h-12 flex items-center justify-center">
          <div class="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping scale-150"></div>
          <div class="absolute inset-1 rounded-full bg-emerald-500/30 animate-pulse"></div>
          <div class="relative w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 border-2 border-white shadow-xl shadow-emerald-950/50 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 4h3a2 2 0 0 1 2 2v14"/>
              <path d="M2 20h20"/>
              <path d="M13 20V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-600"></div>
        </div>
      `;

      new maplibregl.Marker({ element: destEl })
        .setLngLat(destinationCoordinate)
        .addTo(map);

      const visibleCoordinates = [
        ...safeRouteCoordinates,
        ...(primaryHazard
          ? [[primaryHazard.longitude, primaryHazard.latitude] as LngLat]
          : []),
      ];
      const bounds = visibleCoordinates.reduce(
        (routeBounds, coordinate) => routeBounds.extend(coordinate),
        new maplibregl.LngLatBounds(visibleCoordinates[0], visibleCoordinates[0]),
      );

      map.fitBounds(bounds, {
        padding: 80,
        maxZoom: 17,
        duration: 0,
      });

      removeRouteOverlay = addRouteOverlay(
        map,
        safeRouteCoordinates,
        hazardRouteCoordinates,
      );

    });

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      removeRouteOverlay?.();
      unregisterMap();
      map.remove();
      mapRef.current = null;
    };
  }, [route, entrance, hazards, registerMap, unregisterMap]);

  return (
    <div className="absolute inset-0 bg-[#eef1f6] overflow-hidden z-0">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
