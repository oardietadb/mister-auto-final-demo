import { validateAnalyticsEvent } from "@/lib/event-validation";
import { isSupabaseConfigured } from "@/lib/auth";

export type AnalyticsEvent =
  | { type: "pageView"; path: string; title: string }
  | { type: "productListView"; category: string; productIds: string[] }
  | { type: "productView"; productId: string; name: string; price: number }
  | { type: "search"; query: string }
  | { type: "accountRegistration"; accountType: "particulier" | "professionnel"; marketingConsent: boolean }
  | { type: "newsletterSubscribe" };

export async function sendAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  });
  if (!response.ok) {
    throw new Error(`L’événement n’a pas pu être transmis (${response.status}).`);
  }
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  const safeEvent = validateAnalyticsEvent(event);
  if (!safeEvent) {
    window.dispatchEvent(new CustomEvent("storefront:analytics-error", { detail: "L’événement n’a pas été transmis : charge utile invalide." }));
    return;
  }
  window.dispatchEvent(new CustomEvent<AnalyticsEvent>("storefront:analytics", { detail: safeEvent }));
  void sendAnalyticsEvent(safeEvent).catch((error: unknown) => {
    window.dispatchEvent(new CustomEvent("storefront:analytics-error", { detail: error instanceof Error ? error.message : "Échec de transmission de l’événement." }));
  });
}
