import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ action: z.enum(["approve", "decline"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const fn = body.data.action === "approve" ? "approve_booking_request" : "decline_booking_request";
  const { data, error } = await supabase.rpc(fn, { p_request_id: id });
  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json({ id: data.id, status: data.status });
}
