"use client";

import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    let removeRouteOverlay: (() => void) | undefined;

    // Initialize MapLibre map with reliable OpenStreetMap raster tiles
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
      center: [entrance.longitude, entrance.latitude],
      zoom: 16.5,
      maxZoom: 20,
      pitch: 45,
      bearing: -15,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", () => {
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
      }

      // ---- Primary Red Hazard Marker ----
      if (primaryHazard) {
        const hazardEl = document.createElement("div");
        hazardEl.className = "w-9 h-9 bg-red-100 border-2 border-white rounded-full shadow-md flex items-center justify-center text-red-600 cursor-pointer hover:scale-110 transition-transform";
        hazardEl.innerHTML = `
          <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </div>
        `;

        new maplibregl.Marker({ element: hazardEl })
          .setLngLat([primaryHazard.longitude, primaryHazard.latitude])
          .addTo(map);
      }

      // ---- Destination Marker (Entrance) ----
      const destEl = document.createElement("div");
      destEl.className = "relative w-11 h-11 bg-gray-900 border-[3px] border-white rounded-full shadow-2xl flex items-center justify-center text-white -top-3";
      destEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
        <div class="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-gray-900"></div>
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
      removeRouteOverlay?.();
      map.remove();
      mapRef.current = null;
    };
  }, [route, entrance, hazards]);

  return (
    <div className="absolute inset-0 bg-[#eef1f6] overflow-hidden z-0">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
