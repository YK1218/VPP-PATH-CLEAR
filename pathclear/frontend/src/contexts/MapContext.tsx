"use client";

import React, { createContext, useContext, useRef, useEffect, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

interface MapContextValue {
  mapRef: React.RefObject<MapLibreMap | null>;
  registerMap: (map: MapLibreMap) => void;
  unregisterMap: () => void;
  isMapReady: boolean;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<MapLibreMap | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const registerMap = (map: MapLibreMap) => {
    mapRef.current = map;
    setIsMapReady(true);
  };

  const unregisterMap = () => {
    mapRef.current = null;
    setIsMapReady(false);
  };

  return (
    <MapContext.Provider value={{ mapRef, registerMap, unregisterMap, isMapReady }}>
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