import { notFound } from "next/navigation";
import { TripsDashboard } from "@/components/trips-dashboard";
import { isLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import type { Json } from "@/lib/supabase/database.types";

function totalFromQuote(quote: Json) { return typeof quote === "object" && quote !== null && !Array.isArray(quote) && typeof quote.total === "number" ? quote.total : 0; }

export default async function Trips({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const {supabase}=await requireUser(locale,`/${locale}/trips`);const {data,error}=await supabase.from("booking_requests").select("id,reference,check_in,check_out,guests,status,quote_snapshot,villas(name)").order("created_at",{ascending:false});if(error)throw error;const trips=data.map(row=>({id:row.id,reference:row.reference,villaName:row.villas?.name??"Villa",checkIn:row.check_in,checkOut:row.check_out,guests:row.guests,status:row.status,total:totalFromQuote(row.quote_snapshot)}));return <TripsDashboard locale={locale} trips={trips}/>;}
