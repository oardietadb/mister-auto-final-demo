import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/server/read-json-body";
import { createSupabaseServerClient, SupabaseConfigurationError } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return NextResponse.json({ error: "Les informations transmises sont invalides." }, { status: parsed.status });
  const body = parsed.value;
  if (typeof body !== "object" || body === null || !("email" in body) || !("consent" in body)) {
    return NextResponse.json({ error: "Veuillez renseigner une adresse e-mail et donner votre accord." }, { status: 400 });
  }
  const email = body.email;
  if (typeof email !== "string" || email.length > 254 || !EMAIL_PATTERN.test(email.trim()) || body.consent !== true) {
    return NextResponse.json({ error: "Vérifiez votre adresse e-mail et votre accord de réception." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("newsletter_subscriptions").insert({
      email: email.trim().toLocaleLowerCase("fr"),
      consent: true,
      consented_at: new Date().toISOString(),
    });
    if (error?.code === "23505") {
      return NextResponse.json({ message: "Cette adresse est déjà inscrite.", alreadySubscribed: true }, { headers: { "Cache-Control": "no-store" } });
    }
    if (error) {
      console.error("Supabase newsletter subscription failed:", error);
      return NextResponse.json({ error: "Votre inscription n’a pas pu être enregistrée. Réessayez plus tard." }, { status: 502 });
    }

    return NextResponse.json({
      message: "Votre inscription et votre consentement ont été enregistrés.",
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Newsletter subscription could not reach Supabase:", error);
    return NextResponse.json({ error: "Le service newsletter est momentanément indisponible." }, { status: 502 });
  }
}
