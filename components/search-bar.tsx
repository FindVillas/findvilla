import { Search } from "lucide-react";
import type { Locale } from "@/lib/types";
import { copy } from "@/lib/i18n";
import type { Destination } from "@/lib/types";

export function SearchBar({ locale, destinations }: { locale: Locale; destinations: Destination[] }) {
  const c = copy[locale];
  return <form className="search-bar" action={`/${locale}/villas`}>
    <div className="search-field"><label htmlFor="destination">{c.where}</label><select id="destination" name="destination" defaultValue=""><option value="">{locale === "th" ? "ทุกจุดหมาย" : "Choose a destination"}</option>{destinations.map(d => <option value={d.slug} key={d.slug}>{d.name[locale]}</option>)}</select></div>
    <div className="search-field"><label htmlFor="checkin">{c.when}</label><input id="checkin" name="checkin" type="date" /></div>
    <div className="search-field"><label htmlFor="guests">{c.guests}</label><select id="guests" name="guests" defaultValue="6"><option>2</option><option>4</option><option>6</option><option>8</option><option>10</option><option>12</option></select></div>
    <button className="btn btn-primary" type="submit"><Search size={18}/>{c.search}</button>
  </form>;
}
