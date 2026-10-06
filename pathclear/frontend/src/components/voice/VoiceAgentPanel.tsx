"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useVoiceAgent } from "@/contexts/VoiceAgentContext";
import { useProfile } from "@/contexts/ProfileContext";
import {
  Mic,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Map,
  Navigation,
  Compass,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

export default function VoiceAgentPanel() {
  const {
    isListening,
    isSpeaking,
    isMuted,
    agentState,
    transcript,
    interimTranscript,
    messages,
    isFullScreenOverlay,
    toggleListening,
    sendMessage,
    stopSpeaking,
    toggleMute,
    setIsFullScreenOverlay,
  } = useVoiceAgent();

  const { profile, profileMode } = useProfile();
  const pathname = usePathname();
  const [inputText, setInputText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [isDockMinimized, setIsDockMinimized] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const isNavPage = pathname?.startsWith("/navigation");
  const isPlannerPage = pathname?.startsWith("/planner");
  const isBlindMode = profileMode === "blind";
  const isDeafMode = profileMode === "deaf";

  // Auto scroll chat messages to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript]);

  // Keyboard accessibility: Escape exits full screen overlay or transcript
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullScreenOverlay) {
          setIsFullScreenOverlay(false);
        } else if (showHistory) {
          setShowHistory(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreenOverlay, showHistory, setIsFullScreenOverlay]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText("");
    setShowHistory(true);
  };

  const handleQuickChip = (command: string) => {
    sendMessage(command);
    setShowHistory(true);
  };

  // =========================================================================
  // BLIND MODE: ACCESSIBILITY OVERLAY WITH LIVE MAP PREVIEW & CLEAR EXIT
  // =========================================================================
  if (isBlindMode && isFullScreenOverlay) {
    const latestMessage = messages[messages.length - 1];

    return (
      <aside
        aria-label="Audio Navigation & Spatial Voice Guide"
        className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md text-white flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200 overflow-y-auto"
      >
        {/* Top Bar: Title & High-Contrast Exit Buttons */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-950/50">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">Audio Navigation Guide</h2>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Blind Mode Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">Voice-first directional assistant with live spatial preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Direct Mute AI Toggle */}
            <button
              onClick={toggleMute}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                isMuted
                  ? "bg-rose-950/80 text-rose-300 border-rose-500/50"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
              title={isMuted ? "Voice speech muted. Click to enable" : "Mute voice assistant"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isMuted ? "Voice Muted" : "Voice Active"}</span>
            </button>

            {/* Primary Exit Button: View Live Map */}
            <button
              onClick={() => setIsFullScreenOverlay(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/50 border border-emerald-400/50 transition-all cursor-pointer"
            >
              <Map className="w-4 h-4" />
              <span>View Live Map</span>
            </button>

            {/* Compact View Button */}
            <button
              onClick={() => setIsFullScreenOverlay(false)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-colors cursor-pointer"
              title="Switch to Compact View"
              aria-label="Switch to Compact View"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Middle Section: Audio Interaction & Live Map Window Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-6 max-w-6xl mx-auto w-full items-center">
          {/* Left Column: Voice Assistant Central Controls (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-emerald-500/25 animate-ping scale-150" />
              )}
              <button
                onClick={toggleListening}
                className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center gap-2 border-4 transition-all shadow-2xl cursor-pointer ${
                  isListening
                    ? "bg-emerald-600 border-white text-white scale-105 shadow-emerald-500/50 animate-pulse"
                    : isSpeaking
                    ? "bg-blue-600 border-blue-300 text-white animate-pulse"
                    : "bg-slate-900 border-slate-700 hover:border-emerald-400 text-slate-200"
                }`}
              >
                <Mic className="w-12 h-12 sm:w-14 sm:h-14" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                  {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Tap to Speak"}
                </span>
              </button>
            </div>

            {/* High-Contrast Spoken Instruction / Transcript Banner */}
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 min-h-[140px] flex flex-col justify-center items-center shadow-xl">
              {interimTranscript ? (
                <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-300 animate-pulse leading-snug">
                  "{interimTranscript}..."
                </p>
              ) : latestMessage ? (
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-2">
                    {latestMessage.sender === "agent" ? "PathClear Audio Guidance" : "You said"}
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-black text-white leading-relaxed">
                    {latestMessage.text}
                  </p>
                </div>
              ) : (
                <p className="text-base sm:text-lg font-medium text-slate-400">
                  Tap microphone or say: <span className="text-white font-bold">"Where am I?"</span>, <span className="text-white font-bold">"What's ahead?"</span>, or <span className="text-white font-bold">"Check doorway"</span>.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Live Map Preview Window (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <div className="w-full bg-slate-900/95 border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-black text-white">Live Map Preview Window</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  GPS Tracking
                </span>
              </div>

              {/* Graphic High-Contrast Map Preview Canvas */}
              <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#0e1726] border border-slate-700/80 overflow-hidden flex flex-col justify-between p-3.5">
                {/* Visual Route Grid & Path Lines */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#4bc7b6_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* SVG Route Line Representation */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 40 130 C 100 130, 120 70, 200 60 S 260 40, 310 30"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                  />
                  <circle cx="40" cy="130" r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="310" cy="30" r="10" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                </svg>

                {/* Top Overlay Badge */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-bold">
                  <span className="bg-slate-900/90 text-cyan-300 px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
                    <Compass size={12} className="animate-spin text-cyan-400" />
                    Heading: 45° NE
                  </span>
                  <span className="bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-600/40">
                    Step-Free Verified
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="relative z-10 bg-slate-900/90 backdrop-blur-md rounded-xl p-2 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-extrabold text-white flex items-center gap-1">
                      <Navigation size={12} className="text-emerald-400" />
                      Approaching Jio World Centre
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Gentle slope 2.4% • Gate 2 Doorway Ahead
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-emerald-400 shrink-0" />
                </div>
              </div>

              {/* Action Button: Open Full Interactive Map */}
              <button
                onClick={() => setIsFullScreenOverlay(false)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Exit Audio Mode & View Full Map</span>
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Sighted companion or low-vision assistance? Tap above to return to standard map.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Quick Speech Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto w-full pt-4 border-t border-slate-800">
          {[
            { label: "Where am I?", query: "Where am I?" },
            { label: "What's ahead?", query: "What is ahead?" },
            { label: "Entrance check", query: "Check doorway" },
            { label: "Plan route", query: "Plan route" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickChip(item.query)}
              className="py-3.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm transition-all text-center cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>
    );
  }

  // =========================================================================
  // MINIMIZED FLOATING IRIS ORB (WHEN COLLAPSED TO NOT BLOCK MAP OR FOOTER)
  // =========================================================================
  if (isDockMinimized) {
    return (
      <div
        className={`fixed z-50 ${
          isNavPage ? "bottom-[92px] md:bottom-[84px] right-4" : "bottom-5 right-5"
        } flex items-center gap-2 animate-in fade-in duration-200`}
      >
        <button
          onClick={() => setIsDockMinimized(false)}
          className="flex items-center gap-2.5 bg-[#18202c]/95 hover:bg-[#202b3a] backdrop-blur-xl border border-slate-700/80 hover:border-emerald-500/70 rounded-full shadow-2xl p-1.5 pr-3.5 text-white transition-all cursor-pointer group hover:scale-105"
          title="Click to expand Voice Assistant"
          aria-label="Expand Voice Assistant"
        >
          {/* Glowing Multi-Color Iris Orb */}
          <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.45)] flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 flex items-center justify-center relative overflow-hidden">
              <div
                className={`w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-400 blur-[2px] opacity-80 ${
                  isListening || isSpeaking ? "animate-pulse scale-125" : ""
                }`}
              />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
              Voice Copilot
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {isListening ? "Listening..." : isSpeaking ? "Speaking..." : isMuted ? "Muted" : "Tap to open"}
            </span>
          </div>

          <ChevronUp size={16} className="text-slate-400 group-hover:text-emerald-400 ml-1 transition-colors" />
        </button>

        {/* Quick Unmute / Mute Toggle next to minimized orb */}
        <button
          onClick={toggleMute}
          className={`p-2 rounded-full border shadow-xl transition-all cursor-pointer ${
            isMuted
              ? "bg-rose-950/80 text-rose-300 border-rose-500/60"
              : "bg-[#18202c]/95 hover:bg-[#202b3a] text-slate-300 border-slate-700/80"
          }`}
          title={isMuted ? "Voice AI is muted. Click to unmute" : "Mute Voice AI"}
          aria-label={isMuted ? "Unmute Voice AI" : "Mute Voice AI"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    );
  }

  // =========================================================================
  // SLEEK FLOATING PILL DOCK (POSITIONED DYNAMICALLY TO AVOID BLOCKING FOOTER)
  // =========================================================================
  return (
    <div
      className={`fixed ${
        isNavPage ? "bottom-[92px] md:bottom-[84px]" : "bottom-6"
      } left-1/2 -translate-x-1/2 w-[94%] max-w-2xl z-50 flex flex-col items-center transition-all duration-300`}
    >
      {/* Deaf Profile Visual Flash Notification Alert */}
      {isDeafMode && isSpeaking && (
        <div className="mb-2 w-full p-2.5 bg-amber-400 text-black font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Navigation Alert: Visual vibration guidance active</span>
          </div>
          <span className="text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded-full font-bold">
            Alert
          </span>
        </div>
      )}

      {/* Expandable Conversation Transcript Popover */}
      {showHistory && (
        <div
          className="w-full mb-3 max-h-60 overflow-y-auto space-y-2 p-3.5 bg-[#18202c]/95 border border-slate-700/80 rounded-3xl backdrop-blur-2xl shadow-2xl text-white animate-in slide-in-from-bottom-2 duration-200"
          ref={chatScrollRef}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Voice Assistant Transcript
              </span>
              {isSpeaking && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className={`text-[11px] flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg border transition-colors ${
                  isMuted
                    ? "bg-rose-950 text-rose-300 border-rose-500/50"
                    : "text-slate-400 hover:text-white border-transparent"
                }`}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                <span>{isMuted ? "Unmute" : "Mute"}</span>
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close transcript"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="py-2 text-center">
              <p className="text-xs text-slate-400 mb-2">
                Say commands into the copilot dock:
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {[
                  "Sign in as blind user",
                  "Start wheelchair mode Dadar station",
                  "Find step-free route to BKC",
                ].map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickChip(cmd)}
                    className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors cursor-pointer"
                  >
                    "{cmd}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800/95 text-slate-200 border border-slate-700/60"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.timestamp}</span>
              </div>
            ))
          )}

          {interimTranscript && (
            <div className="flex flex-col items-end">
              <div className="max-w-[85%] rounded-2xl px-3.5 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 animate-pulse text-xs">
                "{interimTranscript}..."
              </div>
            </div>
          )}
        </div>
      )}

      {/* THE SLEEK FLOATING PILL DOCK */}
      <aside
        aria-label="PathClear Intelligent Voice Copilot"
        className="w-full bg-[#1e2530]/95 backdrop-blur-2xl border border-slate-700/80 rounded-full shadow-2xl shadow-black/60 px-3.5 py-2 text-white flex items-center gap-2.5 sm:gap-3 transition-all duration-300 hover:border-slate-600"
      >
        {/* Left: Glowing Multi-Color Iris Orb with Satellite Dot */}
        <div
          onClick={toggleListening}
          className="relative shrink-0 cursor-pointer group"
          title={isListening ? "Listening... click to pause" : "Click to speak"}
        >
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.45)] flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 flex items-center justify-center relative overflow-hidden">
              <div
                className={`w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-400 blur-[2px] opacity-80 ${
                  isListening || isSpeaking ? "animate-pulse scale-110" : ""
                }`}
              />
              <div className="absolute inset-0 rounded-full border border-cyan-400/30" />
            </div>
          </div>
          {/* Satellite Accent Dot at top-right */}
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1e2530] shadow-[0_0_6px_#34d399]" />
        </div>

        {/* Dynamic Colorful Audio Spectrum Waveform Bars */}
        <div
          aria-hidden="true"
          className="flex items-center gap-1 h-7 shrink-0 cursor-pointer"
          onClick={() => setShowHistory(!showHistory)}
          title="Click to toggle conversation transcript"
        >
          <span
            className={`w-1 bg-cyan-400 rounded-full transition-all duration-200 ${
              isListening || isSpeaking ? "animate-wave-bar" : "h-3"
            }`}
            style={{ animationDelay: "0.1s" }}
          />
          <span
            className={`w-1 bg-cyan-400 rounded-full transition-all duration-200 ${
              isListening || isSpeaking ? "animate-wave-bar" : "h-4"
            }`}
            style={{ animationDelay: "0.3s" }}
          />
          <span
            className={`w-1 bg-fuchsia-400 rounded-full transition-all duration-200 ${
              isListening || isSpeaking ? "animate-wave-bar" : "h-6"
            }`}
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className={`w-1 bg-white rounded-full transition-all duration-200 ${
              isListening || isSpeaking ? "animate-wave-bar" : "h-7"
            }`}
            style={{ animationDelay: "0.5s" }}
          />
          <span
            className={`w-1 bg-cyan-300 rounded-full transition-all duration-200 ${
              isListening || isSpeaking ? "animate-wave-bar" : "h-5"
            }`}
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className={`w-1 bg-teal-400 rounded-full transition-all duration-200 ${
              isListening || isSpeaking ? "animate-wave-bar" : "h-6"
            }`}
            style={{ animationDelay: "0.4s" }}
          />
          <span
            className={`w-1 bg-cyan-400 rounded-full transition-all duration-200 ${
              isListening || isSpeaking ? "animate-wave-bar" : "h-4"
            }`}
            style={{ animationDelay: "0.25s" }}
          />
          <span
            className={`w-1 bg-fuchsia-400/90 rounded-full transition-all duration-200 ${
              isListening || isSpeaking ? "animate-wave-bar" : "h-3"
            }`}
            style={{ animationDelay: "0.35s" }}
          />
        </div>

        {/* Command / Question Input Field */}
        <div className="flex-1 min-w-0">
          <input
            id="voice-command-input"
            className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-white placeholder-slate-400 text-xs sm:text-sm font-normal px-2 py-1"
            placeholder={
              isListening
                ? "Listening... speak command now..."
                : interimTranscript
                ? interimTranscript
                : "Speak command or ask PathClear..."
            }
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />
        </div>

        {/* Action Button: Mute / Unmute Toggle */}
        <button
          type="button"
          onClick={toggleMute}
          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all shrink-0 cursor-pointer ${
            isMuted
              ? "bg-rose-950/80 border-rose-500/80 text-rose-300"
              : "bg-[#18202b] hover:bg-slate-700/80 border-slate-700/80 text-slate-300 hover:text-white"
          }`}
          title={isMuted ? "AI speech is muted. Click to unmute" : "Click to mute AI voice"}
          aria-label={isMuted ? "Unmute AI voice" : "Mute AI voice"}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Action Button: "Voice" Pill */}
        <button
          id="toggle-mic-btn"
          type="button"
          onClick={toggleListening}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            isListening
              ? "bg-rose-950/80 border-rose-500/80 text-rose-200 animate-pulse"
              : "bg-[#18202b] hover:bg-slate-700/80 border-slate-700/80 text-slate-200"
          }`}
        >
          <span className="flex items-center text-rose-400">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </span>
          <span className="text-white hidden sm:inline">{isListening ? "Listening..." : "Voice"}</span>
        </button>

        {/* Action Button: Circular Emerald Send Button */}
        <button
          type="button"
          onClick={() => handleSend()}
          aria-label="Send command"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
        >
          <svg
            className="w-4 h-4 -rotate-12 translate-x-px text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>

        {/* Action Button: Minimize / Tuck Away Dock */}
        <button
          type="button"
          onClick={() => setIsDockMinimized(true)}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
          title="Minimize Voice Bar (Leaves map and buttons visible)"
          aria-label="Minimize Voice Bar"
        >
          <ChevronDown size={15} />
        </button>
      </aside>
    </div>
  );
}
