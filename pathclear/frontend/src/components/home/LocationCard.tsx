import { Building2, TrainFront, CheckCircle2, ChevronRight, CornerDownRight } from "lucide-react";
import React from "react";
import Link from "next/link";

export type LocationType = "building" | "transit";

export interface BadgeInfo {
  text: string;
  isVerified?: boolean;
}

export interface LocationCardProps {
  id: string;
  type: LocationType;
  title: string;
  subtitle: string;
  subLocation?: string;
  badges: BadgeInfo[];
  time: string;
  distance: string;
}

export default function LocationCard({
  id,
  type,
  title,
  subtitle,
  subLocation,
  badges,
  time,
  distance,
}: LocationCardProps) {
  return (
    <Link href={`/navigation/${id}`} className="w-full bg-white rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow group text-left focus-visible:outline-pathclear-primary">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        
        {/* Left Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            {type === "building" ? <Building2 size={20} /> : <TrainFront size={20} />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-1.5">
            <h3 className="text-lg font-bold text-gray-900 truncate">{title}</h3>
            {subLocation && (
              <span className="text-gray-900 font-bold hidden sm:inline">— {subLocation}</span>
            )}
            <span className="text-sm font-medium text-gray-500 truncate ml-1">{subtitle}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {badges.map((badge, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs font-semibold text-pathclear-primary bg-green-50/50 px-2 py-1 rounded-md">
                {badge.isVerified && <CheckCircle2 size={14} className="text-pathclear-secondary" />}
                {!badge.isVerified && <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>}
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Stats & Action */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4 border-l border-gray-100 pl-4 md:pl-6">
        <div className="text-right">
          <div className="font-bold text-gray-900 text-sm md:text-base">{time}</div>
          <div className="text-xs font-medium text-gray-500">{distance}</div>
        </div>
        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-pathclear-primary group-hover:text-white group-hover:border-pathclear-primary transition-colors">
          <CornerDownRight size={16} />
        </div>
      </div>
    </Link>
  );
}
