import type { CartDetailItem } from "@/lib/store";

export type MisterAutoCart = {
  items: CartDetailItem[];
  total: number;
  itemCount: number;
};

export type MisterAutoGlobal = {
  cart?: MisterAutoCart;
  searchKeyword?: string;
};

const queuedTrackIds: string[] = [];
let trackPoll: ReturnType<typeof setInterval> | null = null;

declare global {
  interface Window {
    _satellite?: {
      track: (id: string) => void;
    };
    misterAuto?: MisterAutoGlobal;
  }
}

function flushTrackQueue(): boolean {
  const satellite = window._satellite;
  if (typeof satellite?.track !== "function") return false;
  if (trackPoll) {
    clearInterval(trackPoll);
    trackPoll = null;
  }
  while (queuedTrackIds.length) {
    const id = queuedTrackIds.shift();
    if (id === undefined) continue;
    satellite.track(id);
    console.log("[track]", id, "sent");
  }
  return true;
}

function startTrackPolling(): void {
  if (trackPoll) return;
  const startedAt = Date.now();
  const poll = setInterval(() => {
    if (flushTrackQueue()) return;
    if (Date.now() - startedAt >= 10_000) {
      clearInterval(poll);
      if (trackPoll === poll) trackPoll = null;
      queuedTrackIds.length = 0;
    }
  }, 200);
  trackPoll = poll;
}

export function track(id: string): void {
  if (typeof window === "undefined") return;
  if (typeof window._satellite?.track === "function") {
    if (queuedTrackIds.length) {
      queuedTrackIds.push(id);
      console.log("[track]", id, "queued");
      flushTrackQueue();
      return;
    }
    window._satellite.track(id);
    console.log("[track]", id, "sent");
    return;
  }
  queuedTrackIds.push(id);
  console.log("[track]", id, "queued");
  startTrackPolling();
}
