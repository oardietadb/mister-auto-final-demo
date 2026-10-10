import { NextResponse } from "next/server";
import { clearDemoEvents, listDemoEvents } from "@/lib/server/demo-repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ events: listDemoEvents(), storage: "temporary-process-memory" }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function DELETE() {
  clearDemoEvents();
  return NextResponse.json({ cleared: true }, { headers: { "Cache-Control": "no-store" } });
}
