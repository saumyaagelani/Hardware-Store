import type { Metadata, Viewport } from "next";
import { Barlow, Inter } from "next/font/google";
import "./globals.css";
import { business } from "@/config/business";
import { env } from "@/config/env";
import { Analytics } from "@/components/analytics";
import { DemoToolbarServer } from "@/components/layout/demo-toolbar-server";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const barlow = Barlow({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-barlow", display: "swap" });

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
  themeColor: "#111827",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA" className={`${inter.variable} ${barlow.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <DemoToolbarServer />
        <Analytics />
      </body>
    </html>
  );
}
