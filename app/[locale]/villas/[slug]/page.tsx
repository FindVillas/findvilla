import Image from "next/image";
import { notFound } from "next/navigation";
import { Bath, BedDouble, Check, MapPin, Star, Users } from "lucide-react";
import { BookingPanel } from "@/components/booking-panel";
import { getDestinationBySlug, getVillaBySlug, getVillas } from "@/lib/repositories/catalog";
import { isLocale } from "@/lib/i18n";

export async function generateStaticParams() { const villas = await getVillas(); return villas.flatMap(v => ["en","th"].map(locale => ({locale,slug:v.slug}))); }

export default async function VillaDetail({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const villa = await getVillaBySlug(slug); if (!villa) notFound();
  const destination = await getDestinationBySlug(villa.destination);
  return <div className="container">
    <div className="villa-gallery">{villa.images.slice(0,3).map((image,index)=><div className="gallery-image" key={image}><Image src={image} fill priority={index===0} sizes={index===0?"70vw":"35vw"} alt={`${villa.name} view ${index+1}`}/></div>)}</div>
    <div className="villa-layout"><div>
      <div className="eyebrow" style={{color:"var(--terracotta-dark)"}}>{destination?.name[locale]} · {villa.managed ? "FindVillas managed" : "Verified partner"}</div>
      <h1 className="detail-title serif">{villa.name}</h1>
      <div className="detail-facts"><span><MapPin size={15}/> {villa.area[locale]}</span><span><Star size={14} fill="currentColor"/> {villa.rating} ({villa.reviews})</span></div>
      <section className="detail-section" style={{marginTop:30}}><div className="detail-facts"><span><BedDouble size={18}/> {villa.bedrooms} bedrooms</span><span><Bath size={18}/> {villa.bathrooms} bathrooms</span><span><Users size={18}/> Up to {villa.maxGuests} guests</span></div></section>
      <section className="detail-section"><h2 className="serif">{locale === "th" ? "เกี่ยวกับวิลล่า" : "About this villa"}</h2><p className="detail-description">{villa.description[locale]}</p></section>
      <section className="detail-section"><h2 className="serif">{locale === "th" ? "สิ่งอำนวยความสะดวก" : "What this place offers"}</h2><div className="amenity-grid">{villa.amenities.map(item=><div className="amenity" key={item}><span className="promise-icon" style={{width:32,height:32}}><Check size={15}/></span>{item}</div>)}</div></section>
      <section className="detail-section"><h2 className="serif">{locale === "th" ? "ที่ตั้ง" : "Location"}</h2><div className="notice" style={{background:"var(--sage)",color:"var(--ink)"}}>For privacy, the map shows an approximate location. Exact arrival details are shared only for confirmed stays.</div><div className="map-panel" style={{position:"relative",top:0,height:330,minHeight:0}}><div className="map-fallback"><span className="map-pin" style={{left:"52%",top:"47%"}}>{villa.area[locale]}</span></div></div></section>
    </div><BookingPanel villa={villa} locale={locale}/></div>
  </div>;
}
