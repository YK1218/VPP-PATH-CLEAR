import { Search, Mic, ArrowRight, Activity, Eye, Volume2 } from "lucide-react";

export default function Hero() {
  const cities = ["Mumbai", "Delhi NCR", "Bengaluru", "Pune", "Hyderabad", "Ahmedabad"];
  
  return (
    <section className="w-full flex flex-col items-center pt-8 pb-12 px-4 relative">
      {/* Background decoration to mimic faint map lines */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,50 Q200,100 400,0 T800,50 T1200,0 T1600,100" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M0,200 Q300,100 600,300 T1200,200 T1800,400" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="400" cy="150" r="4" fill="currentColor" />
          <circle cx="800" cy="50" r="4" fill="currentColor" />
          <path d="M400,150 L600,300" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        
        {/* City Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-white px-2 py-1.5 rounded-full shadow-sm border border-gray-100">
          {cities.map((city, i) => (
            <button 
              key={city}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                i === 0 
                  ? "bg-gray-100 text-pathclear-primary relative" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {i === 0 && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pathclear-primary"></span>}
              <span className={i === 0 ? "pl-3" : ""}>{city}</span>
            </button>
          ))}
        </div>

        {/* Active Profile Chip */}
        <div className="inline-flex items-center gap-1.5 bg-green-50 text-pathclear-secondary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
            <path d="M8 12h8"></path>
          </svg>
          Wheelchair • Step-Free Active
        </div>

        {/* Hero Headings */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Where are you going?
        </h1>
        <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-8 font-medium">
          Every route verified for elevator reliability, zero curb steps, and continuous ramp gradients.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-3xl bg-white rounded-full shadow-md border border-gray-200 p-2 flex items-center mb-6 focus-within:ring-2 focus-within:ring-pathclear-secondary focus-within:border-transparent transition-shadow">
          <div className="pl-4 pr-2 text-pathclear-primary">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search an Indian destination, transit station, or building"
            className="flex-1 bg-transparent border-none outline-none py-3 text-gray-700 placeholder:text-gray-400 font-medium text-base md:text-lg min-w-0"
            aria-label="Search destination"
          />
          <button className="p-3 text-pathclear-primary hover:bg-gray-50 rounded-full transition-colors mr-2" aria-label="Voice search">
            <Mic size={20} />
          </button>
          <button className="bg-pathclear-primary hover:bg-pathclear-secondary text-white px-6 py-3.5 rounded-full font-semibold flex items-center gap-2 transition-colors whitespace-nowrap">
            Find Route
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-3xl">
          <button className="flex items-center gap-2 bg-[#f0f4ff] hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-blue-100">
            <Activity size={16} />
            Max 3% Incline
          </button>
          <button className="flex items-center gap-2 bg-[#f0f4ff] hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-blue-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-2a2 2 0 0 0-2-2V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2h2"></path></svg>
            Require Dropped Curbs
          </button>
          <button className="flex items-center gap-2 bg-[#f8f9fa] hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-gray-200">
            <Volume2 size={16} />
            Audible Crossings
          </button>
          <button className="flex items-center gap-2 bg-[#f8f9fa] hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-gray-200">
            <Eye size={16} />
            Live Elevator Feed
          </button>
        </div>
        
      </div>
    </section>
  );
}
