import Link from "next/link";
import { notFound } from "next/navigation";
import { PartnerRequestActions } from "@/components/partner-request-actions";
import { requireRole } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import type { Json } from "@/lib/supabase/database.types";

function quote(value: Json) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { nights: 0, nightlySubtotal: 0, serviceFee: 0, tax: 0, total: 0 };
  const row = value as Record<string, Json | undefined>;
  const number = (key: string) => typeof row[key] === "number" ? row[key] as number : 0;
  return { nights: number("nights"), nightlySubtotal: number("nightlySubtotal"), serviceFee: number("serviceFee"), tax: number("tax"), total: number("total") };
}

export default async function PartnerRequestPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const { supabase } = await requireRole(locale, "partner", `/${locale}/partner/requests/${id}`);
  const [{ data: request, error }, { data: reservation }, { data: payments }, { data: booking }] = await Promise.all([
    supabase.from("booking_requests").select("*,villas(name),profiles!booking_requests_guest_id_fkey(display_name,email)").eq("id", id).single(),
    supabase.from("reservations").select("id,status,expires_at,created_at").eq("request_id", id).maybeSingle(),
    supabase.from("payment_attempts").select("id,method,status,amount_thb,test_mode,created_at").eq("request_id", id).order("created_at", { ascending: false }),
    supabase.from("bookings").select("id,reference,status,test_mode,confirmed_at,cancelled_at").eq("request_id", id).maybeSingle(),
  ]);
  if (error || !request) notFound();
  const totals = quote(request.quote_snapshot);

  return <div className="dashboard-shell"><div className="container" style={{maxWidth:1000}}><Link className="muted" href={`/${locale}/partner`}>← Partner dashboard</Link><div className="dash-head" style={{marginTop:18}}><div><div className="eyebrow muted">Booking request · {request.reference}</div><h1 className="serif">{request.villas?.name ?? "Villa request"}</h1></div><span className={`status ${request.status === "submitted" ? "pending" : "live"}`}>{request.status.replaceAll("_", " ")}</span></div><div className="dash-grid"><div className="panel" style={{padding:24}}><h2>Guest and stay</h2><div className="quote-lines"><div className="quote-line"><span>Guest</span><strong>{request.profiles?.display_name ?? "Guest"}</strong></div><div className="quote-line"><span>Email</span><span>{request.profiles?.email ?? "—"}</span></div><div className="quote-line"><span>Dates</span><span>{request.check_in} → {request.check_out}</span></div><div className="quote-line"><span>Party</span><span>{request.guests} guests</span></div><div className="quote-line"><span>Response due</span><span>{new Date(request.response_due_at).toLocaleString()}</span></div></div>{request.status === "submitted" && <div style={{marginTop:20}}><PartnerRequestActions id={request.id}/></div>}</div><div className="panel" style={{padding:24}}><h2>Quote</h2><div className="quote-lines"><div className="quote-line"><span>{totals.nights} nights</span><span>฿{totals.nightlySubtotal.toLocaleString()}</span></div><div className="quote-line"><span>Service fee</span><span>฿{totals.serviceFee.toLocaleString()}</span></div><div className="quote-line"><span>Tax</span><span>฿{totals.tax.toLocaleString()}</span></div><div className="quote-line total"><strong>Total</strong><strong>฿{totals.total.toLocaleString()}</strong></div></div></div></div><div className="panel" style={{padding:24,marginTop:18}}><h2>Fulfilment timeline</h2><div className="activity-list"><div className="activity"><span className="activity-icon" aria-hidden>✓</span><div><p><strong>Request received</strong><br/>{request.status.replaceAll("_", " ")}</p><time>{new Date(request.created_at).toLocaleString()}</time></div></div>{reservation && <div className="activity"><span className="activity-icon" aria-hidden>⌛</span><div><p><strong>Reservation {reservation.status}</strong><br/>{reservation.expires_at ? `Hold expires ${new Date(reservation.expires_at).toLocaleString()}` : "No active expiry"}</p><time>{new Date(reservation.created_at).toLocaleString()}</time></div></div>}{payments?.map(payment => <div className="activity" key={payment.id}><span className="activity-icon" aria-hidden>฿</span><div><p><strong>Payment {payment.status}</strong><br/>{payment.method} · ฿{payment.amount_thb.toLocaleString()}{payment.test_mode ? " · test mode" : ""}</p><time>{new Date(payment.created_at).toLocaleString()}</time></div></div>)}{booking && <div className="activity"><span className="activity-icon" aria-hidden>✓</span><div><p><strong>Booking {booking.status}</strong><br/>{booking.reference}{booking.test_mode ? " · test mode" : ""}</p><time>{new Date(booking.confirmed_at).toLocaleString()}</time></div></div>}</div></div></div></div>;
}
