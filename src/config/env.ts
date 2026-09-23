/**
 * Centralised environment configuration. Nothing here is a secret that should
 * be committed; production values are provided through environment variables
 * (see .env.example).
 */
export const env = {
  // RENDER_EXTERNAL_URL is provided automatically when hosted on Render.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000",
  /** Demo mode shows the presenter toolbar and allows one-click persona sign-in. */
  demoMode: (process.env.NEXT_PUBLIC_DEMO_MODE ?? "true") !== "false",
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  searchConsoleVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "",
};
