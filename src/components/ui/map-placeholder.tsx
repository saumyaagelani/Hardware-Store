import { MapPin } from "lucide-react";
import { business } from "@/config/business";
import { cn } from "@/lib/cn";

/**
 * Stylised map placeholder. When the final address is confirmed, set
 * business.mapUrl to a Google Maps embed URL and it will be shown instead.
 */
export function MapPlaceholder({ className }: { className?: string }) {
  if (business.mapUrl) {
    return <iframe title={`Map to ${business.name}`} src={business.mapUrl} className={cn("h-full w-full border-0", className)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />;
  }
  return (
    <div className={cn("relative overflow-hidden bg-mist", className)} role="img" aria-label="Map placeholder — location map will be added once the address is confirmed">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 400" aria-hidden>
        <rect width="600" height="400" fill="#eef0f2" />
        <path d="M0 250 C120 230 200 300 330 270 S520 200 600 220 V400 H0Z" fill="#dbe7ee" />
        {[60, 140, 220, 300, 380].map((y) => (
          <line key={y} x1="0" y1={y} x2="600" y2={y - 30} stroke="#ffffff" strokeWidth="10" />
        ))}
        {[80, 200, 330, 460, 560].map((x) => (
          <line key={x} x1={x} y1="0" x2={x + 40} y2="400" stroke="#ffffff" strokeWidth="10" />
        ))}
        <line x1="0" y1="180" x2="600" y2="120" stroke="#f5b82e" strokeWidth="14" strokeOpacity="0.6" />
        {[
          [110, 90, 60, 40],
          [240, 170, 70, 50],
          [370, 70, 60, 40],
          [470, 150, 70, 45],
          [150, 300, 80, 50],
        ].map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="4" fill="#e1e4e8" />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-gold shadow-raised">
            <MapPin className="h-6 w-6" aria-hidden />
          </span>
          <span className="mt-2 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-card">{business.name}</span>
          <span className="mt-1 text-[0.6875rem] text-body">Map embed added when address is confirmed</span>
        </div>
      </div>
    </div>
  );
}
