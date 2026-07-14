import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Headphones, ShieldCheck } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { VillaCard } from "@/components/villa-card";
import { copy, isLocale } from "@/lib/i18n";
import { getDestinations, getVillas } from "@/lib/repositories/catalog";
import { notFound } from "next/navigation";

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [destinations, villas] = await Promise.all([getDestinations(), getVillas()]);
  const c = copy[locale];
  const promises = locale === "th" ? [
    ["คัดสรรและตรวจสอบ", "ทีมงานตรวจสอบวิลล่า รายละเอียด และมาตรฐานบริการก่อนเผยแพร่"],
    ["ราคาโปร่งใส", "ดูรายละเอียดราคา ค่าธรรมเนียม และเงื่อนไขที่ชัดเจนก่อนส่งคำขอ"],
    ["ทีมงานพร้อมช่วยเหลือ", "คำแนะนำจากผู้เชี่ยวชาญในพื้นที่ตั้งแต่เริ่มค้นหาจนถึงวันเดินทาง"],
  ] : [
    ["Selected and verified", "Our team reviews every villa, detail, and service standard before it goes live."],
    ["Transparent pricing", "See a clear breakdown of rates, fees, and terms before sending your request."],
    ["Human support", "Thoughtful help from people who know the destination, from search to arrival."],
  ];
  const icons = [BadgeCheck, ShieldCheck, Headphones];
  return <>
    <section className="hero"><div className="container"><div className="hero-content">
      <div className="eyebrow">{c.heroEyebrow}</div><h1 className="serif">{c.heroTitle}</h1><p>{c.heroBody}</p><SearchBar locale={locale} destinations={destinations}/>
    </div></div></section>

    <section className="section"><div className="container">
      <div className="intro-row"><div><div className="eyebrow muted">The FindVillas collection</div><h2 className="section-title serif">{c.featured}</h2></div><p className="muted">{c.featuredBody}</p></div>
      <div className="villa-grid">{villas.filter(v => v.featured).map(v => <VillaCard key={v.id} villa={v} locale={locale}/>)}</div>
      <div style={{textAlign:"center", marginTop:42}}><Link href={`/${locale}/villas`} className="btn btn-outline">{c.viewAll}<ArrowRight size={17}/></Link></div>
    </div></section>

    <section className="section destinations-section" id="destinations"><div className="container">
      <div className="eyebrow" style={{color:"#dba58f"}}>{locale === "th" ? "สำรวจประเทศไทย" : "Explore Thailand"}</div>
      <h2 className="section-title serif" style={{maxWidth:700, marginTop:12}}>{locale === "th" ? "ค้นหาจุดหมายที่เหมาะกับคุณ" : "Find your place in a country of contrasts."}</h2>
      <div className="destination-grid">{destinations.map(d => <Link className="destination-card" href={`/${locale}/villas?destination=${d.slug}`} key={d.slug}><Image src={d.image} alt={d.name[locale]} fill sizes="50vw"/><div className="destination-copy"><h3 className="serif">{d.name[locale]}</h3><p>{d.tagline[locale]}</p></div></Link>)}</div>
    </div></section>

    <section className="section"><div className="container promise">
      <div className="promise-image"><Image src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1300&q=86" alt="Villa host preparing a private stay" fill sizes="50vw"/></div>
      <div><div className="eyebrow muted">{locale === "th" ? "มาตรฐานของเรา" : "The FindVillas difference"}</div><h2 className="section-title serif" style={{marginTop:12}}>{locale === "th" ? "การพักผ่อนที่เป็นส่วนตัว ไม่ใช่เรื่องยุ่งยาก" : "Private travel, made personal—not complicated."}</h2>
        <div className="promise-list">{promises.map(([title, body], index) => { const Icon = icons[index]; return <div className="promise-item" key={title}><span className="promise-icon"><Icon size={20}/></span><div><h3>{title}</h3><p>{body}</p></div></div>; })}</div>
      </div>
    </div></section>

    <section className="section" style={{paddingTop:0}}><div className="container"><div className="cta-panel"><h2 className="section-title serif">{locale === "th" ? "มีวิลล่าที่โดดเด่นในประเทศไทย? มาร่วมงานกับเรา" : "Own an exceptional villa in Thailand? Let’s work together."}</h2><Link className="btn btn-light" href={`/${locale}/partner/apply`}>{locale === "th" ? "สมัครเป็นพาร์ทเนอร์" : "Become a partner"}<ArrowRight size={17}/></Link></div></div></section>
  </>;
}
