"use client";

import React, { useState } from "react";
import { Check, X, ThumbsUp, AlertOctagon } from "lucide-react";

interface VerificationPromptProps {
  question?: string;
  targetName?: string;
  onVerify: (response: "clear" | "blocked") => void;
  onDismiss?: () => void;
}

export const VerificationPrompt: React.FC<VerificationPromptProps> = ({
  question = "Is the ramp barrier-free right now?",
  targetName = "West Library Ramp",
  onVerify,
  onDismiss,
}) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (choice: "clear" | "blocked") => {
    setSubmitted(true);
    onVerify(choice);
    setTimeout(() => {
      onDismiss?.();
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-5 text-white shadow-2xl animate-fade-in">
        <ThumbsUp className="w-6 h-6 animate-bounce" />
        <span className="font-bold text-base">Thanks! Verification logged in real-time.</span>
      </div>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-labelledby="verif-title"
      className="flex flex-col gap-3 rounded-2xl bg-zinc-950/95 border-2 border-amber-400/80 p-5 shadow-2xl backdrop-blur-xl text-white"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertOctagon className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">1-Tap Live Verification</span>
        </div>
        <span className="text-[11px] text-zinc-400">{targetName}</span>
      </div>

      <h4 id="verif-title" className="text-lg font-bold text-zinc-100">
        {question}
      </h4>

      <p className="text-xs text-zinc-400">
        Takes 1 second • Keeps routes safe and up-to-date for everyone.
      </p>

      {/* Giant 48px+ accessible buttons */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        <button
          type="button"
          onClick={() => handleSelect("clear")}
          aria-label="Confirm ramp is clear and open"
          className="flex items-center justify-center gap-2 h-14 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-lg transition-transform active:scale-95 focus:ring-4 focus:ring-emerald-300"
          style={{ minHeight: "56px" }}
        >
          <Check className="w-6 h-6" />
          <span>YES, CLEAR</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("blocked")}
          aria-label="Report ramp is blocked or has a barrier"
          className="flex items-center justify-center gap-2 h-14 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-base shadow-lg transition-transform active:scale-95 focus:ring-4 focus:ring-red-300"
          style={{ minHeight: "56px" }}
        >
          <X className="w-6 h-6" />
          <span>NO, BLOCKED</span>
        </button>
      </div>
    </div>
  );
};

export default VerificationPrompt;
