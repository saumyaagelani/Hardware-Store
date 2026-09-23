import { CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { Tone } from "@/lib/status";
import { StatusBadge } from "@/components/ui/badge";

export function Timeline({ entries }: { entries: { label: string; tone: Tone; at: string; note?: string; by?: string }[] }) {
  return (
    <ol className="relative space-y-5 border-l-2 border-line pl-6">
      {[...entries].reverse().map((e, i) => (
        <li key={`${e.at}-${i}`} className="relative">
          <span className={i === 0 ? "absolute top-0.5 -left-[33px] flex h-5 w-5 items-center justify-center rounded-full bg-ink text-gold" : "absolute top-1 -left-[31px] h-4 w-4 rounded-full border-2 border-line bg-white"}>
            {i === 0 ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : null}
          </span>
          <StatusBadge tone={e.tone}>{e.label}</StatusBadge>
          <p className="mt-1 text-xs text-body">
            {formatDateTime(e.at)}
            {e.by ? ` · ${e.by}` : ""}
          </p>
          {e.note ? <p className="mt-1 text-sm text-ink">{e.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}
