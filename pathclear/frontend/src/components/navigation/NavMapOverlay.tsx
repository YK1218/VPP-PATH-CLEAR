"use client";

import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Type for route coordinates
type RouteCoordinate = [number, number];

interface NavMapOverlayProps {
  routeCoordinates?: RouteCoordinate[];
  currentPosition?: RouteCoordinate;
}

export default function NavMapOverlay({ 
  routeCoordinates: propsRouteCoordinates, 
  currentPosition: propsCurrentPosition 
}: NavMapOverlayProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    let animationActive = true;

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
            maxzoom: 19, // Tells MapLibre to scale up level 19 tiles if zoomed further
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 22, // allow layer to render at higher zooms
          },
        ],
      },
      center: [72.866, 19.066], // Mumbai Center (approx BKC)
      zoom: 16.5,
      maxZoom: 20, // Prevents infinite zooming into a blurry mess
      pitch: 45, // Angled for navigation look
      bearing: -15,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", () => {
      // Use provided coordinates or fallback to default BKC route
      const routeCoordinates = propsRouteCoordinates ?? [
        [72.864, 19.064],
        [72.865, 19.065],
        [72.8655, 19.066],
        [72.866, 19.067],
        [72.868, 19.068],
      ];

      const currentPosition = propsCurrentPosition ?? [72.8655, 19.066];

      // Already-traveled path (start → current position)
      // If we have enough coordinates, split at current position; otherwise use first 3 points
      const completedCoords: [number, number][] = routeCoordinates.length >= 3
        ? routeCoordinates.slice(0, 3)
        : routeCoordinates;

      // Remaining path (current position → destination)
      const remainingCoords: [number, number][] = routeCoordinates.length >= 3
        ? routeCoordinates.slice(2)
        : routeCoordinates.slice(1);

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

      // ---- Start Point Marker ----
      const startEl = document.createElement("div");
      startEl.className = "w-6 h-6 bg-pathclear-primary border-4 border-white rounded-full shadow-md";
      new maplibregl.Marker({ element: startEl })
        .setLngLat(routeCoordinates[0])
        .addTo(map);

      // ---- Current Position / Checkpoint Marker ----
      const currentEl = document.createElement("div");
      currentEl.className = "relative w-8 h-8 bg-pathclear-primary border-[3px] border-white rounded-full shadow-lg flex items-center justify-center text-white";
      currentEl.innerHTML = `
        <div class="absolute inset-0 bg-pathclear-primary rounded-full animate-ping opacity-50"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="relative z-10"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
      `;

      new maplibregl.Marker({ element: currentEl })
        .setLngLat(currentPosition)
        .addTo(map);

      // ---- Hazard Point Marker ----
      const hazardEl = document.createElement("div");
      hazardEl.className = "w-9 h-9 bg-red-100 border-2 border-white rounded-full shadow-md flex items-center justify-center text-red-600 cursor-pointer hover:scale-110 transition-transform";
      hazardEl.innerHTML = `
        <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </div>
      `;

      // Use last coordinate as hazard position (or a point near the end)
      const hazardPosition = routeCoordinates[Math.min(3, routeCoordinates.length - 1)];
      new maplibregl.Marker({ element: hazardEl })
        .setLngLat(hazardPosition)
        .addTo(map);

      // ---- Destination Marker ----
      const destEl = document.createElement("div");
      destEl.className = "relative w-11 h-11 bg-gray-900 border-[3px] border-white rounded-full shadow-2xl flex items-center justify-center text-white -top-3";
      destEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
        <div class="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-gray-900"></div>
      `;

      new maplibregl.Marker({ element: destEl })
        .setLngLat(routeCoordinates[routeCoordinates.length - 1])
        .addTo(map);

      // Fit bounds to show full route
      const bounds = new maplibregl.LngLatBounds();
      (routeCoordinates as [number, number][]).forEach((coord) => bounds.extend(coord));
      map.fitBounds(bounds, { padding: { top: 80, bottom: 80, left: 50, right: 50 }, maxZoom: 16.5 });

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
