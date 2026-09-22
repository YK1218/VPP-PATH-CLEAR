import { Building2, Split, X, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface NavFooterProps {
  eta: string;
  timeRemaining: string;
  distance: string;
  entranceName: string;
}

export default function NavFooter({ eta, timeRemaining, distance, entranceName }: NavFooterProps) {
  return (
    <footer className="absolute bottom-0 left-0 right-0 bg-[#1c2a3a] text-white p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: ETA & Distance */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex flex-col">
            <span className="text-xl font-black text-white leading-none">{eta}</span>
            <span className="text-[10px] font-bold text-[#4bc7b6] uppercase tracking-wider mt-1">
              Estimated Arrival
            </span>
          </div>
          <div className="w-px h-10 bg-white/15 hidden sm:block"></div>
          <div className="flex flex-col text-right sm:text-left">
            <span className="text-base font-bold text-white leading-none mb-1">{timeRemaining}</span>
            <span className="text-xs font-medium text-gray-300">
              {distance} to accessible door
            </span>
          </div>
        </div>

        {/* Middle: Destination Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-[#2a3c4f] px-4 py-2 rounded-lg border border-white/5 shadow-inner">
          <Building2 size={16} className="text-[#4bc7b6]" />
          <span className="text-sm font-bold text-[#4bc7b6] truncate max-w-sm">
            {entranceName}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-stretch md:justify-end">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#fbebeb] hover:bg-[#f5d5d5] text-[#d93838] px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm focus-visible:outline-white">
            <Split size={16} className="-scale-x-100" />
            Avoid & Recalculate
          </button>
          <Link
            href="/report-barrier"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm focus-visible:outline-white"
          >
            <AlertTriangle size={16} strokeWidth={2.5} />
            Report Change
          </Link>
          <Link href="/arrival" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm focus-visible:outline-white text-center">
            Arriving Soon
          </Link>
          <Link href="/" className="flex-1 md:flex-none flex items-center justify-center bg-[#4c5c6d] hover:bg-[#5b6e82] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm focus-visible:outline-white text-center">
            End Route
          </Link>
        </div>

      </div>
    </footer>
  );
}
