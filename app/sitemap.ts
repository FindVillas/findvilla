import type { MetadataRoute } from "next";
import { getDestinations, getVillas } from "@/lib/repositories/catalog";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const [destinations,villas]=await Promise.all([getDestinations(),getVillas()]);const base=process.env.NEXT_PUBLIC_SITE_URL??"http://localhost:3000";const routes=["",...destinations.map(d=>`/villas?destination=${d.slug}`),...villas.map(v=>`/villas/${v.slug}`)];return ["en","th"].flatMap(locale=>routes.map(route=>({url:`${base}/${locale}${route}`,changeFrequency:"weekly" as const,priority:route===""?1:.8})));}
