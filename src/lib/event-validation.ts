import type { AnalyticsEvent } from "@/lib/analytics";

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /(?<!\w)\+?\d[\d\s().-]{7,}\d(?!\w)/g;

function safeText(value: unknown, maximumLength: number): string | null {
  if (typeof value !== "string" || value.length > maximumLength) return null;
  const safe = value.trim().replace(/<[^>]*>/g, "").replace(EMAIL_PATTERN, "[e-mail]").replace(PHONE_PATTERN, "[téléphone]");
  return safe ? safe : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateAnalyticsEvent(value: unknown): AnalyticsEvent | null {
  if (!isRecord(value)) return null;

  switch (value.type) {
    case "pageView": {
      const path = safeText(value.path, 250);
      const title = safeText(value.title, 120);
      if (!path?.startsWith("/") || path.includes("?") || path.includes("#") || !title) return null;
      return { type: "pageView", path, title };
    }
    case "productListView": {
      const category = safeText(value.category, 100);
      if (!category || !Array.isArray(value.productIds) || value.productIds.length > 100) return null;
      const productIds = value.productIds.filter((id): id is string => typeof id === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(id));
      if (productIds.length !== value.productIds.length) return null;
      return { type: "productListView", category, productIds };
    }
    case "productView": {
      const productId = safeText(value.productId, 80);
      const name = safeText(value.name, 180);
      if (!productId || !/^[a-zA-Z0-9_-]+$/.test(productId) || !name || typeof value.price !== "number" || !Number.isFinite(value.price) || value.price < 0) return null;
      return { type: "productView", productId, name, price: value.price };
    }
    case "search": {
      const query = safeText(value.query, 120);
      return query ? { type: "search", query } : null;
    }
    case "accountRegistration": {
      if ((value.accountType !== "particulier" && value.accountType !== "professionnel") || typeof value.marketingConsent !== "boolean") return null;
      return { type: "accountRegistration", accountType: value.accountType, marketingConsent: value.marketingConsent };
    }
    case "newsletterSubscribe":
      return { type: "newsletterSubscribe" };
    default:
      return null;
  }
}
