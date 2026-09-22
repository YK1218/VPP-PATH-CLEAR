"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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
    setToastMessage("Submitting report...");
    setShowToast(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setToastMessage("Barrier reported successfully! Your report helps keep routes step-free.");
    setShowToast(true);
    
    // Reset form after success
    setTimeout(() => {
      setSelectedBarrierType("broken-elevator");
      setSelectedSeverity("critical");
      setPhotos([]);
      setObservations("");
      setShowToast(false);
    }, 3000);
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
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                {/* Map Canvas - Wide Panoramic */}
                <div className="relative h-64 sm:h-72 w-full">
                  {/* Map Background - Mumbai Coastal/Road Palette */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200">
                    {/* Water body - cyan line */}
                    <div className="absolute bottom-20 left-0 right-0 h-8 bg-cyan-300/40 rounded-t-full" />
                    {/* Road corridors */}
                    <div className="absolute top-1/3 left-0 right-0 h-1 bg-slate-400/40" style={{ transform: 'rotate(12deg)' }} />
                    <div className="absolute top-2/3 left-0 right-0 h-1 bg-slate-400/40" style={{ transform: 'rotate(-8deg)' }} />
                    {/* Grid pattern */}
                    <svg className="absolute inset-0 opacity-15" width="100%" height="100%">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)"/>
                    </svg>
                    
                    {/* Subtle landmark labels */}
                    <div className="absolute top-8 left-6 text-xs text-slate-500 font-medium">Bandra Kurla Complex</div>
                    <div className="absolute top-20 left-10 text-xs text-slate-500 font-medium">G Block</div>
                    <div className="absolute top-6 right-8 text-xs text-slate-500 font-medium">MTHL</div>
                    <div className="absolute bottom-8 right-10 text-xs text-slate-500 font-medium">Bandra East</div>
                  </div>

                  {/* Centered location marker pin with label */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10">
                    <div className="relative">
                      <div className="w-5 h-5 bg-red-500 rounded-full border-4 border-white shadow-xl transform rotate-45" />
                      <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full border-4 border-white shadow-xl" />
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                        Barrier Pin: Bandra Kurla Complex
                      </div>
                    </div>
                  </div>

                  {/* Top-right: Recenter GPS button */}
                  <button
                    type="button"
                    className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-700 px-3 py-2 rounded-lg shadow-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors focus-visible:outline-emerald-500 z-10"
                  >
                    <Crosshair size={16} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Recenter GPS</span>
                  </button>

                  {/* Bottom coordinate info bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/95 via-slate-900/80 to-transparent py-5 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <MapPin size={16} className="text-emerald-400" />
                      <span className="font-mono">19.0660° N, 72.8687° E</span>
                      <span className="text-slate-400">•</span>
                      <span>Bandra Kurla Complex (BKC), G Block, Mumbai</span>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors focus-visible:outline-emerald-500"
                    >
                      <Search size={16} strokeWidth={2.5} />
                      <span>Search by Landmark</span>
                    </button>
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
                          GPS geo-tag auto-extracted &bull; Clear view helps field audit teams reroute safely (JPG, PNG up to 15MB)
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
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Page Footer */}
      <Footer />
    </div>
  );
}