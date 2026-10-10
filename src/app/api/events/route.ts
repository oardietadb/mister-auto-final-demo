import { NextResponse } from "next/server";
import { saveDemoEvent } from "@/lib/server/demo-repositories";
import { deliverEventExternally } from "@/lib/server/event-adapter";
import { readJsonBody } from "@/lib/server/read-json-body";
import { validateAnalyticsEvent } from "@/lib/event-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return NextResponse.json({ error: parsed.status === 413 ? "La requête dépasse la taille autorisée." : "Le corps JSON est invalide." }, { status: parsed.status });
  const event = validateAnalyticsEvent(parsed.value);
  if (!event) return NextResponse.json({ error: "L’événement n’est pas valide." }, { status: 400 });

  const externalDelivery = await deliverEventExternally(event);
  saveDemoEvent(event, externalDelivery);
  return NextResponse.json({
    accepted: true,
    storage: "temporary-process-memory",
    externalDelivery,
  }, { status: 202, headers: { "Cache-Control": "no-store" } });
}
