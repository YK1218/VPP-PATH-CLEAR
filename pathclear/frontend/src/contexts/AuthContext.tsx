"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase, isSupabaseConfigured, useRealSupabaseAuth } from "@/lib/supabase";
import { useProfile } from "@/contexts/ProfileContext";
import { AccessibilityProfile, PRESET_PROFILES } from "@/contexts/ProfileContext";

// Define local types to avoid conflicts with Supabase types
interface User {
  id: string;
  email: string;
  name?: string;
  mobilityType?: string;
}

interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Type guard to convert Supabase session to our local Session type
function toLocalSession(supabaseSession: any): Session | null {
  if (!supabaseSession?.user) return null;
  
  return {
    user: {
      id: supabaseSession.user.id,
      email: supabaseSession.user.email || "",
      name: supabaseSession.user.user_metadata?.full_name,
      mobilityType: supabaseSession.user.user_metadata?.mobility_type,
    },
    access_token: supabaseSession.access_token,
    refresh_token: supabaseSession.refresh_token,
    expires_at: supabaseSession.expires_at ? supabaseSession.expires_at * 1000 : Date.now() + 1000 * 60 * 60 * 24 * 30,
  };
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  isSupabaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, mobilityType?: string) => Promise<{ error?: string }>;
  continueAsGuest: (mobilityType?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER_KEY = "pathclear-auth-session";

function createDemoSession(profile: AccessibilityProfile): Session {
  const user: User = {
    id: "guest-" + Date.now(),
    email: "",
    name: "Guest Explorer",
    mobilityType: profile.mobilityType,
  };

  return {
    user,
    access_token: "demo-token-" + Date.now(),
    refresh_token: "demo-refresh-" + Date.now(),
    expires_at: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };
}

function saveSessionToStorage(session: Session) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("pathclear-auth-session", JSON.stringify(session));
  } catch {
    // ignore
  }
}

function loadSessionFromStorage(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("pathclear-auth-session");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.expires_at > Date.now()) {
        return parsed;
      }
      localStorage.removeItem("pathclear-auth-session");
    }
  } catch {
    // ignore
  }
  return null;
}

function clearSessionFromStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("pathclear-auth-session");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profile: currentProfile, setProfile, presets } = useProfile();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isGuestMode = useRealSupabaseAuth() === false;

  const isSupabaseConfigured = useRealSupabaseAuth();
  const isAuthenticated = !!session && !!user;
  const isGuest = !useRealSupabaseAuth() && !!session;

  // Hydrate from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      
      if (!useRealSupabaseAuth()) {
        // Demo mode - restore from localStorage
        const stored = loadSessionFromStorage();
        if (stored) {
          setSession(stored);
          setUser(stored.user);
        }
      } else {
        // Real Supabase mode - check auth state
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const localSession = toLocalSession(session);
          if (localSession) {
            setSession(localSession);
            setUser(localSession.user);
          }
        } catch {
          // Supabase not available, fall back to demo
        }
      }
      
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  // Set up auth state listener for real Supabase
  useEffect(() => {
    if (!useRealSupabaseAuth()) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const localSession = toLocalSession(session);
          if (localSession) {
            setSession(localSession);
            setUser(localSession.user);
          }
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    if (!useRealSupabaseAuth()) {
      // Demo mode - simulate successful sign in
      const demoSession = createDemoSession(PRESET_PROFILES[0]);
      setSession(demoSession);
      setUser(demoSession.user);
      saveSessionToStorage(demoSession);
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || "Sign in failed" };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, mobilityType?: string): Promise<{ error?: string }> => {
    if (!useRealSupabaseAuth()) {
      // Demo mode - simulate successful sign up
      const profile = mobilityType 
        ? PRESET_PROFILES.find(p => p.mobilityType === mobilityType) || PRESET_PROFILES[0]
        : PRESET_PROFILES[0];
      
      const demoSession = createDemoSession(profile);
      setSession(demoSession);
      setUser(demoSession.user);
      saveSessionToStorage(demoSession);
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            mobility_type: mobilityType,
          },
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || "Sign up failed" };
    }
  }, []);

  const continueAsGuest = useCallback((mobilityType?: string) => {
    const profile = mobilityType 
      ? PRESET_PROFILES.find(p => p.mobilityType === mobilityType) || PRESET_PROFILES[0]
      : PRESET_PROFILES[0];
    
    setProfile(profile);
    const demoSession = createDemoSession(profile);
    setSession(demoSession);
    setUser(demoSession.user);
    saveSessionToStorage(demoSession);
  }, [setProfile]);

  const signOut = useCallback(async () => {
    setUser(null);
    setSession(null);
    clearSessionFromStorage();
    
    if (useRealSupabaseAuth()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    isLoading,
    isAuthenticated,
    isGuest,
    isSupabaseConfigured: useRealSupabaseAuth(),
    signIn,
    signUp,
    continueAsGuest,
    signOut,
  }), [user, session, isLoading, isAuthenticated, isGuest]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}