import { Compass, Plus, Minus } from "lucide-react";

export default function MapControls() {
  return (
    <div className="absolute bottom-[96px] right-4 md:right-6 flex flex-col gap-2 z-40">
      
      {/* Location Button */}
      <button 
        className="w-11 h-11 bg-white rounded-full shadow-md flex items-center justify-center text-pathclear-primary border border-gray-100 hover:bg-gray-50 transition-colors focus-visible:outline-pathclear-primary"
        aria-label="My Location"
      >
        <Compass size={20} strokeWidth={2.5} />
      </button>

      {/* Zoom Controls */}
      <div className="flex flex-col bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <button 
          className="w-11 h-11 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors focus-visible:outline-pathclear-primary"
          aria-label="Zoom In"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
        <div className="w-full h-px bg-gray-100 mx-auto max-w-[28px]"></div>
        <button 
          className="w-11 h-11 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors focus-visible:outline-pathclear-primary"
          aria-label="Zoom Out"
        >
          <Minus size={20} strokeWidth={2.5} />
        </button>
      </div>

    </div>
  );
}
