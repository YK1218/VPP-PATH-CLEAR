"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { AccessibilityProfile } from "@/types";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Check, 
  ArrowRight,
  Mic
} from "lucide-react";
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
  const { profile: activeProfile, setProfile, presets } = useProfile();

  const redirect = searchParams.get("redirect") || "/";
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("student@scholarsync.edu");
  const [password, setPassword] = useState("PathClear2026!#");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMobility, setSelectedMobility] = useState("wheelchair_manual");
  const [error, setError] = useState("");
  const [highContrast, setHighContrast] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Initialize selected language from Google Translate cookie
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match && match[1]) {
      setSelectedLanguage(match[1]);
    }
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    
    // Set Google Translate cookie
    if (lang === "en") {
      document.cookie = "googtrans=/en/en; path=/";
      document.cookie = `googtrans=/en/en; domain=${window.location.hostname}; path=/`;
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/`;
      document.cookie = `googtrans=/en/${lang}; domain=${window.location.hostname}; path=/`;
    }
    
    // Reload to apply translation via the layout.tsx script
    window.location.reload();
  };

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

  const handleSelectProfile = (guestProfile: AccessibilityProfile) => {
    setProfile(guestProfile);
    setSelectedMobility(guestProfile.mobilityType);
  };

  const handleProceedAsGuest = () => {
    continueAsGuest(activeProfile.mobilityType);
    router.push(redirect);
  };

  // Helper metadata mapping for guest cards
  const getProfileMeta = (mobilityType: string) => {
    switch (mobilityType) {
      case "wheelchair_manual":
        return {
          emoji: "♿",
          badge: "1:12 Max",
          badgeClass: "bg-blue-100 text-blue-700",
          iconBg: "bg-blue-100/70 text-blue-800",
          desc: "Step-free routes, gentle ramps, curb cuts",
        };
      case "wheelchair_power":
        return {
          emoji: "🦼",
          badge: "Elevator Sync",
          badgeClass: "bg-indigo-100 text-indigo-700",
          iconBg: "bg-indigo-100/70 text-indigo-800",
          desc: "Wide turning radius, incline telemetry checks",
        };
      case "walker":
        return {
          emoji: "🦯",
          badge: "Rest Benches",
          badgeClass: "bg-amber-100 text-amber-800",
          iconBg: "bg-amber-100/70 text-amber-800",
          desc: "Handrail availability, minimal stairs cadence",
        };
      case "visual_guide":
        return {
          emoji: "👁️",
          badge: "Audio 3D",
          badgeClass: "bg-teal-100 text-teal-800",
          iconBg: "bg-teal-100/70 text-teal-800",
          desc: "Tactile paving guide, beacon turn alerts",
        };
      case "visual_partial":
        return {
          emoji: "🔍",
          badge: "High Contrast",
          badgeClass: "bg-emerald-200/90 text-emerald-900",
          iconBg: "bg-emerald-600 text-white",
          desc: "High contrast, 18pt typography & zoomed maps",
        };
      case "deaf":
        return {
          emoji: "🧏",
          badge: "Visual Cues",
          badgeClass: "bg-purple-100 text-purple-800",
          iconBg: "bg-purple-100/70 text-purple-800",
          desc: "Visual vibration alerts, digital signage sync",
        };
      default:
        return {
          emoji: "🚶",
          badge: "Standard",
          badgeClass: "bg-slate-100 text-slate-700",
          iconBg: "bg-slate-100 text-slate-800",
          desc: "Accessible pedestrian guidance",
        };
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-topo-pattern text-slate-800 font-sans antialiased relative selection:bg-emerald-500 selection:text-white ${
        highContrast ? "contrast-125 filter" : ""
      }`}
    >
      {/* Top Header Navbar (Matching Image Exactly) */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-emerald-100/80 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Branding & Status */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              aria-label="PathClear Navigation Home"
              className="flex items-center gap-3 group focus:outline-none focus:ring-4 focus:ring-emerald-500/40 rounded-xl p-1"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-800 to-slate-900 flex items-center justify-center shadow-lg shadow-emerald-950/20 text-white relative overflow-hidden group-hover:scale-105 transition-transform">
                <svg
                  className="w-6 h-6 text-emerald-300"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.3"
                  viewBox="0 0 24 24"
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-900 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  PathClear
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                    Transit
                  </span>
                </span>
                <span className="text-xs text-slate-500 font-medium tracking-wide">
                  Mumbai Accessible Mobility System
                </span>
              </div>
            </Link>
          </div>

          {/* Compliance Cues & Accessibility Settings Bar */}
          <div className="flex items-center gap-3">
            {/* Live Audio Guidance Badge */}
            <div
              aria-live="polite"
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-bold"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Audio Assist: Ready</span>
            </div>

            {/* WCAG AAA Badge */}
            <span
              className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
              title="WCAG 2.2 AAA Compliant Accessibility Standards"
            >
              WCAG AAA
            </span>

            {/* Language Selector */}
            <div className="relative">
              <label className="sr-only" htmlFor="lang-selector">
                Choose Language
              </label>
              <select
                id="lang-selector"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="h-10 pl-3 pr-8 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
              >
                <option value="en">English (US)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              id="toggle-contrast-btn"
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              aria-label="Toggle High Contrast Display"
              className={`h-10 px-3.5 flex items-center gap-2 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/50 cursor-pointer ${
                highContrast
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-800 text-slate-700"
              }`}
            >
              <svg
                className={`w-4 h-4 ${highContrast ? "text-emerald-400" : "text-slate-900"}`}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" />
              </svg>
              <span className="hidden lg:inline">High Contrast</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 pb-12 flex-1 flex flex-col justify-center">
        {/* Hero Card Container (From Stitch Remix Design) */}
        <div className="bg-white/85 backdrop-blur-xl border border-emerald-100/80 shadow-2xl shadow-emerald-950/10 rounded-3xl p-6 sm:p-10 transition-all duration-300">
          
          {/* Top Meta Header Inside Card */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-500">
                Authentication & Profile Setup
              </span>
            </div>
            
            <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium flex items-center gap-1.5 border border-slate-200/60">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Tactile & Screen Reader Optimized</span>
            </div>
          </div>

          {/* Title & Value Statement */}
          <div className="text-center mt-6 mb-8 max-w-xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isSignUp ? "Create Your Accessible Profile" : "Welcome to PathClear"}
            </h1>
            <p className="text-slate-600 text-base mt-2">
              {isSignUp
                ? "Register your mobility constraints for micro-segment routing, gentle ramps, and elevator synchronization."
                : "Sign in to access your saved accessible routes, live tactile maps, and community crowd-verified obstacle alerts."}
            </p>
          </div>

          {/* Dual Mode Selector Tab: Sign In / Create Account */}
          <div className="max-w-md mx-auto mb-8 bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={!isSignUp}
              onClick={() => {
                setIsSignUp(false);
                setError("");
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all focus:ring-2 focus:ring-emerald-500 ${
                !isSignUp
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignUp}
              onClick={() => {
                setIsSignUp(true);
                setError("");
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all focus:ring-2 focus:ring-emerald-500 ${
                isSignUp
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 animate-in fade-in duration-200"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-extrabold tracking-wider text-slate-600 uppercase" htmlFor="email-address">
                  Email Address
                </label>
              </div>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email-address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-2xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-extrabold tracking-wider text-slate-600 uppercase" htmlFor="password-input">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-bold text-emerald-700 hover:underline focus:outline-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={8}
                  className="block w-full pl-11 pr-11 py-3.5 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-2xl text-slate-900 font-medium text-sm tracking-widest focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-extrabold tracking-wider text-slate-600 uppercase mb-1.5" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={8}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-2xl text-slate-900 font-medium text-sm tracking-widest focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all"
                    disabled={submitting}
                  />
                </div>
              </div>
            )}

            {/* Mobility Profile Radio Selector (Sign Up only) */}
            {isSignUp && (
              <fieldset className="pt-2">
                <legend className="block text-xs font-extrabold tracking-wider text-slate-600 uppercase mb-2">
                  Select Primary Mobility Profile
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((p) => {
                    const isSelected = selectedMobility === p.mobilityType;
                    const meta = getProfileMeta(p.mobilityType);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedMobility(p.mobilityType)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "border-2 border-emerald-600 bg-emerald-50/90 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base">{meta.emoji}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className={`text-xs font-bold leading-tight ${isSelected ? "text-emerald-950" : "text-slate-800"}`}>
                          {p.name}
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
              className="w-full mt-2 py-4 px-6 rounded-2xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:scale-[1.01] transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? "Create Account & Start" : "Sign In to PathClear"}</span>
                  <ArrowRight size={18} className="text-emerald-300" />
                </>
              )}
            </button>
          </form>

          {/* Instant Preview As Guest Divider */}
          <div className="relative my-10 max-w-2xl mx-auto text-center">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/95 px-4 text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                Or Instant Preview as Guest
              </span>
            </div>
          </div>

          {/* Guest Persona Profiles Matrix (From Stitch Remix Design) */}
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-xs text-slate-500 mb-6 font-medium">
              Choose a tailored assistive profile to explore Dadar &amp; BKC stations immediately without logging in:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {presets.map((p) => {
                const meta = getProfileMeta(p.mobilityType);
                const isCurrentActive = activeProfile.id === p.id;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProfile(p)}
                    className={`group p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between focus:ring-4 focus:ring-emerald-500/20 cursor-pointer ${
                      isCurrentActive
                        ? "bg-emerald-50/90 border-2 border-emerald-600 shadow-sm"
                        : "bg-white hover:bg-emerald-50/40 border-slate-200 hover:border-emerald-500 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform ${meta.iconBg}`}
                      >
                        {meta.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span className="truncate">{p.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${meta.badgeClass}`}>
                            {meta.badge}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 leading-snug truncate">
                          {meta.desc}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isCurrentActive
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-400 group-hover:text-emerald-700 group-hover:bg-emerald-100/60"
                      }`}
                    >
                      {isCurrentActive ? <Check size={16} strokeWidth={2.5} /> : <ArrowRight size={16} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Profile Confirmation & Exploration Action */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${getProfileMeta(activeProfile.mobilityType).iconBg}`}>
                  {getProfileMeta(activeProfile.mobilityType).emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">
                      Selected Profile
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">{activeProfile.name}</p>
                  <p className="text-xs text-slate-600">{getProfileMeta(activeProfile.mobilityType).desc}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedAsGuest}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-950/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore as Guest ({activeProfile.name})</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Voice-Guided Authentication Note Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Mic className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-blue-950 font-bold block">Hands-Free Accessibility Active</strong>
                Say commands into the copilot dock below:{" "}
                <em className="text-blue-900 font-semibold">"Sign in as blind user"</em> or{" "}
                <em className="text-blue-900 font-semibold">"Start wheelchair mode Dadar station"</em>.
              </div>
            </div>
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
        <div className="min-h-screen flex items-center justify-center bg-topo-pattern">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}