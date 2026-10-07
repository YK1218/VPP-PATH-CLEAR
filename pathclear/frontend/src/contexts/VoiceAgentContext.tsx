"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  createSpeechRecognizer,
  speakText,
  stopSpeech,
  triggerHaptic,
  parseVoiceIntent,
  HAPTIC_PATTERNS,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from "@/lib/voice-agent";
import { smartGeocodeLocation } from "@/lib/geocoding";
import { useProfile } from "@/contexts/ProfileContext";

export interface VoiceChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}

export type AgentStatus = "idle" | "listening" | "thinking" | "speaking";

interface VoiceAgentContextValue {
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  agentState: AgentStatus;
  transcript: string;
  interimTranscript: string;
  messages: VoiceChatMessage[];
  isPanelOpen: boolean;
  isFullScreenOverlay: boolean;
  speechSupported: boolean;
  ttsSupported: boolean;
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  sendMessage: (text: string) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  toggleMute: () => void;
  setIsMuted: (muted: boolean) => void;
  setIsPanelOpen: (open: boolean) => void;
  setIsFullScreenOverlay: (full: boolean) => void;
  clearMessages: () => void;
}

const VoiceAgentContext = createContext<VoiceAgentContextValue | null>(null);

const INITIAL_MESSAGES: VoiceChatMessage[] = [
  {
    id: "init-1",
    sender: "agent",
    text: "Hello! I am your PathClear accessibility guide. Ask me for step-free routes, obstacle alerts, or doorway details.",
    timestamp: "Just now",
  },
];

export function VoiceAgentProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, profileMode, setProfile, presets } = useProfile();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [agentState, setAgentState] = useState<AgentStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [messages, setMessages] = useState<VoiceChatMessage[]>(INITIAL_MESSAGES);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFullScreenOverlay, setIsFullScreenOverlay] = useState(false);

  const recognitionRef = useRef<any>(null);
  const speechSupported = isSpeechRecognitionSupported();
  const ttsSupported = isSpeechSynthesisSupported();

  // If blind mode is selected, default full screen overlay on
  useEffect(() => {
    if (profileMode === "blind") {
      setIsFullScreenOverlay(true);
    }
  }, [profileMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      // If muted, cancel and don't speak
      if (isMutedRef.current) return;

      // If deaf profile, mute TTS and prefer visual banners
      if (profileMode === "deaf") {
        triggerHaptic(HAPTIC_PATTERNS.acknowledged);
        return;
      }

      setIsSpeaking(true);
      setAgentState("speaking");

      speakText(
        text,
        { rate: 1.0, lang: "en-IN" },
        () => {
          setIsSpeaking(true);
          setAgentState("speaking");
        },
        () => {
          setIsSpeaking(false);
          setAgentState("idle");
        },
        () => {
          setIsSpeaking(false);
          setAgentState("idle");
        }
      );
    },
    [profileMode]
  );

  const stopSpeaking = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
    if (agentState === "speaking") {
      setAgentState("idle");
    }
  }, [agentState]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      if (next) {
        stopSpeech();
        setIsSpeaking(false);
        setAgentState("idle");
      }
      return next;
    });
  }, []);

  const handleProcessIntent = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: VoiceChatMessage = {
        id: `msg-${Date.now()}-user`,
        sender: "user",
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setAgentState("thinking");
      triggerHaptic(HAPTIC_PATTERNS.acknowledged);

      // Parse intent
      const parsed = parseVoiceIntent(trimmed);

      // Execute side-effects if matched
      if (parsed.targetRoute) {
        // If this is a navigation intent with an extracted destination, do async geocoding
        // to embed accurate lat/lng in the URL before navigating
        if (parsed.intent === "navigate_planner" && parsed.extractedDestination) {
          try {
            const geoResult = await smartGeocodeLocation(parsed.extractedDestination, "Mumbai");
            if (geoResult) {
              const params = new URLSearchParams({ dest: geoResult.name || parsed.extractedDestination });
              params.set("lat", geoResult.lat.toString());
              params.set("lng", geoResult.lng.toString());
              router.push(`/planner?${params.toString()}`);
            } else {
              router.push(parsed.targetRoute);
            }
          } catch {
            // Fall back to the already-built route with preset lat/lng
            router.push(parsed.targetRoute);
          }
        } else {
          router.push(parsed.targetRoute);
        }
      }

      if (parsed.targetProfileType) {
        const found = presets.find((p) => p.mobilityType === parsed.targetProfileType);
        if (found) {
          setProfile(found);
        }
      }

      // Add agent reply
      const agentMsg: VoiceChatMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: "agent",
        text: parsed.responseReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Speak back
      speak(parsed.responseReply);
    },
    [presets, router, setProfile, speak]
  );

  const startListening = useCallback(() => {
    if (!speechSupported) {
      alert("Speech recognition is not supported in this browser. You can type commands directly.");
      return;
    }

    stopSpeaking();
    setTranscript("");
    setInterimTranscript("");

    try {
      const recognizer = createSpeechRecognizer(
        (text, isFinal) => {
          if (isFinal) {
            setTranscript(text);
            setInterimTranscript("");
            setIsListening(false);
            setAgentState("idle");
            handleProcessIntent(text);
          } else {
            setInterimTranscript(text);
          }
        },
        (err) => {
          console.warn("Speech recognition error:", err);
          setIsListening(false);
          setAgentState("idle");
        },
        () => {
          setIsListening(false);
          setAgentState((prev) => (prev === "listening" ? "idle" : prev));
        }
      );

      if (recognizer) {
        recognitionRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
        setAgentState("listening");
        triggerHaptic(HAPTIC_PATTERNS.click);
      }
    } catch (err) {
      console.error("Failed to start voice recognition:", err);
      setIsListening(false);
      setAgentState("idle");
    }
  }, [handleProcessIntent, speechSupported, stopSpeaking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setAgentState("idle");
    triggerHaptic(HAPTIC_PATTERNS.click);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const sendMessage = useCallback(
    (text: string) => {
      stopSpeaking();
      handleProcessIntent(text);
    },
    [handleProcessIntent, stopSpeaking]
  );

  const clearMessages = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
  }, []);

  const value = useMemo(
    () => ({
      isListening,
      isSpeaking,
      agentState,
      transcript,
      interimTranscript,
      messages,
      isPanelOpen,
      isFullScreenOverlay,
      isMuted,
      speechSupported,
      ttsSupported,
      toggleListening,
      startListening,
      stopListening,
      sendMessage,
      speak,
      stopSpeaking,
      toggleMute,
      setIsMuted,
      setIsPanelOpen,
      setIsFullScreenOverlay,
      clearMessages,
    }),
    [
      isListening,
      isSpeaking,
      isMuted,
      agentState,
      transcript,
      interimTranscript,
      messages,
      isPanelOpen,
      isFullScreenOverlay,
      speechSupported,
      ttsSupported,
      toggleListening,
      startListening,
      stopListening,
      sendMessage,
      speak,
      stopSpeaking,
      toggleMute,
      setIsPanelOpen,
      setIsFullScreenOverlay,
      clearMessages,
    ]
  );

  return <VoiceAgentContext.Provider value={value}>{children}</VoiceAgentContext.Provider>;
}

export function useVoiceAgent() {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error("useVoiceAgent must be used within a VoiceAgentProvider");
  }
  return context;
}
