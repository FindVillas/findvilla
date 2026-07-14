"use client";

import { useState } from "react";
import { Chrome } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/types";

export function LoginCard({ locale, nextPath, error, localEnabled }: { locale: Locale; nextPath?: string; error?: string; localEnabled:boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(error);

  async function signIn() {
    setLoading(true);
    setMessage(undefined);
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", nextPath?.startsWith("/") ? nextPath : `/${locale}/trips`);
    const { error: authError } = await createSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });
    if (authError) {
      setMessage(authError.message);
      setLoading(false);
    }
  }

  async function localSignIn(persona:"guest"|"partner"|"staff") { setLoading(true); setMessage(undefined); const response=await fetch("/api/local/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({persona})});const data=await response.json();if(!response.ok){setMessage(data.error??"Local sign in failed");setLoading(false);return;}window.location.assign(persona==="staff"?`/${locale}/admin`:persona==="partner"?`/${locale}/partner`:(nextPath?.startsWith("/")?nextPath:`/${locale}/trips`)); }

  return <div className="dashboard-shell"><div className="container" style={{maxWidth:560}}><div className="panel" style={{padding:36,textAlign:"center"}}>
    <div className="eyebrow muted">Secure account</div>
    <h1 className="serif" style={{fontSize:42,fontWeight:400}}>{locale === "th" ? "เข้าสู่ระบบ FindVillas" : "Sign in to FindVillas"}</h1>
    <p className="muted">{locale === "th" ? "ใช้ Google เพื่อจัดการคำขอ การชำระเงิน และทริปของคุณ" : "Use Google to manage requests, payments, and your trips."}</p>
    {message && <div className="notice" style={{marginBottom:18}}>{message}</div>}
    <button className="btn btn-dark" style={{width:"100%"}} onClick={signIn} disabled={loading}><Chrome size={18}/>{loading ? "Redirecting…" : "Continue with Google"}</button>
    {localEnabled&&<div style={{marginTop:22}}><p className="fine-print">Local test sessions</p><div className="action-row" style={{justifyContent:"center"}}>{(["guest","partner","staff"] as const).map(persona=><button key={persona} className="mini-btn" onClick={()=>localSignIn(persona)} disabled={loading}>{persona}</button>)}</div></div>}
    <p className="fine-print">Local Google OAuth requires the local callback URL and credentials described in README.</p>
  </div></div></div>;
}
