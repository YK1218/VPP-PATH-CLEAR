"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { AccessibilityProfile, MobilityProfileType } from "@/types";

interface ProfileContextValue {
  profile: AccessibilityProfile;
  profileMode: "standard" | "low-vision" | "blind" | "deaf";
  setProfile: (profile: AccessibilityProfile) => void;
  presets: AccessibilityProfile[];
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const PRESET_PROFILES: AccessibilityProfile[] = [
  {
    id: "manual-wheelchair",
    name: "Manual Wheelchair",
    mobilityType: "wheelchair_manual",
    maxInclinePercent: 5.0,
    requireStepFree: true,
    requireTactilePaving: false,
    requireWellLit: false,
    avoidBrokenSurfaces: true,
  },
  {
    id: "power-chair",
    name: "Power Chair / Scooter",
    mobilityType: "wheelchair_power",
    maxInclinePercent: 8.0,
    requireStepFree: true,
    requireTactilePaving: false,
    requireWellLit: false,
    avoidBrokenSurfaces: true,
  },
  {
    id: "walker-cane",
    name: "Walker / Cane Support",
    mobilityType: "walker",
    maxInclinePercent: 6.0,
    requireStepFree: false,
    requireTactilePaving: false,
    requireWellLit: true,
    avoidBrokenSurfaces: true,
  },
  {
    id: "visual-guide",
    name: "Visual Assistance / Blind",
    mobilityType: "visual_guide",
    maxInclinePercent: 10.0,
    requireStepFree: false,
    requireTactilePaving: true,
    requireWellLit: true,
    avoidBrokenSurfaces: true,
  },
  {
    id: "visual-partial",
    name: "Low Vision / Partially Blind",
    mobilityType: "visual_partial",
    maxInclinePercent: 8.0,
    requireStepFree: false,
    requireTactilePaving: true,
    requireWellLit: true,
    avoidBrokenSurfaces: true,
  },
  {
    id: "deaf",
    name: "Deaf / Hard of Hearing",
    mobilityType: "deaf",
    maxInclinePercent: 12.0,
    requireStepFree: false,
    requireTactilePaving: false,
    requireWellLit: true,
    avoidBrokenSurfaces: false,
  },
];

const DEFAULT_PROFILE = PRESET_PROFILES[0];

function getProfileMode(mobilityType: MobilityProfileType): "standard" | "low-vision" | "blind" | "deaf" {
  if (mobilityType === "visual_guide") return "blind";
  if (mobilityType === "visual_partial") return "low-vision";
  if (mobilityType === "deaf") return "deaf";
  return "standard";
}

function loadProfileFromStorage(): AccessibilityProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("pathclear-active-profile");
    if (stored) {
      const parsed = JSON.parse(stored);
      const found = PRESET_PROFILES.find((p) => p.id === parsed.id);
      return found || null;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function saveProfileToStorage(profile: AccessibilityProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("pathclear-active-profile", JSON.stringify({ id: profile.id }));
  } catch {
    // ignore write errors
  }
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<AccessibilityProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadProfileFromStorage();
    if (saved) {
      setProfileState(saved);
    }
    setHydrated(true);
  }, []);

  const setProfile = useCallback((profile: AccessibilityProfile) => {
    setProfileState(profile);
    saveProfileToStorage(profile);
  }, []);

  const profileMode = useMemo(
    () => getProfileMode(profile.mobilityType),
    [profile.mobilityType]
  );

  const value = useMemo(
    () => ({
      profile,
      profileMode,
      setProfile,
      presets: PRESET_PROFILES,
    }),
    [profile, profileMode]
  );

  // Render children immediately with DEFAULT_PROFILE to avoid SSR flash
  // Hydration will smoothly update the profile once client-side localStorage is read
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

export { PRESET_PROFILES };
export type { AccessibilityProfile };