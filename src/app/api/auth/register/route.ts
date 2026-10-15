import { NextResponse } from "next/server";
import type { DemoAccount } from "@/lib/auth";
import { readJsonBody } from "@/lib/server/read-json-body";
import { createSupabaseServerClient, SupabaseConfigurationError } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9(). -]{7,20}$/;
const PROFESSIONAL_ACTIVITIES = new Set([
  "Garage / réparateur",
  "Carrosserie",
  "Revendeur de pièces auto",
  "Autre professionnel automobile",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return NextResponse.json({ error: "Les informations transmises sont invalides." }, { status: parsed.status });
  const body = parsed.value;
  if (!isRecord(body)) return NextResponse.json({ error: "Les informations du compte sont incomplètes." }, { status: 400 });

  const { firstName, lastName, email, password, kind, acceptedTerms, marketingConsent } = body;
  if (
    typeof firstName !== "string" || firstName.trim().length < 1 || firstName.length > 80
    || typeof lastName !== "string" || lastName.trim().length < 1 || lastName.length > 80
    || typeof email !== "string" || email.length > 254 || !EMAIL_PATTERN.test(email.trim())
    || typeof password !== "string" || password.length < 8 || password.length > 128
    || kind !== "particulier" && kind !== "professionnel"
    || acceptedTerms !== true
    || typeof marketingConsent !== "boolean"
  ) {
    return NextResponse.json({ error: "Vérifiez les champs obligatoires, le mot de passe et les conditions." }, { status: 400 });
  }

  const profile: DemoAccount = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLocaleLowerCase("fr"),
    kind,
    marketingConsent,
  };
  const metadata: Record<string, string | boolean | null> = {
    first_name: profile.firstName,
    last_name: profile.lastName,
    account_type: kind,
    marketing_consent: marketingConsent,
    terms_accepted: true,
    company: null,
    siret: null,
    professional_activity: null,
    phone: null,
  };

  if (kind === "professionnel") {
    const { company, siret, activity, phone } = body;
    if (
      typeof company !== "string" || !company.trim() || company.length > 120
      || typeof siret !== "string" || !/^\d{14}$/.test(siret)
      || typeof activity !== "string" || !PROFESSIONAL_ACTIVITIES.has(activity)
      || typeof phone !== "string" || !PHONE_PATTERN.test(phone.trim())
    ) {
      return NextResponse.json({ error: "Vérifiez les informations professionnelles et le SIRET (14 chiffres)." }, { status: 400 });
    }
    Object.assign(profile, {
      company: company.trim(),
      siret,
      activity,
      phone: phone.trim(),
    });
    Object.assign(metadata, {
      company: company.trim(),
      siret,
      professional_activity: activity,
      phone: phone.trim(),
    });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: profile.email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: new URL("/auth/callback", request.url).toString(),
      },
    });

    if (error) {
      if (error.code === "user_already_exists" || error.code === "email_exists") {
        return NextResponse.json({ error: "Un compte existe déjà pour cette adresse e-mail." }, { status: 409 });
      }
      console.error("Supabase customer registration failed:", error);
      return NextResponse.json({ error: "La création du compte a échoué. Vérifiez la configuration e-mail Supabase et réessayez." }, { status: 502 });
    }

    if (!data.user) {
      console.error("Supabase signup succeeded without returning a user.");
      return NextResponse.json({ error: "La création du compte n’a pas pu être confirmée." }, { status: 502 });
    }

    return NextResponse.json({
      profile: data.session ? profile : null,
      requiresEmailConfirmation: !data.session,
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Customer registration could not reach Supabase:", error);
    return NextResponse.json({ error: "Le service d’inscription est momentanément indisponible." }, { status: 502 });
  }
}
