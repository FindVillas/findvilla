import Link from "next/link";
import { Menu, Palmtree } from "lucide-react";
import type { Locale } from "@/lib/types";
import { copy } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth-button";

export async function Header({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = user ? await supabase.from("partner_memberships").select("id").eq("user_id", user.id).maybeSingle() : { data: null };
  const other = locale === "en" ? "th" : "en";
  return <header className="site-header">
    <div className="container header-inner">
      <Link href={`/${locale}`} className="brand"><span className="brand-mark"><Palmtree size={18}/></span> FindVillas</Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href={`/${locale}/villas`}>{c.nav.villas}</Link>
        <Link href={`/${locale}#destinations`}>{c.nav.destinations}</Link>
        <Link href={membership ? `/${locale}/partner` : `/${locale}/partner/apply`}>{membership ? (locale === "th" ? "พอร์ทัลพาร์ทเนอร์" : "Partner portal") : c.nav.partners}</Link>
      </nav>
      <div className="header-actions">
        <Link className="locale-switch" href={`/${other}`}>{other === "th" ? "TH" : "EN"}</Link>
        <Link className="btn btn-outline" href={`/${locale}/trips`}>{c.nav.trips}</Link>
        {user ? <SignOutButton/> : <Link className="locale-switch" href={`/${locale}/login`}>Sign in</Link>}
        <button className="icon-btn" aria-label="Open menu"><Menu size={18}/></button>
      </div>
    </div>
  </header>;
}
