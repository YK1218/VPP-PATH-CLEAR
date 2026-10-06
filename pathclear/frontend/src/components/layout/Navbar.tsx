"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Check, LogOut, User, AlertTriangle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { profile, setProfile, presets } = useProfile();
  const { user, isAuthenticated, isLoading, isGuest, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === "/auth";
  const isNavigationOrArrival = pathname.startsWith("/navigation") || pathname.startsWith("/arrival");

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

  const handleSignOutClick = () => {
    if (isNavigationOrArrival) {
      setShowSignOutConfirm(true);
      setIsProfileOpen(false);
    } else {
      executeSignOut();
    }
  };

  const executeSignOut = async () => {
    setShowSignOutConfirm(false);
    setIsProfileOpen(false);
    await signOut();
    router.push("/auth");
  };

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 flex h-[72px] items-center px-4 md:px-8 justify-between sticky top-0 z-50">
        {/* Left section: Logo and City Selector */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2" aria-label="PathClear Home">
            <div className="w-8 h-8 bg-[#0a192f] rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute w-6 h-6 border-b-2 border-r-2 border-pathclear-secondary rounded-br-full -top-1 -left-1"></div>
              <div className="absolute w-1.5 h-1.5 bg-pathclear-secondary rounded-full bottom-1 right-1"></div>
              <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-2 left-2"></div>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">PathClear</span>
          </Link>

          {/* Mumbai city selector — hidden on auth page */}
          {!isAuthPage && (
            <button className="hidden md:flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 transition-colors">
              <MapPin size={16} className="text-gray-500" />
              Mumbai
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Middle section: Navigation Links — hidden on auth page */}
        {!isAuthPage && (
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/planner"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                pathname === "/planner"
                  ? "bg-pathclear-primary text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              aria-current={pathname === "/planner" ? "page" : undefined}
            >
              Route Planner
            </Link>
            <Link
              href="/transit"
              className="text-gray-400 px-4 py-2 rounded-full text-sm font-medium cursor-not-allowed"
              aria-disabled="true"
              tabIndex={-1}
              title="Coming soon"
            >
              Transit Hubs
            </Link>
            <Link
              href="/alerts"
              className="text-gray-400 px-4 py-2 rounded-full text-sm font-medium cursor-not-allowed"
              aria-disabled="true"
              tabIndex={-1}
              title="Coming soon"
            >
              Obstacle Alerts
            </Link>
            <Link
              href="/guides"
              className="text-gray-400 px-4 py-2 rounded-full text-sm font-medium cursor-not-allowed"
              aria-disabled="true"
              tabIndex={-1}
              title="Coming soon"
            >
              Accessibility Guides
            </Link>
          </nav>
        )}

        {/* Right section: Profile / Auth Menu */}
        <div className="flex items-center gap-4">
          {isAuthPage ? (
            <Link
              href="/"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
            >
              Back to Map
            </Link>
          ) : isLoading ? (
            <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
          ) : isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 pl-1.5 pr-3 py-1.5 rounded-full transition-colors focus-visible:outline-pathclear-primary"
                aria-expanded={isProfileOpen}
                aria-haspopup="listbox"
                aria-label="User and mobility settings menu"
              >
                <div className="w-7 h-7 rounded-full bg-pathclear-primary flex items-center justify-center text-white font-bold text-xs">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "G"}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-gray-800 leading-tight">
                    {user?.name || (isGuest ? "Guest Explorer" : "User")}
                  </p>
                  <p className="text-[10px] text-pathclear-primary font-medium leading-tight truncate max-w-[120px]">
                    {profile.name}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Header */}
                  <div className="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {user?.name || (isGuest ? "Guest Explorer" : "Active User")}
                      </span>
                      {isGuest ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Demo Session
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          Signed In
                        </span>
                      )}
                    </div>
                    {user?.email && (
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{user.email}</p>
                    )}
                  </div>

                  {/* Active Mobility Profile Switcher */}
                  <div className="px-3.5 pt-2 pb-1 border-b border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Switch Mobility Profile
                    </p>
                  </div>
                  <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
                    {presets.map((profileOption) => {
                      const isSelected = profile.id === profileOption.id;
                      return (
                        <li key={profileOption.id}>
                          <button
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setProfile(profileOption);
                              setIsProfileOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                              isSelected
                                ? "bg-emerald-50/80 text-pathclear-primary font-bold"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span>{profileOption.name}</span>
                            {isSelected && (
                              <Check size={14} className="text-pathclear-primary shrink-0" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Sign Out Action */}
                  <div className="p-2 border-t border-gray-100 bg-gray-50/30 rounded-b-xl">
                    <button
                      onClick={handleSignOutClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1.5 bg-pathclear-primary hover:bg-pathclear-secondary text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-colors focus-visible:outline-pathclear-primary"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Confirmation Modal when Signing Out during Active Navigation */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Active Navigation in Progress</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              You are currently in an active route session. Signing out will end your navigation guidance and return you to the sign-in page.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors"
              >
                Keep Navigating
              </button>
              <button
                type="button"
                onClick={executeSignOut}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-colors"
              >
                End Trip & Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}