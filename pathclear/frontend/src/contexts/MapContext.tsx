"use client";

import React, { createContext, useContext, useRef, useState, useCallback } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { MAP_3D_PITCH, MAP_3D_BEARING, MAP_2D_PITCH, MAP_2D_BEARING } from "@/lib/map-3d-config";

interface MapContextValue {
  mapRef: React.RefObject<MapLibreMap | null>;
  registerMap: (map: MapLibreMap) => void;
  unregisterMap: () => void;
  isMapReady: boolean;
  is3DMode: boolean;
  toggle3DMode: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  recenter: (coords?: [number, number]) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<MapLibreMap | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);

  const registerMap = useCallback((map: MapLibreMap) => {
    mapRef.current = map;
    setIsMapReady(true);
  }, []);

  const unregisterMap = useCallback(() => {
    mapRef.current = null;
    setIsMapReady(false);
  }, []);

  const toggle3DMode = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    setIs3DMode((prev) => {
      const next = !prev;
      if (next) {
        map.easeTo({
          pitch: MAP_3D_PITCH,
          bearing: MAP_3D_BEARING,
          duration: 1000,
        });
      } else {
        map.easeTo({
          pitch: MAP_2D_PITCH,
          bearing: MAP_2D_BEARING,
          duration: 1000,
        });
      }
      return next;
    });
  }, []);

  const zoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 300 });
  }, []);

  const zoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 300 });
  }, []);

  const recenter = useCallback((coords?: [number, number]) => {
    const map = mapRef.current;
    if (!map) return;
    if (coords) {
      map.flyTo({ center: coords, zoom: 15.5, pitch: is3DMode ? MAP_3D_PITCH : MAP_2D_PITCH, duration: 1200 });
    } else {
      map.flyTo({ zoom: 15.5, pitch: is3DMode ? MAP_3D_PITCH : MAP_2D_PITCH, duration: 1200 });
    }
  }, [is3DMode]);

  return (
    <MapContext.Provider
      value={{
        mapRef,
        registerMap,
        unregisterMap,
        isMapReady,
        is3DMode,
        toggle3DMode,
        zoomIn,
        zoomOut,
        recenter,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
}

export type { MapLibreMap };