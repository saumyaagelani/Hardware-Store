"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "info";
interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

const ToastContext = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((all) => [...all.slice(-2), { ...t, id }]);
    setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-16 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => {
          const Icon = t.tone === "success" ? CheckCircle2 : t.tone === "error" ? XCircle : Info;
          return (
            <div key={t.id} role="status" className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg bg-ink p-4 text-white shadow-menu">
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", t.tone === "success" && "text-gold", t.tone === "error" && "text-danger-soft", t.tone === "info" && "text-info-soft")} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description ? <p className="mt-0.5 text-[0.8125rem] text-white/75">{t.description}</p> : null}
              </div>
              <button type="button" className="-m-1 rounded p-1 text-white/70 hover:text-white" onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))} aria-label="Dismiss notification">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
