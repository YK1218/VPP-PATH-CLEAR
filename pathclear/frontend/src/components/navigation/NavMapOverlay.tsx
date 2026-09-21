"use client";

import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function NavMapOverlay() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

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
      // Mock Route Coordinates (representing a short path in BKC)
      const routeCoordinates = [
        [72.864, 19.064],
        [72.865, 19.065],
        [72.8655, 19.066],
        [72.866, 19.067],
        [72.868, 19.068],
      ];

      // Add route source
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
        },
      });

      // Add route shadow layer (for border effect)
      map.addLayer({
        id: "route-shadow",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#034f38",
          "line-width": 16,
          "line-opacity": 0.2,
        },
      });

      // Add main route layer
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#0e9f6e",
          "line-width": 14,
        },
      });

      // Add inner dashed line for walking path visual
      map.addLayer({
        id: "route-dash",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ffffff",
          "line-width": 4,
          "line-dasharray": [1, 2],
        },
      });

      // ---- Start Point Marker ----
      const startEl = document.createElement("div");
      startEl.className = "w-6 h-6 bg-pathclear-primary border-4 border-white rounded-full shadow-md";
      new maplibregl.Marker({ element: startEl })
        .setLngLat([72.864, 19.064])
        .addTo(map);

      // ---- Current Position / Checkpoint Marker ----
      const currentEl = document.createElement("div");
      currentEl.className = "relative w-8 h-8 bg-pathclear-primary border-[3px] border-white rounded-full shadow-lg flex items-center justify-center text-white";
      currentEl.innerHTML = `
        <div class="absolute inset-0 bg-pathclear-primary rounded-full animate-ping opacity-50"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="relative z-10"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
      `;

      new maplibregl.Marker({ element: currentEl })
        .setLngLat([72.8655, 19.066])
        .addTo(map);

      // ---- Hazard Point Marker ----
      const hazardEl = document.createElement("div");
      hazardEl.className = "w-9 h-9 bg-red-100 border-2 border-white rounded-full shadow-md flex items-center justify-center text-red-600 cursor-pointer hover:scale-110 transition-transform";
      hazardEl.innerHTML = `
        <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </div>
      `;

      new maplibregl.Marker({ element: hazardEl })
        .setLngLat([72.8665, 19.0673])
        .addTo(map);

      // ---- Destination Marker ----
      const destEl = document.createElement("div");
      destEl.className = "relative w-11 h-11 bg-gray-900 border-[3px] border-white rounded-full shadow-2xl flex items-center justify-center text-white -top-3";
      destEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
        <div class="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-gray-900"></div>
      `;

      new maplibregl.Marker({ element: destEl })
        .setLngLat([72.868, 19.068])
        .addTo(map);

    });

    return () => {
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
