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

declare global {
  interface Window {
    _satellite?: {
      track: (id: string) => void;
    };
    misterAuto?: MisterAutoGlobal;
  }
}

export function track(id: string): void {
  if (typeof window !== "undefined") window._satellite?.track(id);
}
