"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Phone, Truck } from "lucide-react";
import { business } from "@/config/business";

export interface AnnouncementItem {
  id: string;
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function AnnouncementBar({ items }: { items: AnnouncementItem[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(timer);
  }, [items.length]);
  const item = items[index % Math.max(items.length, 1)];

  return (
    <div className="bg-ink text-white">
      <div className="container-page flex h-10 items-center justify-between gap-4 text-[0.8125rem]">
        <p className="hidden items-center gap-1.5 text-white/80 lg:flex">
          <Truck className="h-4 w-4 text-gold" aria-hidden /> Free in-store pickup · Local delivery available
        </p>
        <p className="min-w-0 flex-1 truncate text-center lg:flex-none" aria-live="polite">
          {item ? (
            <>
              <span className="text-white/90">{item.title}</span>
              {item.ctaHref ? (
                <Link href={item.ctaHref} className="ml-2 font-semibold text-gold underline-offset-4 hover:underline">
                  {item.ctaLabel ?? "Learn more"}
                </Link>
              ) : null}
            </>
          ) : null}
        </p>
        <a href={business.phoneHref} className="hidden items-center gap-1.5 font-medium text-white/85 hover:text-white lg:flex">
          <Phone className="h-4 w-4 text-gold" aria-hidden /> {business.phone}
        </a>
      </div>
    </div>
  );
}
