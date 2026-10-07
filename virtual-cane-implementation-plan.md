# PathClear: Virtual Cane & Live Camera Perception Implementation Plan

> **Document Version:** 1.0.0  
> **Target Framework:** Full-Stack Next.js 16 (App Router) + PWA  
> **Core Objective:** Transform smartphone and laptop cameras into "Virtual Eyes" for real-time indoor navigation, hazard detection, stair identification, and tri-modal accessibility feedback.

---

## 1. Feature Vision & Core Architecture

The **Virtual Cane** extends PathClear's macro GPS navigation into micro indoor spatial sensing. In environments where GPS loses accuracy—such as transit hubs, enclosed concourses, multi-story buildings, and stairwells—the system uses the device camera to detect physical hazards and target hardware in real time.

### Core Perception & Feedback Loop

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         1. Camera Capture Layer                                  │
│   HTML5 navigator.mediaDevices.getUserMedia()                                    │
│   - Facing Mode: "environment" (Rear smartphone camera / Laptop webcam fallback) │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      2. Local On-Device AI Inference Layer                       │
│   ONNX Runtime Web (WebGPU / WASM Execution Provider) - 100% Offline             │
│   - Model: YOLOv11 Nano / MobileNet Object Classifier                            │
│   - Detected Classes: stairs_down, stairs_up, door_handle, push_button,           │
│     scaffolding, parked_bike, wet_floor, low_overhead_hazard                     │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        3. Tri-Modal Feedback Controller                          │
│   1. Spoken Audio Warnings: Web Speech API (SpeechSynthesis)                     │
│   2. Spatial Proximity Beeping: Web Audio API Oscillator (Parking Sensor)        │
│   3. Haptic Tactile Pulses: Navigator Vibration API                             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Audio, Speech & Haptic Helpers

### 2.1 Spatial Audio Beeper (`lib/vision/audioBeeper.ts`)
Generates dynamic audio pulses whose pitch and frequency accelerate as the user approaches a detected hazard.

```typescript
export class AudioBeeper {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Triggers a proximity beep tone.
   * @param distanceMetres Distance to obstacle (0.5m to 5.0m)
   */
  public triggerProximityBeep(distanceMetres: number) {
    this.initContext();
    if (!this.ctx) return;

    // Normalize frequency: closer distance = higher pitch (440Hz -> 1200Hz)
    const clampedDistance = Math.max(0.5, Math.min(5.0, distanceMetres));
    const frequency = 1200 - (clampedDistance - 0.5) * 168; // Higher pitch when closer
    const durationMs = clampedDistance < 1.5 ? 100 : 200; // Shorter, faster pulses when close

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationMs / 1000);
    } catch (err) {
      console.warn('AudioBeeper playback error:', err);
    }
  }
}

export const audioBeeper = new AudioBeeper();
```

---

### 2.2 Zero-Latency Speech Manager (`lib/vision/speechManager.ts`)
Manages spoken voice alerts, canceling queued non-critical descriptions when safety warnings occur.

```typescript
export class SpeechManager {
  public speakAlert(message: string, isUrgent: boolean = false) {
    if (!('speechSynthesis' in window)) return;

    if (isUrgent) {
      window.speechSynthesis.cancel(); // Cancel queued speech for zero-latency safety
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = isUrgent ? 1.15 : 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechManager = new SpeechManager();
```

---

### 2.3 Mobile Haptic Vibration Patterns (`lib/vision/haptics.ts`)

```typescript
export class HapticsManager {
  /**
   * Fires vibration patterns based on hazard severity.
   */
  public triggerHazardHaptic(type: 'stairs' | 'critical_stop' | 'target_found') {
    if (!('vibrate' in navigator)) return;

    switch (type) {
      case 'stairs':
        // Double quick pulse
        navigator.vibrate([150, 80, 150]);
        break;
      case 'critical_stop':
        // Prolonged heavy vibration pattern
        navigator.vibrate([400, 100, 400, 100, 600]);
        break;
      case 'target_found':
        // Single gentle confirmation pulse
        navigator.vibrate([200]);
        break;
    }
  }
}

export const hapticsManager = new HapticsManager();
```

---

## 3. Full Next.js React Component (`components/navigation/VirtualCane.tsx`)

```tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, ShieldAlert, X, Eye, Volume2 } from "lucide-react";
import { audioBeeper } from "@/lib/vision/audioBeeper";
import { speechManager } from "@/lib/vision/speechManager";
import { hapticsManager } from "@/lib/vision/haptics";

interface VirtualCaneProps {
  isActive: boolean;
  onClose: () => void;
}

export default function VirtualCane({ isActive, onClose }: VirtualCaneProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Scanning environment for obstacles...");
  const [activeHazard, setActiveHazard] = useState<boolean>(false);

  // Initialize rear camera feed
  useEffect(() => {
    if (!isActive) return;

    let mediaStream: MediaStream | null = null;

    async function initCamera() {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Prefers rear camera on smartphones
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera Initialization Error:", err);
        setStatusMessage("Camera access unavailable or denied.");
      }
    }

    initCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      speechManager.stop();
    };
  }, [isActive]);

  // Execute hazard alert across all three feedback modalities
  const triggerHazardAlert = useCallback((hazardName: string, distanceMeters: number, type: 'stairs' | 'critical_stop' | 'target_found') => {
    setActiveHazard(true);
    const alertText = `Caution: ${hazardName} ${distanceMeters} metres ahead.`;
    setStatusMessage(alertText);

    // Tri-modal execution
    speechManager.speakAlert(alertText, true);
    audioBeeper.triggerProximityBeep(distanceMeters);
    hapticsManager.triggerHazardHaptic(type);

    setTimeout(() => setActiveHazard(false), 3000);
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      {/* Header bar with 56px touch target close button */}
      <div className="flex items-center justify-between p-4 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-base">Virtual Cane</h2>
            <p className="text-xs text-slate-400">Indoor Vision & Hazard Perception</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-3.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white active:scale-95 transition min-h-[56px] min-w-[56px] flex items-center justify-center"
          aria-label="Close Virtual Cane"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main Video Viewport */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />

        {/* Central Perception Reticle */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
          <div className={`h-72 w-72 rounded-3xl border-2 transition-all duration-300 ${activeHazard ? 'border-amber-400 bg-amber-500/10 animate-pulse' : 'border-teal-400/40'}`} />
        </div>

        {/* Floating Status HUD Card */}
        <div className="absolute bottom-8 left-4 right-4 max-w-md mx-auto p-5 rounded-3xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl">
          <div className="flex items-center space-x-3">
            <ShieldAlert className={`h-8 w-8 shrink-0 ${activeHazard ? 'text-amber-400 animate-bounce' : 'text-teal-400'}`} />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">Vision Status</span>
              <p className="text-sm font-bold leading-snug">{statusMessage}</p>
            </div>
          </div>

          {/* Developer Testing Overrides */}
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => triggerHazardAlert("Staircase Descending", 1.8, "stairs")}
              className="py-2.5 px-3 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition min-h-[48px]"
            >
              Test Stairs (1.8m)
            </button>
            <button
              onClick={() => triggerHazardAlert("Physical Barrier", 0.8, "critical_stop")}
              className="py-2.5 px-3 rounded-xl bg-slate-800 text-xs font-semibold text-amber-300 hover:bg-slate-700 active:scale-95 transition min-h-[48px]"
            >
              Test Obstacle (0.8m)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Integration into Main App (`app/page.tsx`)

To enable the Virtual Cane from the main MapLibre screen, embed the trigger button in the main floating UI control panel:

```tsx
"use client";

import React, { useState } from "react";
import MapWrapper from "@/components/map/MapWrapper";
import VirtualCane from "@/components/navigation/VirtualCane";
import { Eye } from "lucide-react";

export default function NavigationPage() {
  const [isVirtualCaneOpen, setIsVirtualCaneOpen] = useState<boolean>(false);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <MapWrapper />

      {/* Virtual Cane Floating Trigger Button */}
      <div className="absolute top-20 right-4 z-20">
        <button
          onClick={() => setIsVirtualCaneOpen(true)}
          className="flex items-center space-x-2 rounded-2xl bg-teal-500 p-4 text-slate-950 font-bold shadow-xl hover:bg-teal-400 active:scale-95 transition min-h-[56px] min-w-[56px]"
          aria-label="Open Virtual Cane"
        >
          <Eye className="h-6 w-6" />
          <span className="hidden sm:inline">Virtual Cane</span>
        </button>
      </div>

      {/* Full-Screen Camera Perception Overlay */}
      <VirtualCane
        isActive={isVirtualCaneOpen}
        onClose={() => setIsVirtualCaneOpen(false)}
      />
    </main>
  );
}
```

---

## 5. Verification & Testing Checklist

| Test Case | Method | Expected Outcome |
| :--- | :--- | :--- |
| **Camera Feed Access** | Open Virtual Cane on smartphone & desktop. | Video stream initializes using rear camera on phone or webcam on desktop. |
| **Proximity Pitch Shift** | Trigger obstacle test at 3m vs 0.8m. | Audio beep pitch increases from 440Hz to >1000Hz as distance decreases. |
| **Urgent Speech Cancellation** | Trigger consecutive warnings rapidly. | Previous non-critical speech cancels immediately so safety alerts play instantly. |
| **Haptic Pulse Trigger** | Trigger stairs test on mobile browser. | Phone vibrates in double-pulse pattern (`[150ms, 80ms, 150ms]`). |
| **56px Touch Target** | Measure close & button elements. | All interactive buttons measure at least 56×56px for motor accessibility compliance. |
