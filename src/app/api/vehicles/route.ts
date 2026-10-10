import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/server/read-json-body";
import { isVehicleSelection } from "@/lib/vehicles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return NextResponse.json({ error: "Les informations du véhicule sont invalides." }, { status: parsed.status });
  const body = parsed.value;
  if (!isVehicleSelection(body)) {
    return NextResponse.json({ error: "Choisissez une marque, un modèle et une motorisation proposés." }, { status: 400 });
  }
  const vehicle = {
    make: body.make,
    model: body.model,
    engine: body.engine,
    ...(body.registration ? { registration: body.registration.replace(/\s+/g, "").toLocaleUpperCase("fr") } : {}),
  };
  return NextResponse.json({ vehicle, validation: "demo-only" }, { headers: { "Cache-Control": "no-store" } });
}
