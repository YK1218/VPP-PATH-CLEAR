"use client";

import { useEffect } from "react";
import { useProfile } from "@/contexts/ProfileContext";

export default function ThemeApplier() {
  const { profileMode } = useProfile();

  useEffect(() => {
    const root = document.documentElement;
    
    // Clean up previous mode classes
    root.classList.remove("theme-low-vision", "theme-blind", "theme-deaf");
    
    if (profileMode !== "standard") {
      root.classList.add(`theme-${profileMode}`);
    }
  }, [profileMode]);

  return null;
}
