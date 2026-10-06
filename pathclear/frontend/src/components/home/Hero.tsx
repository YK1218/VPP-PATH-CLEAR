"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Mic, ArrowRight, Activity, Eye, Volume2, MapPin, Building2, TrainFront, Check, Loader2, X } from "lucide-react";
import { useVoiceAgent } from "@/contexts/VoiceAgentContext";
import { useProfile } from "@/contexts/ProfileContext";

interface SearchSuggestion {
  name: string;
  subtitle: string;
  type: "transit" | "building" | "location";
  lat?: number;
  lng?: number;
}

const CITY_DESTINATIONS: Record<string, SearchSuggestion[]> = {
  Mumbai: [
    { name: "Jio World Centre", subtitle: "BKC South Accessible Gate 2 • Mumbai", type: "building", lat: 19.0633, lng: 72.8684 },
    { name: "Bandra Kurla Complex Metro", subtitle: "Aqua Line 3 • Low-Threshold Elevator", type: "transit", lat: 19.0598, lng: 72.8520 },
    { name: "Bandra Railway Station", subtitle: "West Accessible Footbridge & Ramp • Western Railway", type: "transit", lat: 19.0558, lng: 72.8315 },
    { name: "Dadar Central Station", subtitle: "Platform 1 Wheelchair Ramp & Tactile Guide", type: "transit", lat: 19.0178, lng: 72.8478 },
    { name: "Chhatrapati Shivaji Maharaj Terminus", subtitle: "CSMT Star Chamber Level Access", type: "transit", lat: 18.9400, lng: 72.8353 },
    { name: "Mumbai Airport Terminal 2", subtitle: "Accessible Drop-off Pier 4 • Sahar", type: "transit", lat: 19.0968, lng: 72.8745 },
  ],
  "Delhi NCR": [
    { name: "Rajiv Chowk Metro Station", subtitle: "Gate 7 Elevator Access • Blue/Yellow Line", type: "transit", lat: 28.6328, lng: 77.2195 },
    { name: "India Habitat Centre", subtitle: "Lodhi Road • Step-free Auditorium Level", type: "building", lat: 28.5898, lng: 77.2249 },
    { name: "Indira Gandhi International Airport T3", subtitle: "Pillar 10 Wheelchair Bay", type: "transit", lat: 28.5562, lng: 77.1000 },
  ],
  Bengaluru: [
    { name: "Majestic Metro Station (Nadaprabhu Kempegowda)", subtitle: "Interchange Lift Access • Green/Purple Line", type: "transit", lat: 12.9757, lng: 77.5728 },
    { name: "UB City", subtitle: "Vittal Mallya Road • Ramp Level Entrance", type: "building", lat: 12.9716, lng: 77.5958 },
  ],
  Pune: [
    { name: "Pune Railway Station", subtitle: "Platform 1 Low Incline Ramp", type: "transit", lat: 18.5289, lng: 73.8743 },
    { name: "Shivaji Nagar Metro Station", subtitle: "Civil Court Interchange Accessible Gate", type: "transit", lat: 18.5314, lng: 73.8446 },
  ],
  Hyderabad: [
    { name: "Ameerpet Metro Station", subtitle: "Red & Blue Line Level Elevators", type: "transit", lat: 17.4375, lng: 78.4482 },
    { name: "HITEC City Cyber Towers", subtitle: "Ground Concierge Accessible Ramp", type: "building", lat: 17.4504, lng: 78.3808 },
  ],
  Ahmedabad: [
    { name: "Kalupur Railway Station", subtitle: "West Entrance Step-Free Pathway", type: "transit", lat: 23.0238, lng: 72.6012 },
    { name: "Sabarmati Riverfront Promenade", subtitle: "Usmanpura Wheelchair Ramp Access", type: "location", lat: 23.0525, lng: 72.5714 },
  ],
};

