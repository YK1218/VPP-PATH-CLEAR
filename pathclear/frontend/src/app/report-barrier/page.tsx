"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { OSM_RASTER_STYLE, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/map-config";
import { reportHazard } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  MapPin, 
  ChevronDown, 
  Shield, 
  AlertTriangle, 
  Camera, 
  Upload, 
  Search, 
  Crosshair, 
  X, 
  Flag,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  FileText,
  Loader2
} from "lucide-react";

type BarrierType = "broken-elevator" | "steep-incline" | "blocked-sidewalk" | "missing-ramp" | "continuous-steps" | "other";
type SeverityType = "critical" | "caution";

interface BarrierTypeOption {
  value: BarrierType;
  label: string;
  icon: React.ReactNode;
}

const BARRIER_TYPES: BarrierTypeOption[] = [
  { value: "broken-elevator", label: "Broken Elevator", icon: <AlertTriangle size={16} strokeWidth={2.5} /> },
  { value: "steep-incline", label: "Steep Incline", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-2a2 2 0 0 0-2-2V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2h2"></path></svg> },
  { value: "blocked-sidewalk", label: "Blocked Sidewalk", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg> },
  { value: "missing-ramp", label: "Missing Ramp", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-2a2 2 0 0 0-2-2V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2h2"></path><line x1="3" y1="21" x2="21" y2="21"/></svg> },
  { value: "continuous-steps", label: "Continuous Steps", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> },
  { value: "other", label: "Other", icon: <HelpCircle size={16} strokeWidth={2.5} /> },
];

export default function ReportBarrierPage() {
  const router = useRouter();
  const [selectedBarrierType, setSelectedBarrierType] = useState<BarrierType>("broken-elevator");
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityType>("critical");
  const [photos, setPhotos] = useState<File[]>([]);
  const [observations, setObservations] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number]>(DEFAULT_MAP_CENTER);
  const [locationName, setLocationName] = useState("Bandra Kurla Complex (BKC), G Block, Mumbai");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_RASTER_STYLE,
      center: coordinates,
      zoom: DEFAULT_MAP_ZOOM,
      maxZoom: 19,
      attributionControl: false,
    });
    mapRef.current = map;

    const el = document.createElement("div");
    el.className = "cursor-grab";
    el.innerHTML = `
      <div style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
        <div style="background-color: #dc2626; color: white; border-radius: 9999px; border: 2.5px solid white; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 16px;">
          ⚠️
        </div>
      </div>
    `;

    const marker = new maplibregl.Marker({ element: el, draggable: true })
      .setLngLat(coordinates)
      .addTo(map);
    markerRef.current = marker;

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      setCoordinates([lngLat.lng, lngLat.lat]);
      setLocationName(`Reported Pin (${lngLat.lat.toFixed(4)}° N, ${lngLat.lng.toFixed(4)}° E)`);
    });

    map.on("click", (e: any) => {
      marker.setLngLat(e.lngLat);
      setCoordinates([e.lngLat.lng, e.lngLat.lat]);
      setLocationName(`Selected Pin (${e.lngLat.lat.toFixed(4)}° N, ${e.lngLat.lng.toFixed(4)}° E)`);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleRecenterGPS = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          setCoordinates(newCoords);
          if (mapRef.current && markerRef.current) {
            mapRef.current.flyTo({ center: newCoords, zoom: 16 });
            markerRef.current.setLngLat(newCoords);
          }
          setLocationName(`GPS Position (${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E)`);
        },
        () => {
          if (mapRef.current && markerRef.current) {
            mapRef.current.flyTo({ center: DEFAULT_MAP_CENTER, zoom: DEFAULT_MAP_ZOOM });
            markerRef.current.setLngLat(DEFAULT_MAP_CENTER);
          }
        }
      );
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [submitError, setSubmitError] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.type.startsWith("image/") && f.size <= 15 * 1024 * 1024);
    setPhotos(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarrierType || !selectedSeverity) return;
    
    setIsSubmitting(true);
    setSubmitError(false);
    setToastMessage("Submitting report...");
    setShowToast(true);
    try {
      await reportHazard({
        type: selectedBarrierType,
        latitude: coordinates[1],
        longitude: coordinates[0],
        severity: selectedSeverity,
        description: observations,
      });
      setToastMessage(photos.length > 0
        ? "Barrier report accepted by the backend. Selected photos were not uploaded because this endpoint does not accept files."
        : "Barrier report accepted by the backend.");
      setShowToast(true);
      setTimeout(() => {
        setSelectedBarrierType("broken-elevator");
        setSelectedSeverity("critical");
        setObservations("");
        setShowToast(false);
      }, 4000);
    } catch (error) {
      setSubmitError(true);
      setToastMessage(error instanceof Error ? error.message : "Barrier report could not be sent to the backend.");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f2faf5] to-[#e8f5ed] py-6 px-4">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl shadow-xl border border-emerald-900/10 p-8 sm:p-10">
          {/* Top Badges & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE MOBILITY AUDIT
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                <Shield size={14} className="text-emerald-600" />
                Verified Citizen Network
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Report an Accessibility Barrier
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl font-medium leading-relaxed">
              Crowdsourced reports verify obstacles for step-free mobility across Mumbai. Incidents are flagged instantly in live step-free routing telemetry.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section 1: Barrier Type Carousel */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">BARRIER TYPE</h2>
                <span className="text-xs font-medium text-slate-500">Select one</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {BARRIER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedBarrierType(type.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-emerald-500 ${
                      selectedBarrierType === type.value
                        ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/30"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    <span className="flex-shrink-0">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Section 2: Interactive Location Map - Wide Panoramic */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Location</h2>
                <span className="text-xs font-medium text-slate-500">Tap map to set location</span>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                {/* Real MapLibre Map Container */}
                <div className="relative h-72 sm:h-80 w-full">
                  <div ref={mapContainerRef} className="w-full h-full" />

                  {/* Top-right: Recenter GPS button */}
                  <button
                    type="button"
                    onClick={handleRecenterGPS}
                    className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-700 px-3 py-2 rounded-xl shadow-xl border border-slate-200 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors focus-visible:outline-emerald-500 z-10"
                  >
                    <Crosshair size={16} strokeWidth={2.5} className="text-emerald-600" />
                    <span>Recenter GPS</span>
                  </button>

                  {/* Bottom coordinate info bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/95 via-slate-900/80 to-transparent py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 z-10 pointer-events-none">
                    <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-medium">
                      <MapPin size={16} className="text-emerald-400 shrink-0" />
                      <span className="font-mono font-bold">{coordinates[1].toFixed(4)}° N, {coordinates[0].toFixed(4)}° E</span>
                      <span className="text-slate-400 hidden sm:inline">•</span>
                      <span className="truncate max-w-xs">{locationName}</span>
                    </div>
                    <span className="text-xs text-emerald-300 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                      Drag pin or tap map to adjust
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Two-Column Grid (Upload + Severity) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Photo Upload */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Add Photo(s)</h2>
                  <span className="text-xs font-medium text-slate-500">Up to 5 photos</span>
                </div>
                
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="photo-upload"
                    disabled={photos.length >= 5}
                  />
                  
                  <label
                    htmlFor="photo-upload"
                    className={`relative flex flex-col items-center justify-center min-h-[220px] border-2 border-dashed rounded-2xl transition-all duration-200 ${
                      photos.length >= 5 
                        ? "border-slate-300 bg-slate-50 cursor-not-allowed" 
                        : "border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-18 h-18 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Camera size={32} strokeWidth={2} />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-slate-900 text-lg">Drop clear photo or tap to browse</p>
                        <p className="text-sm text-slate-500 mt-2 max-w-xs">
                          Photos remain selected in this page; the current backend report endpoint does not accept photo uploads (JPG, PNG up to 15MB)
                        </p>
                      </div>
                      {photos.length > 0 && (
                        <p className="text-xs font-medium text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full">
                          {photos.length}/5 photos added
                        </p>
                      )}
                    </div>
                  </label>

                  {/* Photo previews */}
                  {photos.length > 0 && (
                    <div className="absolute bottom-[-55px] left-0 right-0 flex justify-center gap-2 px-2 pb-2 pointer-events-none">
                      <div className="flex gap-2 overflow-x-auto pb-2 pointer-events-auto">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative w-22 h-22 flex-shrink-0">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover rounded-xl border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-xl hover:bg-red-600 transition-colors"
                            >
                              <X size={12} strokeWidth={3} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Severity Toggle Cards */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Severity Matrix</h2>
                  <span className="text-xs font-medium text-slate-500">Select impact level</span>
                </div>
                
                <div className="space-y-4 h-full">
                  {/* Card A: Complete Blockage - Critical */}
                  <button
                    type="button"
                    onClick={() => setSelectedSeverity("critical")}
                    className={`w-full relative p-5 rounded-2xl border-2 text-left transition-all duration-200 focus-visible:outline-emerald-500 ${
                      selectedSeverity === "critical"
                        ? "border-red-500 bg-red-50 shadow-xl shadow-red-500/15"
                        : "border-slate-200 hover:border-red-400 hover:bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                        selectedSeverity === "critical" ? "bg-red-500" : "bg-red-100"
                      }`}>
                        <AlertCircle size={28} strokeWidth={2.5} className={selectedSeverity === "critical" ? "text-white" : "text-red-500"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 text-lg">Complete Blockage</h3>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            selectedSeverity === "critical" ? "bg-red-500 text-white" : "bg-red-100 text-red-700"
                          }`}>
                            CRITICAL
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Completely impassable for wheelchairs, strollers, or cane users. Immediate rerouting required.
                        </p>
                      </div>
                      {selectedSeverity === "critical" && (
                        <div className="flex-shrink-0 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center">
                          <CheckCircle2 size={18} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Card B: Passable with Caution - Assistance Needed */}
                  <button
                    type="button"
                    onClick={() => setSelectedSeverity("caution")}
                    className={`w-full relative p-5 rounded-2xl border-2 text-left transition-all duration-200 focus-visible:outline-emerald-500 ${
                      selectedSeverity === "caution"
                        ? "border-amber-500 bg-amber-50 shadow-xl shadow-amber-500/15"
                        : "border-slate-200 hover:border-amber-400 hover:bg-amber-50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                        selectedSeverity === "caution" ? "bg-amber-500" : "bg-amber-100"
                      }`}>
                        <AlertTriangle size={28} strokeWidth={2.5} className={selectedSeverity === "caution" ? "text-white" : "text-amber-500"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 text-lg">Passable with Caution</h3>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            selectedSeverity === "caution" ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-700"
                          }`}>
                            Assistance Needed
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Severe rough surface, narrow passing less than 80cm, or steep slope requiring manual assist.
                        </p>
                      </div>
                      {selectedSeverity === "caution" && (
                        <div className="flex-shrink-0 w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center">
                          <CheckCircle2 size={18} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </section>

            {/* Section 4: Observations Input */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Additional Observations</h2>
                <span className="text-xs font-medium text-slate-500">Optional but helpful</span>
              </div>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="e.g., Station concourse lift shut down for maintenance, construction boards blocking tactile paving..."
                className="w-full min-h-[140px] p-5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 font-medium resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                rows={5}
              />
            </section>

            {/* Section 5: Action Footer & Submit Bar */}
            <section className="border-t border-slate-100 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left: Info text */}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <HelpCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <span className="font-medium max-w-md">
                    Crowdsourced reports help everyone find a better path. Thank you.
                  </span>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors focus-visible:outline-emerald-500"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-950 shadow-xl shadow-emerald-900/40 hover:shadow-emerald-900/50 transition-all duration-200 focus-visible:outline-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    <Flag size={18} strokeWidth={2.5} />
                    {isSubmitting ? "Reporting..." : "Report Barrier"}
                  </button>
                </div>
              </div>
            </section>

          </form>
        </div>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-4 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md border border-slate-800">
            <CheckCircle2 size={22} className="text-emerald-400 flex-shrink-0" />
            <p role={submitError ? "alert" : "status"} className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Page Footer */}
      <Footer />
    </div>
  );
}
