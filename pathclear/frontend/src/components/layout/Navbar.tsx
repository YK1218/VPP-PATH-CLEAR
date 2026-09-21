"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState("Step-Free - Wheelchair");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const profiles = [
    "Step-Free - Wheelchair",
    "Low Incline - Walker",
    "Audible & Tactile - Vision",
    "Paced Routing - Elderly"
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-100 flex h-[72px] items-center px-4 md:px-8 justify-between sticky top-0 z-50">
      {/* Left section: Logo and City Selector */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2" aria-label="PathClear Home">
          {/* Logo icon */}
          <div className="w-8 h-8 bg-[#0a192f] rounded-lg flex items-center justify-center relative overflow-hidden">
             <div className="absolute w-6 h-6 border-b-2 border-r-2 border-pathclear-secondary rounded-br-full -top-1 -left-1"></div>
             <div className="absolute w-1.5 h-1.5 bg-pathclear-secondary rounded-full bottom-1 right-1"></div>
             <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-2 left-2"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">PathClear</span>
        </Link>
        
        <button className="hidden md:flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 transition-colors">
          <MapPin size={16} className="text-gray-500" />
          Mumbai
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Middle section: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1">
        <Link 
          href="/" 
          className="bg-pathclear-primary text-white px-4 py-2 rounded-full text-sm font-medium"
          aria-current="page"
        >
          Route Planner
        </Link>
        <Link href="/transit" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full text-sm font-medium transition-colors">
          Transit Hubs
        </Link>
        <Link href="/alerts" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full text-sm font-medium transition-colors">
          Obstacle Alerts
        </Link>
        <Link href="/guides" className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full text-sm font-medium transition-colors">
          Accessibility Guides
        </Link>
      </nav>

      {/* Right section: Profile */}
      <div className="flex items-center gap-4">
        
        <div className="relative hidden sm:block" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 bg-green-50/50 hover:bg-green-50 border border-green-100 px-3 py-1.5 rounded-full transition-colors focus-visible:outline-pathclear-primary"
            aria-expanded={isProfileOpen}
            aria-haspopup="listbox"
          >
            <svg className="w-4 h-4 text-pathclear-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
              <path d="M8 12h8"></path>
            </svg>
            <span className="text-xs font-semibold text-gray-700">{activeProfile}</span>
            <ChevronDown size={14} className={`text-pathclear-primary transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 pb-2 mb-2 border-b border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Mobility Profile</p>
              </div>
              <ul role="listbox">
                {profiles.map((profile) => (
                  <li key={profile}>
                    <button
                      role="option"
                      aria-selected={activeProfile === profile}
                      onClick={() => {
                        setActiveProfile(profile);
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-gray-50 flex items-center justify-between transition-colors text-gray-700"
                    >
                      {profile}
                      {activeProfile === profile && (
                        <Check size={16} className="text-pathclear-primary" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <button className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-200 focus-visible:outline-pathclear-primary" aria-label="User profile">
          <img 
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" 
            alt="User avatar" 
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}
