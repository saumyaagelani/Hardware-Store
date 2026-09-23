import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Banner } from "@/lib/types";
import { cn } from "@/lib/cn";

const art: Record<string, string> = {
  dark: "/media/products/harbour-oak-rigid-core-spc-plank/3.svg",
  gold: "/media/products/30in-shaker-single-vanity-with-quartz-top/1.svg",
  light: "/media/products/fluted-wpc-wall-panel/1.svg",
};

export function PromoBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  const [first, ...rest] = banners;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PromoCard banner={first} large />
      <div className="grid gap-4">
        {rest.slice(0, 2).map((b) => (
          <PromoCard key={b.id} banner={b} />
        ))}
      </div>
    </div>
  );
}

function PromoCard({ banner, large = false }: { banner: Banner; large?: boolean }) {
  return (
    <Link
      href={banner.ctaHref ?? "/shop"}
      className={cn(
        "group relative flex overflow-hidden rounded-lg",
        banner.theme === "dark" && "bg-ink text-white",
        banner.theme === "gold" && "bg-gold text-ink",
        banner.theme === "light" && "border border-line bg-mist text-ink",
        large ? "min-h-80 flex-col justify-end lg:min-h-full" : "min-h-44 items-center",
      )}
    >
      <img
        src={art[banner.theme]}
        alt=""
        loading="lazy"
        className={cn(
          "absolute object-cover transition-transform duration-500 group-hover:scale-[1.03]",
          large ? "inset-0 h-full w-full opacity-45" : "top-0 right-0 h-full w-2/5 [mask-image:linear-gradient(to_right,transparent,black_35%)]",
        )}
      />
      {large ? <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent" /> : null}
      <div className={cn("relative p-6 sm:p-8", !large && "max-w-[62%]")}>
        {banner.eyebrow ? <p className={cn("eyebrow", banner.theme === "dark" && "text-gold!", banner.theme === "gold" && "text-ink!")}>{banner.eyebrow}</p> : null}
        <p className={cn("mt-2 font-display leading-tight font-extrabold", large ? "text-3xl sm:text-4xl" : "text-2xl")}>{banner.title}</p>
        {banner.body ? <p className={cn("mt-2 text-sm", banner.theme === "dark" ? "text-white/75" : "text-ink-line")}>{banner.body}</p> : null}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
          {banner.ctaLabel ?? "Shop now"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
