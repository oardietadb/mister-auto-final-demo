import type { AnalyticsEvent } from "@/lib/analytics";

export type EventDelivery = "disabled" | "not-configured" | "delivered" | "failed";

export async function deliverEventExternally(event: AnalyticsEvent): Promise<EventDelivery> {
  if (process.env.MISTER_AUTO_EVENT_ADAPTER_ENABLED !== "true") return "disabled";
  const endpoint = process.env.MISTER_AUTO_EVENT_ADAPTER_URL?.trim();
  if (!endpoint) return "not-configured";

  let target: URL;
  try {
    target = new URL(endpoint);
  } catch {
    return "not-configured";
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") return "not-configured";

  try {
    const response = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(5000),
    });
    return response.ok ? "delivered" : "failed";
  } catch {
    return "failed";
  }
}
