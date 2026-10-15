import { NextResponse } from "next/server";
import { createSupabaseServerClient, SupabaseConfigurationError } from "@/lib/supabase/server";
import type { DemoAccount } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) return NextResponse.json({ profile: null }, { headers: { "Cache-Control": "no-store" } });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) return NextResponse.json({ profile: null }, { headers: { "Cache-Control": "no-store" } });

    const { data: row, error: profileError } = await supabase
      .from("customer_profiles")
      .select("email, first_name, last_name, account_type, company, siret, professional_activity, phone, marketing_consent")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!row) return NextResponse.json({ profile: null }, { headers: { "Cache-Control": "no-store" } });

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
    console.error("Supabase session restoration failed:", error);
    return NextResponse.json({ error: "La session du compte n’a pas pu être vérifiée." }, { status: 502 });
  }
}
