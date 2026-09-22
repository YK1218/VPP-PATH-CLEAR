import { TriangleAlert, X, CheckCircle2, Ban } from "lucide-react";
import Image from "next/image";

interface RouteAlertCardProps {
  timeReported: string;
  title: string;
  distanceAhead: string;
  question: string;
  travelerImpactCount: number;
  hazardId?: string;
  onVerify?: (response: "clear" | "blocked") => void;
}

export default function RouteAlertCard({
  timeReported,
  title,
  distanceAhead,
  question,
  travelerImpactCount,
  onVerify,
}: RouteAlertCardProps) {
  return (
    <div className="absolute top-[96px] right-4 md:right-6 w-full max-w-[340px] bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-40">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase tracking-widest">
          <TriangleAlert size={14} strokeWidth={2.5} />
          Route Alert - Reported {timeReported}
        </div>
        <button className="text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-pathclear-primary rounded">
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-[17px] font-bold text-gray-900 leading-snug mb-3">
        {title}
      </h3>

      {/* Image with Overlay */}
      <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 bg-gray-200">
        <img 
          src="https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=600&auto=format&fit=crop" 
          alt="Roadworks blocking sidewalk"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
          Sidewalk view - {distanceAhead} ahead
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-gray-600 mb-4 leading-relaxed">
        {question}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-2 mb-3">
        <button 
          className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-pathclear-primary py-2.5 rounded-lg text-sm font-bold transition-colors border border-green-100"
          onClick={() => onVerify?.("clear")}
        >
          <CheckCircle2 size={16} strokeWidth={2.5} />
          PATH CLEAR
        </button>
        <button 
          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg text-sm font-bold transition-colors border border-red-100"
          onClick={() => onVerify?.("blocked")}
        >
          <Ban size={16} strokeWidth={2.5} />
          STILL BLOCKED
        </button>
      </div>

      {/* Footer text */}
      <p className="text-center text-[10px] font-semibold text-gray-400 leading-tight">
        Your 1-tap confirmation updates routes for {travelerImpactCount} travelers.
      </p>

    </div>
  );
}
