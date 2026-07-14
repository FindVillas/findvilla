import { notFound } from "next/navigation";
import { AdminVerificationReview } from "@/components/admin-verification-review";
import { requireRole } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { complianceRequirements } from "@/lib/verification";

function displayAddress(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "—";
  const address = value as Record<string, unknown>;
  return [address.line1, address.district, address.province, address.postalCode]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(", ");
}

export default async function ComplianceReviewPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const { supabase } = await requireRole(locale, "staff", `/${locale}/admin/compliance/${id}`);
  const [{ data: item, error }, { data: documents }, { data: events }] = await Promise.all([
    supabase.from("property_compliance_cases").select("*,villas(name,slug,bedrooms,bathrooms,max_guests)").eq("id", id).single(),
    supabase.from("evidence_documents").select("id,requirement_code,status,original_name,document_number,issuing_authority,issued_on,expires_on,review_note,version,created_at").eq("compliance_case_id", id).order("version", { ascending: false }),
    supabase.from("verification_events").select("id,action,note,created_at").eq("compliance_case_id", id).order("created_at", { ascending: false }),
  ]);
  if (error || !item) notFound();
  const requirements = complianceRequirements(item.legal_path);

  return <div className="dashboard-shell"><div className="container"><div className="eyebrow muted">Staff · Property compliance</div><h1 className="serif" style={{fontSize:44,fontWeight:400}}>{item.villas?.name ?? item.licensed_name}</h1><div className="dash-grid"><div><div className="panel" style={{padding:24,marginBottom:18}}><h2>Property summary</h2><div className="quote-lines"><div className="quote-line"><span>Licensed name</span><strong>{item.licensed_name}</strong></div><div className="quote-line"><span>Legal path</span><span>{item.legal_path.replaceAll("_", " ")}</span></div><div className="quote-line"><span>Capacity</span><span>{item.room_count} rooms · {item.guest_capacity} guests</span></div><div className="quote-line"><span>Listing capacity</span><span>{item.villas?.bedrooms ?? "—"} bedrooms · {item.villas?.max_guests ?? "—"} guests</span></div><div className="quote-line"><span>Exact address</span><span>{displayAddress(item.exact_address)}</span></div><div className="quote-line"><span>Policy</span><span>{item.policy_version}</span></div></div></div><AdminVerificationReview kind="compliance" id={item.id} status={item.status} requirements={requirements} documents={documents ?? []}/></div><div className="panel" style={{padding:24}}><div className="panel-head"><h2>Immutable audit timeline</h2></div><div className="activity-list">{events?.length ? events.map(event=><div className="activity" key={event.id}><span className="activity-icon" aria-hidden>✓</span><div><p><strong>{event.action}</strong><br/>{event.note ?? "No note"}</p><time>{new Date(event.created_at).toLocaleString()}</time></div></div>) : <p className="muted">No review events yet.</p>}</div></div></div></div></div>;
}
