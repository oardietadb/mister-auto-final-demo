export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      customer_profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          account_type: "particulier" | "professionnel";
          company: string | null;
          siret: string | null;
          professional_activity: string | null;
          phone: string | null;
          marketing_consent: boolean;
          marketing_consent_at: string | null;
          terms_accepted_at: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      newsletter_subscriptions: {
        Row: {
          id: string;
          email: string;
          consent: boolean;
          consented_at: string;
          confirmed_at: string | null;
        };
        Insert: {
          email: string;
          consent: boolean;
          consented_at?: string;
          confirmed_at?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      storefront_events: {
        Row: {
          id: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          payload: Json;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
