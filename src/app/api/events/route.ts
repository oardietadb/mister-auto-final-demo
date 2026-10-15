import { NextResponse } from "next/server";
import { saveDemoEvent } from "@/lib/server/demo-repositories";
import { deliverEventExternally } from "@/lib/server/event-adapter";
import { readJsonBody } from "@/lib/server/read-json-body";
import { createSupabaseServerClient, SupabaseConfigurationError } from "@/lib/supabase/server";
import { validateAnalyticsEvent } from "@/lib/event-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.status === 413 ? "La requête dépasse la taille autorisée." : "Le corps JSON est invalide." }, { status: parsed.status });
  const event = validateAnalyticsEvent(parsed.value);
  if (!event) return NextResponse.json({ error: "L’événement n’est pas valide." }, { status: 400 });

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("storefront_events").insert({ payload: event });
    if (error) {
      console.error("Supabase analytics event insert failed:", error);
      return NextResponse.json({ error: "L’événement n’a pas pu être enregistré." }, { status: 502 });
    }

    const externalDelivery = await deliverEventExternally(event);
    saveDemoEvent(event, externalDelivery);
    return NextResponse.json({
      accepted: true,
      storage: "supabase",
      externalDelivery,
    }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Analytics event could not reach Supabase:", error);
    return NextResponse.json({ error: "Le service d’événements est momentanément indisponible." }, { status: 502 });
  }
}
