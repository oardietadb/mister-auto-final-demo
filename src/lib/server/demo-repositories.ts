import type { AnalyticsEvent } from "@/lib/analytics";

export type StoredDemoEvent = {
  id: string;
  receivedAt: string;
  event: AnalyticsEvent;
  externalDelivery: "disabled" | "not-configured" | "delivered" | "failed";
};

type DemoRuntimeStore = {
  events: StoredDemoEvent[];
  newsletterSubscribers: Map<string, string>;
};

const runtime = globalThis as typeof globalThis & { __misterAutoDemoStore?: DemoRuntimeStore };
const store: DemoRuntimeStore = runtime.__misterAutoDemoStore ??= { events: [], newsletterSubscribers: new Map() };
const EVENT_LIMIT = 300;

export function saveDemoEvent(event: AnalyticsEvent, externalDelivery: StoredDemoEvent["externalDelivery"]): StoredDemoEvent {
  const record = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    event,
    externalDelivery,
  };
  store.events.push(record);
  if (store.events.length > EVENT_LIMIT) store.events.splice(0, store.events.length - EVENT_LIMIT);
  return record;
}

export function listDemoEvents(): StoredDemoEvent[] {
  return store.events.slice().reverse();
}

export function clearDemoEvents(): void {
  store.events.length = 0;
}

export function addNewsletterSubscriber(email: string): boolean {
  if (store.newsletterSubscribers.has(email)) return false;
  store.newsletterSubscribers.set(email, new Date().toISOString());
  return true;
}
