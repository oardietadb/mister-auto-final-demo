export type DemoAccount = {
  firstName: string;
  lastName: string;
  email: string;
  kind: "particulier" | "professionnel";
  marketingConsent?: boolean;
  company?: string;
  siret?: string;
  activity?: string;
  phone?: string;
};

export type LocalUserOptIns = {
  email: boolean;
  sms: boolean;
  push: boolean;
};

export type LocalUser = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  customerType: "B2C" | "B2B";
  companyName: string | null;
  optIns: LocalUserOptIns;
};

export const LOCAL_USER_STORAGE_KEY = "mister-auto-demo-user";

export function storeLocalUser(profile: DemoAccount, optIns?: LocalUserOptIns): void {
  if (typeof window === "undefined") return;
  const user: LocalUser = {
    email: profile.email.trim().toLocaleLowerCase("fr"),
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone ?? null,
    customerType: profile.kind === "professionnel" ? "B2B" : "B2C",
    companyName: profile.company ?? null,
    optIns: optIns ?? { email: profile.marketingConsent ?? false, sms: false, push: false },
  };
  window.localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(user));
}

export type DemoRegistration = DemoAccount & {
  password: string;
  marketingConsent: boolean;
  acceptedTerms: boolean;
};

export type RegistrationResult = {
  profile: DemoAccount | null;
  requiresEmailConfirmation: boolean;
};

export interface AuthAdapter {
  normalizeAccount(profile: DemoAccount): DemoAccount;
  register(profile: DemoRegistration): Promise<RegistrationResult>;
  signIn(email: string, password: string): Promise<DemoAccount>;
  getSession(): Promise<DemoAccount | null>;
  signOut(): Promise<void>;
}

async function readResponse<T>(response: Response): Promise<T> {
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "La demande n’a pas abouti.");
  return result;
}

export const supabaseAuthAdapter: AuthAdapter = {
  normalizeAccount(profile) {
    return { ...profile, email: profile.email.trim().toLocaleLowerCase("fr") };
  },
  async register(profile) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const result = await readResponse<RegistrationResult>(response);
    return { ...result, profile: result.profile ? this.normalizeAccount(result.profile) : null };
  },
  async signIn(email, password) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await readResponse<{ profile: DemoAccount }>(response);
    return this.normalizeAccount(result.profile);
  },
  async getSession() {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const result = await readResponse<{ profile: DemoAccount | null }>(response);
    return result.profile ? this.normalizeAccount(result.profile) : null;
  },
  async signOut() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    await readResponse<{ signedOut: boolean }>(response);
  },
};
