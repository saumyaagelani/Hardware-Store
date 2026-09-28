import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { business } from "@/config/business";
import { env } from "@/config/env";
import { Analytics } from "@/components/analytics";
import { DemoToolbarServer } from "@/components/layout/demo-toolbar-server";

/*
 * Typeface: Satoshi (Indian Type Foundry), matching the reference site. It is
 * served by Fontshare's official web-font CSS (@font-face, WOFF2) under the ITF
 * Free Font License — no font files are committed to this repository.
 * Inter (self-hosted by next/font) is the metric-compatible fallback while
 * Satoshi loads or if Fontshare is unreachable.
 */
const SATOSHI_CSS = "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${business.name} — Flooring, Doors, Bath & Building Supplies`,
    template: `%s | ${business.name}`,
  },
  description:
    "Shop waterproof vinyl flooring, interior doors and hardware, vanities, shower systems, plumbing and WPC wall panels. In-store pickup, local delivery, free quotes and contractor pricing.",
  applicationName: business.name,
  openGraph: { type: "website", siteName: business.name, locale: "en_CA" },
  verification: env.searchConsoleVerification ? { google: env.searchConsoleVerification } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#1d211c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA" data-scroll-behavior="smooth" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={SATOSHI_CSS} />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <DemoToolbarServer />
        <Analytics />
      </body>
    </html>
  );
}
