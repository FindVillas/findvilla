import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  action: z.enum(["start_review", "request_changes", "reject", "approve"]),
  note: z.string().trim().max(2000).default(""),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || (parsed.data.action !== "start_review" && !parsed.data.note)) {
    return NextResponse.json({ error: "A decision note is required" }, { status: 400 });
  }

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "staff") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (parsed.data.action === "approve") {
    const { data, error } = await supabase.rpc("approve_property_compliance", {
      p_case_id: id,
      p_note: parsed.data.note,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 422 });
    return NextResponse.json({ id, status: data.status });
  }

  const status = parsed.data.action === "start_review"
    ? "under_review"
    : parsed.data.action === "request_changes"
      ? "changes_requested"
      : "rejected";
  const update: {
    status: "under_review" | "changes_requested" | "rejected";
    reviewer_id: string;
    decision_note: string | null;
    reviewed_at?: string;
  } = { status, reviewer_id: user.id, decision_note: parsed.data.note || null };
  if (status === "rejected") update.reviewed_at = new Date().toISOString();

  let query = supabase
    .from("property_compliance_cases")
    .update(update)
    .eq("id", id);
  query = parsed.data.action === "start_review"
    ? query.eq("status", "submitted").is("reviewer_id", null)
    : query.eq("status", "under_review").eq("reviewer_id", user.id);
  const { error } = await query
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "This case is not assigned to you or is no longer reviewable" }, { status: 409 });
  await createSupabaseAdminClient().from("verification_events").insert({
    compliance_case_id: id,
    actor_id: user.id,
    action: `compliance.${status}`,
    note: parsed.data.note || null,
  });
  return NextResponse.json({ id, status });
}
