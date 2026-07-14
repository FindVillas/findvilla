import type { Locale } from "./types";

export const locales: Locale[] = ["en", "th"];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const copy = {
  en: {
    nav: { villas: "Find a villa", destinations: "Destinations", partners: "List your villa", trips: "My trips" },
    heroEyebrow: "Exceptional private stays in Thailand",
    heroTitle: "Space to be together.",
    heroBody: "Handpicked villas, thoughtful service, and local expertise for the trips that matter most.",
    search: "Search villas",
    where: "Where",
    when: "When",
    guests: "Guests",
    featured: "Remarkable stays, personally selected",
    featuredBody: "Every villa is reviewed for design, comfort, service, and a genuine sense of place.",
    from: "from",
    perNight: "per night",
    viewAll: "View all villas",
  },
  th: {
    nav: { villas: "ค้นหาวิลล่า", destinations: "จุดหมาย", partners: "ลงประกาศวิลล่า", trips: "ทริปของฉัน" },
    heroEyebrow: "ที่พักส่วนตัวที่โดดเด่นทั่วประเทศไทย",
    heroTitle: "พื้นที่สำหรับช่วงเวลาดี ๆ ร่วมกัน",
    heroBody: "วิลล่าคัดสรร บริการใส่ใจ และความเชี่ยวชาญในพื้นที่ สำหรับทริปที่สำคัญที่สุดของคุณ",
    search: "ค้นหาวิลล่า",
    where: "ที่ไหน",
    when: "เมื่อไหร่",
    guests: "ผู้เข้าพัก",
    featured: "ที่พักพิเศษที่เราคัดสรรด้วยตัวเอง",
    featuredBody: "วิลล่าทุกหลังผ่านการพิจารณาด้านดีไซน์ ความสะดวกสบาย บริการ และเอกลักษณ์ของสถานที่",
    from: "เริ่มต้น",
    perNight: "ต่อคืน",
    viewAll: "ดูวิลล่าทั้งหมด",
  },
} as const;

export const thbToUsd = (thb: number, rate = 34.6) => Math.round(thb / rate);

export function money(thb: number, locale: Locale) {
  if (locale === "th") return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(thb);
  return `≈ ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(thbToUsd(thb))}`;
}
