import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { money, copy } from "@/lib/i18n";
import type { Locale, Villa } from "@/lib/types";

export function VillaCard({ villa, locale }: { villa: Villa; locale: Locale }) {
  const c = copy[locale];
  return <article className="villa-card">
    <Link href={`/${locale}/villas/${villa.slug}`}>
      <div className="villa-image"><Image src={villa.images[0]} alt={villa.name} fill sizes="(max-width: 650px) 100vw, 33vw" />
        <div className="villa-badges">{villa.tags.slice(0,2).map(tag => <span className="pill" key={tag.en}>{tag[locale]}</span>)}</div>
        <span className="icon-btn heart" aria-label="Save villa"><Heart size={17}/></span>
      </div>
      <div className="villa-meta"><div className="villa-place">{villa.area[locale]}</div><div className="villa-name-row"><h3 className="villa-name serif">{villa.name}</h3><span className="rating"><Star size={12} fill="currentColor"/> {villa.rating}</span></div>
        <div className="villa-facts">{villa.bedrooms} {locale === "th" ? "ห้องนอน" : "bedrooms"} · {locale === "th" ? "สูงสุด" : "up to"} {villa.maxGuests} {locale === "th" ? "คน" : "guests"}</div>
        <div className="villa-price">{c.from} <strong>{money(villa.baseRateThb, locale)}</strong> {c.perNight}</div>
      </div>
    </Link>
  </article>;
}
