import { NextResponse } from "next/server";
import type { DemoAccount } from "@/lib/auth";
import { readJsonBody } from "@/lib/server/read-json-body";
import { createSupabaseServerClient, SupabaseConfigurationError } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return NextResponse.json({ error: "Les informations transmises sont invalides." }, { status: parsed.status });
  if (!isRecord(parsed.value)) return NextResponse.json({ error: "Veuillez renseigner votre adresse e-mail et votre mot de passe." }, { status: 400 });

  const { email, password } = parsed.value;
  if (typeof email !== "string" || email.length > 254 || !EMAIL_PATTERN.test(email.trim()) || typeof password !== "string" || password.length < 1 || password.length > 128) {
    return NextResponse.json({ error: "Vérifiez votre adresse e-mail et votre mot de passe." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLocaleLowerCase("fr"),
      password,
    });
    if (error || !data.user) {
      return NextResponse.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
    }

    const { data: row, error: profileError } = await supabase
      .from("customer_profiles")
      .select("email, first_name, last_name, account_type, company, siret, professional_activity, phone, marketing_consent")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profileError || !row) {
      console.error("Supabase customer profile lookup failed:", profileError);
      return NextResponse.json({ error: "Le profil du compte est introuvable. Contactez le support." }, { status: 500 });
    }

    const profile: DemoAccount = {
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      kind: row.account_type,
      marketingConsent: row.marketing_consent,
      ...(row.company ? { company: row.company } : {}),
      ...(row.siret ? { siret: row.siret } : {}),
      ...(row.professional_activity ? { activity: row.professional_activity } : {}),
      ...(row.phone ? { phone: row.phone } : {}),
    };
    return NextResponse.json({ profile }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Customer login could not reach Supabase:", error);
    return NextResponse.json({ error: "Le service de connexion est momentanément indisponible." }, { status: 502 });
  }
}
