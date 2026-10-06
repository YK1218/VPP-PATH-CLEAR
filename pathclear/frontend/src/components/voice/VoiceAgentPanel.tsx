"use client";

import React, { useState, useRef, useEffect } from "react";
import { useVoiceAgent } from "@/contexts/VoiceAgentContext";
import { useProfile } from "@/contexts/ProfileContext";
import {
  Mic,
  VolumeX,
  Minimize2,
  AlertTriangle,
  X,
  MessageSquare
} from "lucide-react";

export default function VoiceAgentPanel() {
  const {
    isListening,
    isSpeaking,
    agentState,
    transcript,
    interimTranscript,
    messages,
    isFullScreenOverlay,
    toggleListening,
    sendMessage,
    stopSpeaking,
    setIsFullScreenOverlay,
  } = useVoiceAgent();

  const { profile, profileMode } = useProfile();
  const [inputText, setInputText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat messages to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript]);

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

  const isBlindMode = profileMode === "blind";
  const isDeafMode = profileMode === "deaf";

  // =========================================================================
  // BLIND MODE: FULL-SCREEN ACCESSIBILITY OVERLAY
  // =========================================================================
  if (isBlindMode && isFullScreenOverlay) {
    const latestMessage = messages[messages.length - 1];

    return (
      <aside
        aria-label="Audio Navigation & Voice Assistant"
        className="fixed inset-0 z-[120] bg-black text-white flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-200 select-none"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Audio Navigation Mode</h2>
              <p className="text-sm text-zinc-400">Voice-first assistant active</p>
            </div>
          </div>

          <button
            onClick={() => setIsFullScreenOverlay(false)}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm border border-zinc-700 transition-colors"
          >
            <Minimize2 className="w-4 h-4 inline mr-1.5" />
            Compact View
          </button>
        </div>

        <div className="flex flex-col items-center justify-center my-auto py-8 text-center max-w-2xl mx-auto w-full">
          <div className="relative mb-8">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping scale-150" />
            )}
            <button
              onClick={toggleListening}
              className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center gap-2 border-4 transition-all shadow-2xl ${
                isListening
                  ? "bg-emerald-600 border-white text-white scale-105 shadow-emerald-500/40"
                  : isSpeaking
                  ? "bg-blue-600 border-blue-300 text-white animate-pulse"
                  : "bg-zinc-900 border-zinc-700 hover:border-emerald-400 text-zinc-200"
              }`}
            >
              <Mic className="w-14 h-14 sm:w-16 sm:h-16" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Tap to Speak"}
              </span>
            </button>
          </div>

          <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 min-h-[160px] flex flex-col justify-center items-center">
            {interimTranscript ? (
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 animate-pulse leading-snug">
                "{interimTranscript}..."
              </p>
            ) : latestMessage ? (
              <div>
                <p className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-2">
                  {latestMessage.sender === "agent" ? "PathClear Voice Guide" : "You said"}
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-relaxed">
                  {latestMessage.text}
                </p>
              </div>
            ) : (
              <p className="text-xl font-medium text-zinc-500">
                Tap the microphone or say: "Where am I?", "What's ahead?", or "Plan route".
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto w-full pt-4 border-t border-zinc-800">
          {[
            { label: "Where am I?", query: "Where am I?" },
            { label: "What's ahead?", query: "What is ahead?" },
            { label: "Entrance check", query: "Check doorway" },
            { label: "Plan route", query: "Plan route" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickChip(item.query)}
              className="py-4 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm transition-all text-center"
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>
    );
  }

  // =========================================================================
  // SLEEK FLOATING PILL DOCK (EXACTLY MATCHING USER SCREENSHOT)
  // =========================================================================
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl z-50 flex flex-col items-center">
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
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                >
                  <VolumeX size={13} />
                  Mute
                </button>
              )}
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
                    className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
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
        className="w-full bg-[#1e2530]/95 backdrop-blur-2xl border border-slate-700/80 rounded-full shadow-2xl shadow-black/60 px-3.5 py-2 text-white flex items-center gap-3 transition-all duration-300 hover:border-slate-600"
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

        {/* Action Button: "Voice" Pill */}
        <button
          id="toggle-mic-btn"
          type="button"
          onClick={toggleListening}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all shrink-0 cursor-pointer ${
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
          <span className="text-white">{isListening ? "Listening..." : "Voice"}</span>
        </button>

        {/* Action Button: Circular Emerald Send Button */}
        <button
          type="button"
          onClick={() => handleSend()}
          aria-label="Send command"
          className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
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
      </aside>
    </div>
  );
}
