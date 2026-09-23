"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FlaskConical, RotateCcw, X, ChevronUp } from "lucide-react";
import { demoSignInAction, demoSignOutAction, resetDemoAction } from "@/app/actions/auth";
import { cn } from "@/lib/cn";

const personas = [
  { key: "customer", label: "Regular customer", note: "Jordan Avery · retail pricing" },
  { key: "contractor", label: "Approved contractor", note: "Priya Raman · contractor pricing" },
  { key: "pending", label: "Pending contractor", note: "Marcus Bell · awaiting approval" },
  { key: "rejected", label: "Rejected contractor", note: "Elena Novak · retail pricing" },
  { key: "admin", label: "Administrator", note: "Sam Morgan · admin dashboard" },
];

/**
 * Presenter toolbar (demo mode only): switch personas in one click to show how
 * pricing and dashboards change, and reset the demo data between meetings.
 */
export function DemoToolbar({ current }: { current: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (hidden) return null;

  const run = (fn: () => Promise<void>) =>
    start(async () => {
      setMessage(null);
      await fn();
    });

  return (
    <div className="fixed right-4 bottom-4 z-[60] flex flex-col items-end print:hidden">
      {open ? (
        <div className="mb-2 ml-auto w-72 rounded-lg border border-ink-line bg-ink p-3 text-white shadow-menu">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display text-sm font-bold tracking-wide text-gold uppercase">Demo personas</p>
            <button type="button" onClick={() => setOpen(false)} className="rounded p-1 text-white/70 hover:text-white" aria-label="Close demo panel">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <ul className="space-y-1">
            {personas.map((p) => (
              <li key={p.key}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    run(async () => {
                      const res = await demoSignInAction(p.key);
                      if (res.ok) {
                        router.push(res.redirectTo);
                        router.refresh();
                      } else setMessage(res.error ?? "Could not switch persona");
                    })
                  }
                  className={cn("w-full rounded-md px-2.5 py-2 text-left hover:bg-ink-soft disabled:opacity-60", current === p.key && "bg-ink-soft ring-1 ring-gold")}
                >
                  <span className="block text-sm font-semibold">{p.label}</span>
                  <span className="block text-xs text-white/60">{p.note}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(async () => {
                    await demoSignOutAction();
                    router.push("/");
                    router.refresh();
                  })
                }
                className={cn("w-full rounded-md px-2.5 py-2 text-left hover:bg-ink-soft", current === null && "bg-ink-soft ring-1 ring-gold")}
              >
                <span className="block text-sm font-semibold">Guest (signed out)</span>
                <span className="block text-xs text-white/60">Public retail pricing</span>
              </button>
            </li>
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-ink-line pt-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  if (!window.confirm("Reset all demo data (orders, quotes, accounts, product edits) to the original state?")) return;
                  const res = await resetDemoAction();
                  setMessage(res.ok ? "Demo data reset" : (res.error ?? "Reset failed"));
                  router.refresh();
                })
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-gold"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset demo data
            </button>
            <button type="button" onClick={() => setHidden(true)} className="text-xs text-white/60 hover:text-white">
              Hide toolbar
            </button>
          </div>
          {message ? <p className="mt-2 text-xs text-gold">{message}</p> : null}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-ink py-2 pr-3 pl-2.5 text-xs font-semibold text-white shadow-raised ring-1 ring-ink-line hover:bg-ink-soft"
      >
        <FlaskConical className="h-4 w-4 text-gold" aria-hidden />
        Demo{current ? `: ${personas.find((p) => p.key === current)?.label ?? "Signed in"}` : ": Guest"}
        <ChevronUp className={cn("h-3.5 w-3.5 transition-transform", !open && "rotate-180")} aria-hidden />
      </button>
    </div>
  );
}
