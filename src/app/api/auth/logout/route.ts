import { NextResponse } from "next/server";
import { createSupabaseServerClient, SupabaseConfigurationError } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase sign out failed:", error);
      return NextResponse.json({ error: "La déconnexion n’a pas pu être terminée." }, { status: 502 });
    }
    return NextResponse.json({ signedOut: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Supabase sign out could not reach Supabase:", error);
    return NextResponse.json({ error: "Le service de déconnexion est momentanément indisponible." }, { status: 502 });
  }
}
