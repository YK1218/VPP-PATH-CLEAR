import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-8 px-4 md:px-8 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Left Section */}
        <div className="flex flex-col gap-1">
          <h2 className="font-bold text-gray-900">PathClear India</h2>
          <p className="text-sm text-gray-500 font-medium max-w-md">
            Verified step-free itineraries, incline telemetry, and live elevator updates for urban India.
          </p>
        </div>

        {/* Right Section Links */}
        <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-700">
          <Link href="/standards" className="hover:text-pathclear-primary transition-colors">
            Audit Standards
          </Link>
          <Link href="/report" className="hover:text-pathclear-primary transition-colors">
            Report Barrier
          </Link>
          <Link href="/guides" className="hover:text-pathclear-primary transition-colors">
            Metro Guides
          </Link>
        </div>

      </div>
    </footer>
  );
}
