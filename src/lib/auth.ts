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

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

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
  signIn(email: string, password: string, kind?: DemoAccount["kind"]): Promise<DemoAccount>;
  getSession(): Promise<DemoAccount | null>;
  signOut(): Promise<void>;
}

async function readResponse<T>(response: Response): Promise<T> {
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "La demande n’a pas abouti.");
  return result;
}

function readLocalUser(): DemoAccount | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(LOCAL_USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    const user = JSON.parse(stored) as Partial<LocalUser>;
    if (
      typeof user.email !== "string"
      || typeof user.firstName !== "string"
      || typeof user.lastName !== "string"
      || (user.customerType !== "B2C" && user.customerType !== "B2B")
    ) return null;
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: typeof user.phone === "string" ? user.phone : undefined,
      kind: user.customerType === "B2B" ? "professionnel" : "particulier",
      company: typeof user.companyName === "string" ? user.companyName : undefined,
    };
  } catch {
    return null;
  }
}

export const supabaseAuthAdapter: AuthAdapter = {
  normalizeAccount(profile) {
    return { ...profile, email: profile.email.trim().toLocaleLowerCase("fr") };
  },
  async register(profile) {
    if (!isSupabaseConfigured()) {
      return { profile: this.normalizeAccount(profile), requiresEmailConfirmation: false };
    }
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const result = await readResponse<RegistrationResult>(response);
    return { ...result, profile: result.profile ? this.normalizeAccount(result.profile) : null };
  },
  async signIn(email, password, kind = "particulier") {
    if (!isSupabaseConfigured()) {
      const normalizedEmail = email.trim().toLocaleLowerCase("fr");
      const storedProfile = readLocalUser();
      if (storedProfile?.email === normalizedEmail) return storedProfile;
      const name = normalizedEmail.split("@")[0]?.replace(/[._-]+/g, " ").trim();
      return this.normalizeAccount({
        email: normalizedEmail,
        firstName: name ? name.charAt(0).toLocaleUpperCase("fr") + name.slice(1) : "Client",
        lastName: "Démo",
        kind,
      });
    }
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await readResponse<{ profile: DemoAccount }>(response);
    return this.normalizeAccount(result.profile);
  },
  async getSession() {
    if (!isSupabaseConfigured()) return readLocalUser();
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const result = await readResponse<{ profile: DemoAccount | null }>(response);
    return result.profile ? this.normalizeAccount(result.profile) : null;
  },
  async signOut() {
    if (!isSupabaseConfigured()) return;
    const response = await fetch("/api/auth/logout", { method: "POST" });
    await readResponse<{ signedOut: boolean }>(response);
  },
};
