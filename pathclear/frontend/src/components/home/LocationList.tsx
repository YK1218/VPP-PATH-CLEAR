import LocationCard, { LocationCardProps } from "./LocationCard";
import { Activity } from "lucide-react";

export default function LocationList() {
  const locations: LocationCardProps[] = [
    {
      id: "jio-world-centre",
      type: "building",
      title: "Jio World Convention Centre",
      subLocation: "Gate 2",
      subtitle: "BKC, Mumbai",
      badges: [
        { text: "Verified step-free ramp", isVerified: true },
        { text: "Automatic doors", isVerified: false },
        { text: "Accessible restrooms L1", isVerified: false },
      ],
      time: "18 min",
      distance: "4.2 km away",
    },
    {
      id: "bkc-metro-station",
      type: "transit",
      title: "Bandra Kurla Complex Metro Station",
      subtitle: "Line 3 Aqua Line",
      badges: [
        { text: "Both lifts operational", isVerified: true },
        { text: "Tactile platform edge guide", isVerified: false },
        { text: "Direct concourse roll-in", isVerified: false },
      ],
      time: "12 min",
      distance: "2.1 km away",
    },
    {
      id: "bandra-west-station",
      type: "transit",
      title: "Bandra West Railway Station",
      subtitle: "West Accessible Footbridge",
      badges: [
        { text: "Ramp grade 1:14 (smooth finish)", isVerified: true },
        { text: "Tactile warning tiles", isVerified: false },
        { text: "Platform 1 ramp access", isVerified: false },
      ],
      time: "24 min",
      distance: "5.8 km away",
    },
  ];

  return (
    <section className="w-full max-w-4xl mx-auto px-4 pb-16 relative z-10">
      
      {/* List Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase">
          Verified Accessible Locations in Mumbai
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
          <span className="w-2 h-2 rounded-full bg-pathclear-secondary animate-pulse"></span>
          Live Audited
        </div>
      </div>

      {/* List of Cards */}
      <div className="flex flex-col gap-3 mb-6">
        {locations.map((loc, i) => (
          <LocationCard key={i} {...loc} />
        ))}
      </div>

      {/* Telemetry Alert Box */}
      <div className="w-full bg-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-gray-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="mt-0.5 sm:mt-0 text-pathclear-primary">
            <Activity size={20} />
          </div>
          <p className="text-sm font-medium text-gray-700">
            <span className="font-bold text-gray-900">Live Transit Telemetry: </span>
            94.6% of audited Metro Line 3 elevators in Mumbai report nominal operational status today.
          </p>
        </div>
        <button className="text-sm font-bold text-pathclear-primary hover:text-pathclear-secondary transition-colors whitespace-nowrap self-start sm:self-auto">
          View Outages
        </button>
      </div>

    </section>
  );
}
