import { NextResponse } from "next/server";
import { retrieveOmiseCharge } from "@/lib/services/omise";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

export async function POST(request: Request) {
  const event = await request.json() as { key?: string; data?: { id?: string } };
  if (!event.key?.startsWith("charge.") || !event.data?.id) return NextResponse.json({ received: true });
  try {
    // Never trust webhook fields alone: retrieve the canonical charge using the secret key.
    const charge = await retrieveOmiseCharge(event.data.id);
    if (charge.currency !== "thb" && charge.currency !== "THB") return NextResponse.json({ error: "Unexpected currency" }, { status: 422 });
    const admin = createSupabaseAdminClient();
    const { data: attempt, error } = await admin.from("payment_attempts").select("id,status").eq("provider_charge_id", charge.id).maybeSingle();
    if (error) throw error;
    if (!attempt) return NextResponse.json({ received: true, ignored: "unknown_charge" });
    if (charge.paid && attempt.status !== "successful") {
      const result = await admin.rpc("confirm_test_payment", { p_attempt_id: attempt.id, p_provider_charge_id: charge.id, p_raw: charge as unknown as Json });
      if (result.error) throw result.error;
      return NextResponse.json({ received: true, bookingId: result.data.id });
    }
    if (["failed","expired"].includes(charge.status)) await admin.from("payment_attempts").update({ status: charge.status as "failed"|"expired", raw: charge as unknown as Json }).eq("id", attempt.id);
    return NextResponse.json({ received: true, chargeId: charge.id, verifiedStatus: charge.status });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Verification failed" }, { status: 400 }); }
}
