"use client";

import React, { useEffect, useState } from "react";
import { X, Image as ImageIcon, Accessibility, ShieldCheck, Activity } from "lucide-react";
import { Entrance } from "@/types";

interface Last50FeetCardProps {
  entrance: Entrance;
  onClose: () => void;
}

export default function Last50FeetCard({ entrance, onClose }: Last50FeetCardProps) {
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    // Fetch precise entrance data
    fetch(`http://localhost:8000/api/v1/entrances/${entrance.id}`)
      .then(res => res.json())
      .then(data => setDetail(data))
      .catch(console.error);
  }, [entrance.id]);

  if (!detail) return null;

  return (
    <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col justify-end">
      <div className="bg-white w-full rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header Photo */}
        <div className="relative w-full h-48 bg-gray-200 rounded-t-3xl overflow-hidden">
          {detail.photo_url ? (
            <img src={detail.photo_url} alt="Entrance View" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={48} />
            </div>
          )}
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="absolute bottom-3 left-4 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
            <ShieldCheck size={14} />
            Verified Accessible
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-black text-gray-900 mb-1">{detail.building_name}</h2>
          <p className="text-pathclear-primary font-bold text-sm tracking-widest uppercase mb-6">Last 50 Feet Approach</p>
          
          {/* Final Instructions */}
          <div className="bg-emerald-50 rounded-2xl p-5 mb-6 border border-emerald-100">
            <p className="text-emerald-900 font-medium text-lg leading-relaxed">
              "{detail.last_50_feet_instructions || entrance.notes || 'Proceed to the main entrance.'}"
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-3">
              <div className="text-blue-500 mt-0.5"><Activity size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ramp Slope</p>
                <p className="font-bold text-gray-900">{detail.ramp_slope ? `${detail.ramp_slope}%` : 'N/A'}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-3">
              <div className="text-blue-500 mt-0.5"><Accessibility size={20} /></div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Door Type</p>
                <p className="font-bold text-gray-900 capitalize">{detail.door_type.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-4 font-bold text-lg transition-colors"
          >
            Got it, I'm here
          </button>
        </div>
      </div>
    </div>
  );
}
