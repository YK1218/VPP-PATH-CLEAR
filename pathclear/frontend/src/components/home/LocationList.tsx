"use client";

import React, { useState, useEffect } from "react";
import LocationCard, { LocationCardProps } from "./LocationCard";
import { Activity, Loader2, MapPin } from "lucide-react";
import { fetchEntrances } from "@/lib/api";
import { Entrance } from "@/types";

export default function LocationList() {
  const [entrances, setEntrances] = useState<Entrance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEntrances() {
      try {
        setLoading(true);
        const data = await fetchEntrances();
        setEntrances(data);
      } catch (err) {
        setError("Failed to load accessible locations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEntrances();
  }, []);

  const formatDistance = (lat: number, lng: number): string => {
    // Approximate distance from Mumbai center (BKC)
    const mumbaiCenter = { lat: 19.066, lng: 72.866 };
    const dLat = (lat - mumbaiCenter.lat) * 111.32; // km per degree lat
    const dLng = (lng - mumbaiCenter.lng) * 111.32 * Math.cos(mumbaiCenter.lat * Math.PI / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return `${dist.toFixed(1)} km away`;
  };

  const formatTime = (distanceKm: number): string => {
    // Rough estimate: 1.1 m/s wheelchair pace = ~4 km/h
    const hours = distanceKm / 4;
    const mins = Math.round(hours * 60);
    return mins < 60 ? `${mins} min` : `${Math.floor(hours)}h ${mins % 60}min`;
  };

  if (loading) {
    return (
      <section className="w-full max-w-4xl mx-auto px-4 pb-16 relative z-10">
        <div className="flex flex-col gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4 border-l border-gray-100 pl-4 md:pl-6">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-4xl mx-auto px-4 pb-16 relative z-10">
        <div className="text-center py-12 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">{error}</p>
        </div>
      </section>
    );
  }

  const locations: LocationCardProps[] = entrances.map((entrance, index) => {
    const dist = formatDistance(entrance.latitude, entrance.longitude);
    const time = formatTime(parseFloat(dist));
    const distanceKm = parseFloat(dist);
    
    return {
      id: entrance.id,
      type: "building",
      title: entrance.buildingName,
      subLocation: entrance.entranceName,
      subtitle: `Lat: ${entrance.latitude.toFixed(4)}, Lng: ${entrance.longitude.toFixed(4)}`,
      badges: [
        { text: entrance.stepCount === 0 ? "Step-free entrance" : `${entrance.stepCount} step(s)`, isVerified: entrance.stepCount === 0 },
        { text: entrance.rampAvailable ? `Ramp ${entrance.rampSlopePercent || 3.5}%` : "No ramp", isVerified: entrance.rampAvailable },
        { text: `${entrance.confidenceScore * 100}% confidence`, isVerified: entrance.confidenceScore > 0.8 },
      ],
      time,
      distance: dist,
    };
  });

  return (
    <section className="w-full max-w-4xl mx-auto px-4 pb-16 relative z-10">
      
      {/* List Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase">
          Verified Accessible Entrances
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
          <span className="w-2 h-2 rounded-full bg-pathclear-secondary animate-pulse"></span>
          Live Data
        </div>
      </div>

      {/* List of Cards */}
      <div className="flex flex-col gap-3 mb-6">
        {locations.map((loc, i) => (
          <LocationCard key={loc.id} {...loc} />
        ))}
      </div>

      {/* Telemetry Alert Box */}
      <div className="w-full bg-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-gray-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="mt-0.5 sm:mt-0 text-pathclear-primary">
            <Activity size={20} />
          </div>
          <p className="text-sm font-medium text-gray-700">
            <span className="font-bold text-gray-900">Live Data: </span>
            {entrances.length} entrances loaded from backend API.
          </p>
        </div>
        <button className="text-sm font-bold text-pathclear-primary hover:text-pathclear-secondary transition-colors whitespace-nowrap self-start sm:self-auto" onClick={() => window.location.reload()}>
          Refresh
        </button>
      </div>

    </section>
  );
}
