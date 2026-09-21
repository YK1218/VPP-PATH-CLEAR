import { Volume2, Crosshair, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface NavHeaderProps {
  destination: string;
}

export default function NavHeader({ destination }: NavHeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 h-[72px] bg-white border-b border-gray-200 shadow-sm z-50 flex items-center px-4 md:px-6 justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pathclear-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pathclear-primary"></span>
          </span>
          Active Navigation
        </Link>
        <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
        <div className="text-sm font-medium text-gray-500 hidden sm:block">
          Dest: <span className="font-bold text-gray-900">{destination}</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 bg-green-50/70 text-pathclear-primary px-2.5 py-1 rounded-full text-xs font-bold border border-green-100">
          <CheckCircle2 size={14} />
          Wheelchair - Step-Free Verified
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-[#f0f4ff] hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold transition-colors border border-blue-100 focus-visible:outline-pathclear-primary">
          <Volume2 size={16} />
          <span className="hidden sm:inline">Voice Audio On</span>
        </button>
        <button className="flex items-center justify-center w-10 h-10 bg-[#f0f4ff] hover:bg-blue-50 text-blue-700 rounded-full transition-colors border border-blue-100 focus-visible:outline-pathclear-primary" aria-label="Center map">
          <Crosshair size={18} />
        </button>
      </div>
    </header>
  );
}
