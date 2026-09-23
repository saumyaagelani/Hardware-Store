"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Accessible modal / drawer built on the native <dialog> element (focus trap,
 * Escape to close and inert background come for free).
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  variant = "modal",
  side = "right",
  className,
  hideTitle,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: "modal" | "drawer";
  side?: "left" | "right";
  className?: string;
  hideTitle?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && el.open) {
      el.close();
    }
    return () => {
      if (!open) document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => () => void (document.documentElement.style.overflow = ""), []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={() => {
        document.documentElement.style.overflow = "";
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/55",
        variant === "modal" && "fixed inset-0 m-auto h-fit w-[calc(100%-2rem)] max-w-lg",
        variant === "drawer" && "fixed top-0 h-dvh w-[min(26rem,100vw)]",
        variant === "drawer" && (side === "right" ? "right-0 left-auto" : "left-0"),
      )}
    >
      <div className={cn("flex flex-col bg-white shadow-menu", variant === "modal" ? "max-h-[85dvh] rounded-lg" : "h-full", className)}>
        <div className={cn("flex items-center justify-between border-b border-line px-5 py-4", hideTitle && "sr-only")}>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="-mr-2 rounded-md p-2 text-ink hover:bg-mist" aria-label="Close">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
