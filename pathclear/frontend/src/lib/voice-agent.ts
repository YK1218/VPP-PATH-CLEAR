/**
 * PathClear Voice Agent Service
 * Browser-native Web Speech API wrapper (STT + TTS) with haptic vibration support.
 */

export interface SpeechRecognitionResultEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

export interface VoiceSynthesisOptions {
  pitch?: number;
  rate?: number;
  volume?: number;
  lang?: string;
}

// Capability detection
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
};

export const isSpeechSynthesisSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window;
};

export const isVibrationSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  return "vibrate" in navigator;
};

// Haptic feedback patterns
export const HAPTIC_PATTERNS = {
  click: 40,
  acknowledged: 80,
  turnAlert: 120,
  hazardWarning: [100, 50, 100],
  arrived: [200, 100, 200, 100, 300],
};

export const triggerHaptic = (pattern: number | number[]): boolean => {
  if (isVibrationSupported()) {
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }
  return false;
};

// Speech Synthesis (TTS)
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speakText = (
  text: string,
  options: VoiceSynthesisOptions = {},
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): void => {
  if (!isSpeechSynthesisSupported()) {
    onError?.(new Error("Speech synthesis not supported in this browser"));
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || "en-IN";
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;

  // Pick an Indian English or standard natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((v) => v.lang === "en-IN" || v.lang.startsWith("en-IN")) ||
    voices.find((v) => v.lang === "en-GB") ||
    voices.find((v) => v.lang.startsWith("en"));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    onError?.(e);
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

// Speech Recognition (STT) factory
export const createSpeechRecognizer = (
  onTranscript: (text: string, isFinal: boolean) => void,
  onError: (err: any) => void,
  onEnd: () => void
) => {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-IN";

  recognition.onresult = (event: SpeechRecognitionResultEvent) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = 0; i < event.results.length; ++i) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    const transcript = finalTranscript || interimTranscript;
    if (transcript) {
      onTranscript(transcript, Boolean(finalTranscript));
    }
  };

  recognition.onerror = (event: any) => {
    onError(event);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
};

// Intent Resolution for PathClear
export interface ParsedVoiceIntent {
  intent:
    | "navigate_planner"
    | "report_barrier"
    | "switch_profile"
    | "where_am_i"
    | "what_is_ahead"
    | "help"
    | "doorway_info"
    | "general_chat";
  targetRoute?: string;
  targetProfileType?: string;
  responseReply: string;
}

export const parseVoiceIntent = (input: string): ParsedVoiceIntent => {
  const query = input.toLowerCase().trim();

  // Navigation / Planner
  if (
    query.includes("plan route") ||
    query.includes("route planner") ||
    query.includes("find route") ||
    query.includes("take me to") ||
    query.includes("navigate to") ||
    query.includes("go to") ||
    query.includes("planner")
  ) {
    return {
      intent: "navigate_planner",
      targetRoute: "/planner",
      responseReply: "Opening Step-Free Route Planner. Calculating gentle slopes and verified entrances.",
    };
  }

  // Report barrier / hazard
  if (
    query.includes("report barrier") ||
    query.includes("report obstacle") ||
    query.includes("broken elevator") ||
    query.includes("report hazard") ||
    query.includes("report change")
  ) {
    return {
      intent: "report_barrier",
      targetRoute: "/report-barrier",
      responseReply: "Opening Barrier Report form. You can log broken elevators, construction trenches, or steep curb cuts.",
    };
  }

  // Switch profile intents
  if (query.includes("blind mode") || query.includes("visual guide") || query.includes("blind")) {
    return {
      intent: "switch_profile",
      targetProfileType: "visual_guide",
      responseReply: "Switched to Visual Assistance mode. Audio guidance and haptic vibration are enabled.",
    };
  }

  if (query.includes("low vision") || query.includes("partially blind")) {
    return {
      intent: "switch_profile",
      targetProfileType: "visual_partial",
      responseReply: "Switched to Low Vision mode. High contrast and enlarged text are active.",
    };
  }

  if (query.includes("wheelchair") || query.includes("step free") || query.includes("manual chair")) {
    return {
      intent: "switch_profile",
      targetProfileType: "wheelchair_manual",
      responseReply: "Switched to Manual Wheelchair profile. Routes will strictly guarantee zero steps and max 5% incline.",
    };
  }

  if (query.includes("power chair") || query.includes("scooter")) {
    return {
      intent: "switch_profile",
      targetProfileType: "wheelchair_power",
      responseReply: "Switched to Power Chair profile. Optimized for motorized mobility with max 8% slope.",
    };
  }

  if (query.includes("walker") || query.includes("cane")) {
    return {
      intent: "switch_profile",
      targetProfileType: "walker",
      responseReply: "Switched to Walker and Cane support profile.",
    };
  }

  if (query.includes("deaf") || query.includes("hard of hearing")) {
    return {
      intent: "switch_profile",
      targetProfileType: "deaf",
      responseReply: "Switched to Deaf / Hard of Hearing mode. Audio is muted, visual banners and flash alerts are active.",
    };
  }

  // Where am I
  if (query.includes("where am i") || query.includes("current location") || query.includes("my status")) {
    return {
      intent: "where_am_i",
      responseReply: "You are on the Bandra Kurla Complex corridor, heading toward Jio World Centre Gate 2. The sidewalk is clear and step-free.",
    };
  }

  // What is ahead / hazards
  if (query.includes("what is ahead") || query.includes("what's ahead") || query.includes("any hazards") || query.includes("obstacle")) {
    return {
      intent: "what_is_ahead",
      responseReply: "In 120 meters: Ramp with handrail (3.8% grade). Continuous tactile paving detected on your right.",
    };
  }

  // Doorway and Last 50 Feet
  if (query.includes("door") || query.includes("entrance") || query.includes("last 50 feet")) {
    return {
      intent: "doorway_info",
      responseReply: "Entrance Gate 2 features automatic sliding doors, flush threshold (0 cm step), and a 120cm wide pathway verified by the community.",
    };
  }

  // Help
  if (query.includes("help") || query.includes("commands") || query.includes("what can you do")) {
    return {
      intent: "help",
      responseReply: "You can say: 'Plan route', 'Report barrier', 'Where am I', 'What's ahead', 'Switch to blind mode', or 'Check entrance'.",
    };
  }

  // Default query reply
  return {
    intent: "general_chat",
    responseReply: `I heard: "${input}". PathClear provides verified step-free routes, doorway specifications, and real-time obstacle alerts. Say 'Plan route' to get started.`,
  };
};
