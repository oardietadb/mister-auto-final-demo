import { NextResponse } from "next/server";
import { addNewsletterSubscriber } from "@/lib/server/demo-repositories";
import { readJsonBody } from "@/lib/server/read-json-body";

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
  const added = addNewsletterSubscriber(email.trim().toLocaleLowerCase("fr"));
  return NextResponse.json({
    message: added ? "Merci, votre inscription de démonstration est enregistrée." : "Cette adresse est déjà inscrite.",
    storage: "temporary-process-memory",
  }, { status: added ? 201 : 200, headers: { "Cache-Control": "no-store" } });
}
