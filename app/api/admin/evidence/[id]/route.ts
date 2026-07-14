import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { applicationRequirements, complianceRequirements } from "@/lib/verification";

const schema = z.object({
  action: z.enum(["verify", "reject"]),
  note: z.string().trim().max(1000).default(""),
});

async function requireStaff() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "staff") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || (parsed.data.action === "reject" && !parsed.data.note)) {
    return NextResponse.json({ error: "A rejection note is required" }, { status: 400 });
  }
  const staff = await requireStaff();
  if ("error" in staff) return staff.error;
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data: doc, error } = await admin.from("evidence_documents").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: "Evidence not found" }, { status: 404 });

  let assigned = false;
  if (doc.application_id) {
    const { data: parent } = await admin.from("partner_applications").select("status,reviewer_id").eq("id", doc.application_id).single();
    assigned = parent?.status === "under_review" && parent.reviewer_id === staff.user.id;
  } else if (doc.compliance_case_id) {
    const { data: parent } = await admin.from("property_compliance_cases").select("status,reviewer_id").eq("id", doc.compliance_case_id).single();
    assigned = parent?.status === "under_review" && parent.reviewer_id === staff.user.id;
  }
  if (!assigned) return NextResponse.json({ error: "Start and own this review before deciding evidence" }, { status: 409 });

  if (parsed.data.action === "verify") {
    let requirement;
    if (doc.application_id) {
      const { data: app } = await admin.from("partner_applications").select("applicant_type,relationship,vat_registered,has_foreign_involvement").eq("id", doc.application_id).single();
      requirement = app && applicationRequirements({ applicantType: app.applicant_type, relationship: app.relationship, vatRegistered: app.vat_registered, hasForeignInvolvement: app.has_foreign_involvement }).find(row => row.code === doc.requirement_code);
    } else {
      const { data: item } = await admin.from("property_compliance_cases").select("legal_path").eq("id", doc.compliance_case_id!).single();
      requirement = item && complianceRequirements(item.legal_path).find(row => row.code === doc.requirement_code);
    }
    if (requirement?.expires && !doc.expires_on) return NextResponse.json({ error: "Expiry date is required before verification" }, { status: 422 });
    if (doc.expires_on && doc.expires_on < new Date().toISOString().slice(0, 10)) return NextResponse.json({ error: "Expired evidence cannot be verified" }, { status: 422 });
  }

  const status = parsed.data.action === "verify" ? "verified" : "rejected";
  const result = await admin.from("evidence_documents").update({ status, reviewed_by: staff.user.id, reviewed_at: new Date().toISOString(), review_note: parsed.data.note || null }).eq("id", id);
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 422 });
  await admin.from("verification_events").insert({ application_id: doc.application_id, compliance_case_id: doc.compliance_case_id, evidence_id: id, actor_id: staff.user.id, action: `evidence.${status}`, note: parsed.data.note || null });
  return NextResponse.json({ id, status });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purpose = new URL(request.url).searchParams.get("purpose")?.trim();
  if (!purpose) return NextResponse.json({ error: "Review purpose is required" }, { status: 400 });
  const staff = await requireStaff();
  if ("error" in staff) return staff.error;
  const admin = createSupabaseAdminClient();
  const { data: doc } = await admin.from("evidence_documents").select("storage_path").eq("id", id).single();
  if (!doc?.storage_path) return NextResponse.json({ error: "Evidence unavailable" }, { status: 404 });
  const { data, error } = await admin.storage.from("partner-evidence").createSignedUrl(doc.storage_path, 300);
  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  await admin.from("evidence_access_events").insert({ evidence_id: id, actor_id: staff.user.id, purpose });
  return NextResponse.json({ url: data.signedUrl, expiresIn: 300 });
}
