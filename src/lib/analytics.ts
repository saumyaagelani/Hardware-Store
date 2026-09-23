/**
 * Lightweight event tracking facade. Events are forwarded to Google Analytics
 * (gtag) and Meta Pixel (fbq) only when those scripts are present, so calls are
 * safe no-ops in the prototype.
 */
type EventName = "add_to_cart" | "begin_checkout" | "purchase" | "generate_lead" | "sign_up" | "search" | "view_item";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const metaEvents: Partial<Record<EventName, string>> = {
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  generate_lead: "Lead",
  sign_up: "CompleteRegistration",
  search: "Search",
  view_item: "ViewContent",
};

export function track(event: EventName, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  const metaEvent = metaEvents[event];
  if (metaEvent) window.fbq?.("track", metaEvent, params);
}
