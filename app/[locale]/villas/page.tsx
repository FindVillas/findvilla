import { SlidersHorizontal } from "lucide-react";
import { VillaCard } from "@/components/villa-card";
import { MapPanel } from "@/components/map-panel";
import { getDestinations, getVillas } from "@/lib/repositories/catalog";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const metadata = { title: "Private villas in Thailand" };

export default async function VillasPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string,string|undefined>> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const selected = query.destination;
  const [destinations, filtered] = await Promise.all([getDestinations(), getVillas(selected)]);
  const title = selected ? destinations.find(d => d.slug === selected)?.name[locale] : locale === "th" ? "วิลล่าส่วนตัวทั่วประเทศไทย" : "Private villas across Thailand";
  return <>
    <section className="page-hero"><div className="container"><div className="eyebrow muted">{locale === "th" ? "คอลเลกชันที่คัดสรร" : "Our curated collection"}</div><h1 className="serif">{title}</h1><p className="muted">{locale === "th" ? "พื้นที่พิเศษ บริการใส่ใจ และอิสระในการพักผ่อนในแบบของคุณ" : "Exceptional space, attentive service, and the freedom to settle in your own way."}</p></div></section>
    <div className="filter-strip"><div className="container filter-row"><a href={`/${locale}/villas`} className={`filter-chip ${!selected ? "active" : ""}`}>{locale === "th" ? "ทุกจุดหมาย" : "All destinations"}</a>{destinations.map(d => <a href={`/${locale}/villas?destination=${d.slug}`} className={`filter-chip ${selected === d.slug ? "active" : ""}`} key={d.slug}>{d.name[locale]}</a>)}<button className="filter-chip"><SlidersHorizontal size={14}/> {locale === "th" ? "ตัวกรอง" : "Filters"}</button></div></div>
    <div className="container results-layout"><div><div className="results-head"><strong>{filtered.length} {locale === "th" ? "วิลล่า" : "villas"}</strong><span className="muted">{locale === "th" ? "เรียงตาม: แนะนำ" : "Sort: Recommended"}</span></div><div className="results-grid">{filtered.map(v => <VillaCard villa={v} locale={locale} key={v.id}/>)}</div></div><MapPanel villas={filtered}/></div>
  </>;
}
