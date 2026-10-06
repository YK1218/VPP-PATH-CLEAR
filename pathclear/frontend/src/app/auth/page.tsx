"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, PRESET_PROFILES } from "@/contexts/ProfileContext";
import { AccessibilityProfile } from "@/types";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Shield, 
  Mic, 
  ArrowRight,
  HelpCircle,
  Sparkles,
  Contrast,
  Volume2,
  Ear
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    signIn, 
    signUp, 
    continueAsGuest, 
    isLoading, 
    isSupabaseConfigured 
  } = useAuth();
  const { setProfile, presets } = useProfile();

  const redirect = searchParams.get("redirect") || "/";
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMobility, setSelectedMobility] = useState("wheelchair_manual");
  const [error, setError] = useState("");
  const [highContrast, setHighContrast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setSubmitting(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setSubmitting(false);
        return;
      }
      if (!selectedMobility) {
        setError("Please select a mobility profile");
        setSubmitting(false);
        return;
      }

      const result = await signUp(email, password, selectedMobility);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      const targetProfile = presets.find((p) => p.mobilityType === selectedMobility);
      if (targetProfile) {
        setProfile(targetProfile);
      }
    } else {
      if (!email || !password) {
        setError("Please enter your email and password");
        setSubmitting(false);
        return;
      }

      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    router.push(redirect);
    router.refresh();
  };

  const handleGuestSelect = (guestProfile: AccessibilityProfile) => {
    setProfile(guestProfile);
    continueAsGuest(guestProfile.mobilityType);
    router.push(redirect);
  };

  const inputClass =
    "w-full h-12 px-4 text-sm md:text-base border-2 border-gray-200 rounded-xl transition-all focus:outline-none focus:border-pathclear-primary focus:ring-2 focus:ring-pathclear-primary/20 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900";

  return (
    <div className={`min-h-screen flex flex-col bg-[#f5f8fa] ${highContrast ? "contrast-125 filter" : ""}`}>
      {/* Navbar — auto cleans up dead links, mumbai dropdown & report change button on /auth */}
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
            {/* Header with High-Contrast toggle */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Authentication & Profile Setup
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  highContrast
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
                aria-pressed={highContrast}
              >
                <Contrast className="w-3.5 h-3.5" />
                {highContrast ? "High Contrast On" : "High Contrast"}
              </button>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                {isSignUp ? "Create Accessible Profile" : "Welcome to PathClear"}
              </h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {isSignUp
                  ? "Select your mobility requirements for customized step-free routing."
                  : "Sign in to access your saved accessible routes and community reports."}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError("");
                }}
                className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  !isSignUp
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError("");
                }}
                className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  isSignUp
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 animate-in fade-in duration-200"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@pathclear.org"
                    className={`${inputClass} pl-12`}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-pathclear-primary hover:text-pathclear-secondary font-bold"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${inputClass} pl-12 pr-12`}
                    disabled={submitting}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`${inputClass} pl-12 pr-4`}
                      disabled={submitting}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              )}

              {/* Mobility Profile Selector - All 6 profiles available during sign up */}
              {isSignUp && (
                <fieldset className="pt-2">
                  <legend className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                    Select Mobility Profile (Includes Blind & Deaf assistance)
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup">
                    {presets.map((p) => {
                      const isSelected = selectedMobility === p.mobilityType;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedMobility(p.mobilityType)}
                          role="radio"
                          aria-checked={isSelected}
                          className={`p-3 rounded-2xl border-2 text-left transition-all ${
                            isSelected
                              ? "border-pathclear-primary bg-emerald-50/60 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold ${isSelected ? "text-pathclear-primary" : "text-gray-900"}`}>
                              {p.name}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-pathclear-primary shrink-0" />}
                          </div>
                          <p className="text-[11px] text-gray-500 leading-tight">
                            {p.mobilityType === "visual_guide" && "Audio-first & haptic turn navigation"}
                            {p.mobilityType === "visual_partial" && "Enlarged fonts & high-contrast mode"}
                            {p.mobilityType === "deaf" && "Visual banners & vibration alerts"}
                            {p.mobilityType === "wheelchair_manual" && "Strict step-free · Max 5% incline"}
                            {p.mobilityType === "wheelchair_power" && "Step-free guarantee · Max 8% incline"}
                            {p.mobilityType === "walker" && "Flexible step-free · Gentle slopes"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full h-12 mt-2 rounded-xl bg-pathclear-primary hover:bg-pathclear-secondary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pathclear-primary/20 transition-all focus-visible:outline-pathclear-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? "Complete Account Setup" : "Sign In to PathClear"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-wider">
                  Or instant preview as guest
                </span>
              </div>
            </div>

            {/* Guest / Demo Mode with ALL 6 Accessibility Profiles */}
            <div className="space-y-2.5">
              <p className="text-xs text-gray-500 text-center mb-1">
                Choose a profile to explore the app immediately without an account:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleGuestSelect(p)}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-pathclear-secondary hover:bg-emerald-50/40 transition-all text-left group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-gray-900 group-hover:text-pathclear-primary transition-colors truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {p.mobilityType === "visual_guide" && "Blind / Audio guidance"}
                        {p.mobilityType === "visual_partial" && "Low vision / High contrast"}
                        {p.mobilityType === "deaf" && "Deaf / Visual cues"}
                        {p.mobilityType === "wheelchair_manual" && "Manual chair (step-free)"}
                        {p.mobilityType === "wheelchair_power" && "Power chair (incline checks)"}
                        {p.mobilityType === "walker" && "Walker / Cane support"}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-pathclear-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Assistance Preview Banner */}
            <div className="mt-6 p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-900">Voice-Guided Authentication</p>
                <p className="text-xs text-blue-700 leading-relaxed mt-0.5">
                  Assisting a visually impaired traveler? Speak commands like <span className="font-semibold italic">"Sign in as blind user"</span> or <span className="font-semibold italic">"Start wheelchair mode"</span>. Live voice agent panel will connect in Phase 2.
                </p>
              </div>
            </div>

            {/* Supabase Status Note */}
            {!isSupabaseConfigured && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
                <p className="text-[11px] text-gray-500">
                  ⚡ <span className="font-bold">Local Demo Mode:</span> Authentication runs offline without requiring Supabase API keys.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-pathclear-bg">
          <div className="w-8 h-8 border-4 border-pathclear-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}