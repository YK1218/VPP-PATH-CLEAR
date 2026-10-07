import { TriangleAlert, X, CheckCircle2, Ban } from "lucide-react";

interface RouteAlertCardProps {
  timeReported: string;
  title: string;
  distanceAhead: string;
  question: string;
  travelerImpactCount?: number;
  hazardId?: string;
  isVerified?: boolean;
  isSubmitting?: boolean;
  errorMessage?: string;
  onVerify?: (response: "clear" | "blocked") => void;
  onDismiss?: () => void;
}

export default function RouteAlertCard({
  timeReported,
  title,
  distanceAhead,
  question,
  travelerImpactCount,
  hazardId,
  isVerified = false,
  isSubmitting = false,
  errorMessage,
  onVerify,
  onDismiss,
}: RouteAlertCardProps) {
  return (
    <div className="absolute top-[96px] right-4 md:right-6 w-full max-w-[340px] bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-40">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase tracking-widest">
          <TriangleAlert size={14} strokeWidth={2.5} />
          {hazardId ? `Nearby hazard · ${timeReported}` : "Nearby hazard check"}
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-pathclear-primary rounded cursor-pointer"
          title="Dismiss alert"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-[17px] font-bold text-gray-900 leading-snug mb-3">
        {title}
      </h3>
      {hazardId && <p className="text-xs text-gray-500 mb-3">Approximately {distanceAhead} from the queried route point.</p>}

      {/* Question or Verified Message */}
      {isVerified ? (
        <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in">
          <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs mb-1">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Response Recorded</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Thank you! The backend accepted your 1-tap confirmation.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-600 mb-4 leading-relaxed">
            {question}
          </p>
          {errorMessage && <p role="alert" className="text-xs text-red-700 mb-3">{errorMessage}</p>}

          {/* Actions */}
          {hazardId ? <div className="flex flex-col gap-2 mb-3">
            <button 
              className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-pathclear-primary py-2.5 rounded-lg text-sm font-bold transition-colors border border-green-100 cursor-pointer"
              onClick={() => onVerify?.("clear")}
              disabled={isSubmitting}
            >
              <CheckCircle2 size={16} strokeWidth={2.5} />
              PATH CLEAR
            </button>
            <button 
              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg text-sm font-bold transition-colors border border-red-100 cursor-pointer"
              onClick={() => onVerify?.("blocked")}
              disabled={isSubmitting}
            >
              <Ban size={16} strokeWidth={2.5} />
              STILL BLOCKED
            </button>
          </div> : <p className="text-xs text-gray-500 mb-3">Verification is unavailable because the backend returned no hazard ID for this point.</p>}
        </>
      )}

      {/* Footer text */}
      <p className="text-center text-[10px] font-semibold text-gray-400 leading-tight">
        {travelerImpactCount === undefined
          ? "Verification count is not provided by the backend."
          : `This hazard has ${travelerImpactCount} recorded verifications.`}
      </p>

    </div>
  );
}
