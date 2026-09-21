import { ArrowUpRight, TrendingUp, Maximize2 } from "lucide-react";

interface TurnInstructionCardProps {
  distance: string;
  instruction: string;
  street: string;
  slope: string;
  width: string;
}

export default function TurnInstructionCard({ distance, instruction, street, slope, width }: TurnInstructionCardProps) {
  return (
    <div className="absolute top-[96px] left-4 md:left-6 w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-40">
      <div className="flex gap-4">
        {/* Turn Icon */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-pathclear-primary rounded-xl flex items-center justify-center text-white shadow-md">
            <ArrowUpRight size={32} strokeWidth={2.5} />
          </div>
        </div>

        {/* Instruction Details */}
        <div className="flex flex-col">
          <span className="text-xs font-black text-pathclear-secondary uppercase tracking-widest mb-0.5">
            Next - In {distance}
          </span>
          <h2 className="text-xl font-extrabold text-gray-900 leading-tight mb-1">
            {instruction}
          </h2>
          <p className="text-sm font-medium text-gray-500 mb-3">
            onto <span className="font-bold text-gray-700">{street}</span>
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#f0f4ff] text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
              <TrendingUp size={12} strokeWidth={3} />
              {slope}
            </div>
            <div className="w-px h-3 bg-gray-200"></div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold">
              <Maximize2 size={12} strokeWidth={3} className="rotate-45" />
              {width}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
