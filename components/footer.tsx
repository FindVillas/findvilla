import Link from "next/link";
import { Palmtree } from "lucide-react";
import type { Locale } from "@/lib/types";

export function Footer({ locale }: { locale: Locale }) {
  return <footer className="site-footer"><div className="container">
    <div className="footer-grid">
      <div className="footer-brand"><Link href={`/${locale}`} className="brand"><span className="brand-mark"><Palmtree size={18}/></span> FindVillas</Link><p>Private stays with soul, selected across Thailand for time well spent together.</p></div>
      <div className="footer-col"><h4>Explore</h4><Link href={`/${locale}/villas`}>All villas</Link><Link href={`/${locale}#destinations`}>Destinations</Link><Link href={`/${locale}/villas?featured=true`}>Featured stays</Link></div>
      <div className="footer-col"><h4>Company</h4><Link href="#">Our approach</Link><Link href={`/${locale}/partner`}>Partner with us</Link><Link href="#">Contact</Link></div>
      <div className="footer-col"><h4>Support</h4><Link href="#">Help centre</Link><Link href="#">Cancellation policy</Link><Link href="#">Privacy</Link></div>
    </div>
    <div className="footer-bottom"><span>© 2026 FindVillas Thailand. Pilot experience.</span><span>English · ไทย · THB</span></div>
  </div></footer>;
}
