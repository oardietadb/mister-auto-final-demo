export type DemoAccount = {
  firstName: string;
  lastName: string;
  email: string;
  kind: "particulier" | "professionnel";
  company?: string;
};

export interface AuthAdapter {
  createDemoSession(profile: DemoAccount): DemoAccount;
}

export const demoAuthAdapter: AuthAdapter = {
  createDemoSession(profile) {
    return { ...profile, email: profile.email.trim().toLocaleLowerCase("fr") };
  },
};
