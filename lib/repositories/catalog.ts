import "server-only";

import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Destination, LocalizedText, SeasonalRate, Villa } from "@/lib/types";

type Content = {
  area?: LocalizedText;
  description?: LocalizedText;
  amenities?: string[];
  tags?: Record<"en" | "th", string[]>;
  rating?: number;
  reviews?: number;
};

const localized = (value: unknown, fallback = ""): LocalizedText => {
  const object = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    en: typeof object.en === "string" ? object.en : fallback,
    th: typeof object.th === "string" ? object.th : fallback,
  };
};

function periodBounds(period: string) {
  const [start = "", endExclusive = ""] = period.replace(/[\[\]()]/g, "").split(",");
  if (!endExclusive) return { start, end: start };
  const end = new Date(`${endExclusive}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() - 1);
  return { start, end: end.toISOString().slice(0, 10) };
}

export async function getDestinations(): Promise<Destination[]> {
  const supabase = createSupabasePublicClient();
  const [{ data, error }, { data: villas, error: villaError }] = await Promise.all([
    supabase.from("destinations").select("id,slug,name,tagline,hero_image_url,sort_order").eq("published", true).order("sort_order"),
    supabase.from("villas").select("destination_id").eq("status", "published"),
  ]);
  if (error || villaError) throw error ?? villaError;
  const counts = new Map<string, number>();
  villas.forEach((villa) => counts.set(villa.destination_id, (counts.get(villa.destination_id) ?? 0) + 1));
  return data.map((destination) => ({
    slug: destination.slug,
    name: localized(destination.name),
    tagline: localized(destination.tagline),
    image: destination.hero_image_url ?? "",
    villaCount: counts.get(destination.id) ?? 0,
  }));
}

export async function getVillas(destinationSlug?: string): Promise<Villa[]> {
  const supabase = createSupabasePublicClient();
  const { data: destinations, error: destinationError } = await supabase.from("destinations").select("id,slug").eq("published", true);
  if (destinationError) throw destinationError;
  const destinationById = new Map(destinations.map((destination) => [destination.id, destination.slug]));
  let query = supabase.from("villas").select("*").eq("status", "published").order("featured", { ascending: false }).order("name");
  if (destinationSlug) {
    const destination = destinations.find((item) => item.slug === destinationSlug);
    if (!destination) return [];
    query = query.eq("destination_id", destination.id);
  }
  const { data: rows, error } = await query;
  if (error) throw error;
  if (!rows.length) return [];
  const villaIds = rows.map((row) => row.id);
  const revisionIds = rows.flatMap((row) => row.current_revision_id ? [row.current_revision_id] : []);
  const [revisionResult, mediaResult, rateResult] = await Promise.all([
    revisionIds.length ? supabase.from("villa_revisions").select("id,content").in("id", revisionIds) : Promise.resolve({ data: [], error: null }),
    supabase.from("villa_media").select("villa_id,external_url,storage_path,sort_order").in("villa_id", villaIds).order("sort_order"),
    supabase.from("seasonal_rates").select("villa_id,name,period,nightly_thb,minimum_nights").in("villa_id", villaIds),
  ]);
  if (revisionResult.error || mediaResult.error || rateResult.error) throw revisionResult.error ?? mediaResult.error ?? rateResult.error;
  const revisionById = new Map(revisionResult.data.map((revision) => [revision.id, revision.content as Content]));
  const storagePaths = mediaResult.data.flatMap((item) => item.storage_path ? [item.storage_path] : []);
  const signedByPath = new Map<string,string>();
  if (storagePaths.length) {
    const admin = createSupabaseAdminClient();
    const { data: signed, error: signedError } = await admin.storage.from("villa-media").createSignedUrls(storagePaths, 3600);
    if (signedError) throw signedError;
    signed.forEach((item, index) => { if (item.signedUrl) signedByPath.set(storagePaths[index], item.signedUrl); });
  }

  return rows.map((row) => {
    const content = row.current_revision_id ? revisionById.get(row.current_revision_id) ?? {} : {};
    const media = mediaResult.data.filter((item) => item.villa_id === row.id);
    const rates: SeasonalRate[] = rateResult.data.filter((item) => item.villa_id === row.id).map((rate) => ({
      name: localized(rate.name),
      ...periodBounds(String(rate.period)),
      nightlyThb: rate.nightly_thb,
      minimumNights: rate.minimum_nights,
    }));
    const tags = content.tags ?? { en: [], th: [] };
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      destination: destinationById.get(row.destination_id) ?? "",
      area: localized(content.area),
      description: localized(content.description),
      images: media.flatMap((item) => item.external_url ? [item.external_url] : item.storage_path && signedByPath.get(item.storage_path) ? [signedByPath.get(item.storage_path)!] : []),
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      maxGuests: row.max_guests,
      baseRateThb: row.base_rate_thb,
      rating: content.rating ?? 0,
      reviews: content.reviews ?? 0,
      amenities: content.amenities ?? [],
      tags: Array.from({ length: Math.max(tags.en.length, tags.th.length) }, (_, index) => ({ en: tags.en[index] ?? "", th: tags.th[index] ?? "" })),
      lat: row.latitude,
      lng: row.longitude,
      featured: row.featured,
      managed: row.managed,
      rates,
    };
  });
}

export async function getVillaBySlug(slug: string) {
  const villas = await getVillas();
  return villas.find((villa) => villa.slug === slug);
}

export async function getDestinationBySlug(slug: string) {
  const destinations = await getDestinations();
  return destinations.find((destination) => destination.slug === slug);
}
