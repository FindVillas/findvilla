"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { calculateQuote } from "@/lib/quote";
import { money } from "@/lib/i18n";
import type { Locale, Villa } from "@/lib/types";

export function BookingPanel({ villa, locale }: { villa: Villa; locale: Locale }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("6");
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<string>();
  const [error, setError] = useState<string>();
  const quote = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    try { return calculateQuote(villa, checkIn, checkOut); } catch { return null; }
  }, [villa, checkIn, checkOut]);

  async function submitRequest() {
    setError(undefined);
    if (!quote) { setError(locale === "th" ? "กรุณาเลือกวันที่ให้ถูกต้อง" : "Choose valid travel dates first."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/booking-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ villaId: villa.id, checkIn, checkOut, guests: Number(guests), locale }) });
      const data = await response.json();
      if (response.status === 401) { window.location.href = `/${locale}/login?next=${encodeURIComponent(window.location.pathname)}`; return; }
      if (!response.ok) throw new Error(data.error ?? "Request failed");
      setRequestId(data.id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Request failed"); }
    finally { setLoading(false); }
  }

  if (requestId) return <aside className="booking-card"><div style={{textAlign:"center", padding:"12px 2px"}}><CheckCircle2 size={44} color="#b9684f"/><h2 className="serif" style={{fontWeight:400}}>Request sent</h2><p className="muted" style={{fontSize:14,lineHeight:1.6}}>The villa team has 24 hours to review your dates. We’ll notify you as soon as they respond.</p><div className="notice" style={{textAlign:"left"}}>Your request is saved in the local database. Checkout becomes available after partner approval.</div><Link className="btn btn-dark" href={`/${locale}/trips`}>Go to my trips</Link></div></aside>;

  return <aside className="booking-card">
    <div className="booking-price"><strong>{money(villa.baseRateThb, locale)}</strong> <span className="muted" style={{fontSize:13}}>/ {locale === "th" ? "คืน" : "night"}</span></div>
    <div className="notice">{locale === "th" ? "ส่งคำขอไปยังพาร์ทเนอร์ จะยังไม่มีการเรียกเก็บเงินจนกว่าจะอนุมัติ" : "Send a request to the partner. Payment is only available after approval."}</div>
    <div className="booking-grid">
      <div className="booking-field"><label htmlFor="check-in">{locale === "th" ? "เช็คอิน" : "Check in"}</label><input id="check-in" type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)}/></div>
      <div className="booking-field"><label htmlFor="check-out">{locale === "th" ? "เช็คเอาต์" : "Check out"}</label><input id="check-out" type="date" value={checkOut} min={checkIn} onChange={e=>setCheckOut(e.target.value)}/></div>
      <div className="booking-field full"><label htmlFor="guest-count">{locale === "th" ? "ผู้เข้าพัก" : "Guests"}</label><select id="guest-count" value={guests} onChange={e=>setGuests(e.target.value)}>{Array.from({length:villa.maxGuests-1},(_,i)=>i+2).map(n=><option key={n} value={n}>{n} {locale === "th" ? "คน" : "guests"}</option>)}</select></div>
    </div>
    {quote ? <div className="quote-lines"><div className="quote-line"><span>{money(quote.nightlySubtotal / quote.nights, locale)} × {quote.nights} nights</span><span>{money(quote.nightlySubtotal, locale)}</span></div><div className="quote-line"><span>Service fee</span><span>{money(quote.serviceFee, locale)}</span></div><div className="quote-line"><span>VAT</span><span>{money(quote.tax, locale)}</span></div><div className="quote-line quote-total"><span>Total in THB</span><span>฿{quote.total.toLocaleString()}</span></div></div> : <div style={{height:18}}/>}
    {error && <p style={{color:"#a33",fontSize:12}}>{error}</p>}
    <button className="btn btn-primary" type="button" onClick={submitRequest} disabled={loading}><CalendarCheck size={18}/>{loading ? "Sending…" : locale === "th" ? "เข้าสู่ระบบ Google และส่งคำขอ" : "Continue with Google & request"}</button>
    <p className="fine-print">{locale === "th" ? "คุณจะยังไม่ถูกเรียกเก็บเงิน พาร์ทเนอร์จะตอบกลับภายใน 24 ชั่วโมง" : "You won’t be charged. The partner will respond within 24 hours."}</p>
  </aside>;
}
