export type DemoAccount = {
  firstName: string;
  lastName: string;
  email: string;
  kind: "particulier" | "professionnel";
  company?: string;
  siret?: string;
  activity?: string;
  phone?: string;
};

export type DemoRegistration = DemoAccount & {
  password: string;
  marketingConsent: boolean;
  acceptedTerms: boolean;
};

export interface AuthAdapter {
  createDemoSession(profile: DemoAccount): DemoAccount;
  register(profile: DemoRegistration): Promise<DemoAccount>;
}

export const demoAuthAdapter: AuthAdapter = {
  createDemoSession(profile) {
    return { ...profile, email: profile.email.trim().toLocaleLowerCase("fr") };
  },
  async register(profile) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const result = await response.json() as { profile?: DemoAccount; error?: string };
    if (!response.ok || !result.profile) {
      throw new Error(result.error ?? "La création du compte a échoué.");
    }
    return this.createDemoSession(result.profile);
  },
};
