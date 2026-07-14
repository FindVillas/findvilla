import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  villaId: z.string().min(1),
  checkIn: z.iso.date(),
  checkOut: z.iso.date(),
  guests: z.number().int().min(1).max(30),
  locale: z.enum(["en","th"]),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking request", details: parsed.error.flatten() }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { data, error } = await supabase.rpc("submit_booking_request", {
    p_villa_id: parsed.data.villaId,
    p_check_in: parsed.data.checkIn,
    p_check_out: parsed.data.checkOut,
    p_guests: parsed.data.guests,
    p_locale: parsed.data.locale,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json({ id: data.id, reference: data.reference, status: data.status, responseDueAt: data.response_due_at, quote: data.quote_snapshot });
}