export default function Hero() {
  const router = useRouter();
  const { toggleListening, isListening, transcript } = useVoiceAgent();
  const { profile } = useProfile();

  const cities = ["Mumbai", "Delhi NCR", "Bengaluru", "Pune", "Hyderabad", "Ahmedabad"];
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("Max 3% Incline");
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync voice transcript to search if user is speaking on Home page
  useEffect(() => {
    if (transcript && transcript.length > 2) {
      // Remove leading filler phrases like "navigate to", "search for", "go to"
      const cleaned = transcript
        .replace(/^(navigate to|find route to|take me to|search for|go to|plan route to)\s+/i, "")
        .trim();
      if (cleaned) {
        setSearchQuery(cleaned);
        setShowDropdown(true);
      }
    }
  }, [transcript]);

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update suggestions based on city or user typing
  useEffect(() => {
    const cityList = CITY_DESTINATIONS[selectedCity] || CITY_DESTINATIONS["Mumbai"];

    if (!searchQuery.trim()) {
      setSuggestions(cityList.slice(0, 5));
      return;
    }

    const queryLower = searchQuery.toLowerCase();
    const localFiltered = cityList.filter(
      (item) =>
        item.name.toLowerCase().includes(queryLower) ||
        item.subtitle.toLowerCase().includes(queryLower)
    );

    if (localFiltered.length > 0) {
      setSuggestions(localFiltered);
    } else {
      // Nominatim debounce search
      const timer = setTimeout(async () => {
        setIsLoadingGeocoding(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              `${searchQuery}, ${selectedCity}, India`
            )}&format=json&limit=4&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const geoResults: SearchSuggestion[] = data.map((item: any) => ({
                name: item.display_name.split(",")[0] || searchQuery,
                subtitle: item.display_name.split(",").slice(1, 3).join(", ") || `${selectedCity}, India`,
                type: item.type === "station" || item.class === "railway" ? "transit" : "location",
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
              }));
              setSuggestions(geoResults);
            } else {
              setSuggestions([
                {
                  name: searchQuery,
                  subtitle: `Search around ${selectedCity}`,
                  type: "location",
                },
              ]);
            }
          }
        } catch (err) {
          console.warn("Geocoding fallback", err);
        } finally {
          setIsLoadingGeocoding(false);
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedCity]);

  const handleSelectDestination = (dest: SearchSuggestion) => {
    setSearchQuery(dest.name);
    setShowDropdown(false);
    const params = new URLSearchParams({
      dest: dest.name,
      city: selectedCity,
    });
    if (dest.lat && dest.lng) {
      params.set("lat", dest.lat.toString());
      params.set("lng", dest.lng.toString());
    }
    if (selectedFilter) {
      params.set("filter", selectedFilter);
    }
    router.push(`/planner?${params.toString()}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = searchQuery.trim() || suggestions[0]?.name || "Jio World Centre";
    const bestMatch = suggestions.find((s) => s.name.toLowerCase() === target.toLowerCase()) || suggestions[0];
    
    const params = new URLSearchParams({
      dest: target,
      city: selectedCity,
    });
    if (bestMatch?.lat && bestMatch?.lng) {
      params.set("lat", bestMatch.lat.toString());
      params.set("lng", bestMatch.lng.toString());
    }
    if (selectedFilter) {
      params.set("filter", selectedFilter);
    }
    router.push(`/planner?${params.toString()}`);
  };

  return (
    <section className="w-full flex flex-col items-center pt-8 pb-12 px-4 relative">
      {/* Background decoration to mimic faint map lines */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,50 Q200,100 400,0 T800,50 T1200,0 T1600,100" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M0,200 Q300,100 600,300 T1200,200 T1800,400" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="400" cy="150" r="4" fill="currentColor" />
          <circle cx="800" cy="50" r="4" fill="currentColor" />
          <path d="M400,150 L600,300" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* City Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-white px-2 py-1.5 rounded-full shadow-sm border border-gray-100">
          {cities.map((city) => {
            const isActive = selectedCity === city;
            return (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setSearchQuery("");
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-gray-100 text-pathclear-primary font-bold shadow-2xs relative"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {isActive && (
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pathclear-primary" />
                )}
                <span className={isActive ? "pl-3" : ""}>{city}</span>
              </button>
            );
          })}
        </div>

        {/* Active Profile Chip */}
        <div className="inline-flex items-center gap-1.5 bg-green-50 text-pathclear-secondary text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-6 border border-emerald-100 shadow-2xs">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
            <path d="M8 12h8" />
          </svg>
          <span>{profile.name} • Step-Free Active</span>
        </div>

        {/* Hero Headings */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Where are you going in {selectedCity}?
        </h1>
        <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-8 font-medium">
          Every route verified for elevator reliability, zero curb steps, and continuous ramp gradients.
        </p>

        {/* Search Bar with Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="w-full max-w-3xl relative mb-6">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full bg-white rounded-full shadow-md border border-gray-200 p-2 flex items-center focus-within:ring-2 focus-within:ring-pathclear-secondary focus-within:border-transparent transition-all"
          >
            <div className="pl-4 pr-2 text-pathclear-primary">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={`Search an accessible station, building or place in ${selectedCity}...`}
              className="flex-1 bg-transparent border-none outline-none py-3 text-gray-800 placeholder:text-gray-400 font-medium text-base md:text-lg min-w-0"
              aria-label="Search destination"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowDropdown(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear input"
              >
                <X size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-full transition-all mr-2 cursor-pointer ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : "text-pathclear-primary hover:bg-gray-50"
              }`}
              aria-label="Voice search destination"
              title={isListening ? "Listening..." : "Click to speak destination"}
            >
              <Mic size={20} />
            </button>

            <button
              type="submit"
              className="bg-pathclear-primary hover:bg-pathclear-secondary text-white px-6 py-3.5 rounded-full font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            >
              <span>Find Route</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Autocomplete Dropdown Menu */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left animate-in fade-in duration-150">
              <div className="p-2.5 border-b border-gray-100 flex items-center justify-between text-xs text-gray-400 font-semibold px-4">
                <span>VERIFIED ACCESSIBLE DESTINATIONS ({selectedCity})</span>
                {isLoadingGeocoding && <Loader2 size={13} className="animate-spin text-pathclear-primary" />}
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDestination(item)}
                    className="w-full px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors text-left border-b border-gray-50 last:border-0 cursor-pointer"
                  >
                    <div className="mt-0.5 p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      {item.type === "transit" ? (
                        <TrainFront size={16} />
                      ) : item.type === "building" ? (
                        <Building2 size={16} />
                      ) : (
                        <MapPin size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                    <span className="text-xs text-pathclear-secondary font-semibold shrink-0 self-center">
                      Plan Route →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-3xl">
          {[
            { label: "Max 3% Incline", icon: <Activity size={16} /> },
            {
              label: "Require Dropped Curbs",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 10h-2a2 2 0 0 0-2-2V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2h2" />
                </svg>
              ),
            },
            { label: "Audible Crossings", icon: <Volume2 size={16} /> },
            { label: "Live Elevator Feed", icon: <Eye size={16} /> },
          ].map((chip) => {
            const isSelected = selectedFilter === chip.label;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => setSelectedFilter(isSelected ? "" : chip.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#046c4e] text-white border-[#046c4e] shadow-sm"
                    : "bg-[#f8f9fa] hover:bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                {chip.icon}
                <span>{chip.label}</span>
                {isSelected && <Check size={14} className="ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
