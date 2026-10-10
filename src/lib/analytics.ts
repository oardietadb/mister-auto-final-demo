export type AnalyticsEvent =
  | { type: "pageView"; path: string; title: string }
  | { type: "productListView"; category: string; productIds: string[] }
  | { type: "productView"; productId: string; name: string; price: number }
  | { type: "search"; query: string };

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AnalyticsEvent>("storefront:analytics", { detail: event }));
}
