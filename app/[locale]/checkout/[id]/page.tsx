import { notFound } from "next/navigation";
import { PaymentCheckout } from "@/components/payment-checkout";
import { isLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import type { Json } from "@/lib/supabase/database.types";
function total(value:Json){return typeof value==="object"&&value!==null&&!Array.isArray(value)&&typeof value.total==="number"?value.total:0;}
export default async function Checkout({params}:{params:Promise<{locale:string;id:string}>}){const {locale,id}=await params;if(!isLocale(locale))notFound();const {supabase}=await requireUser(locale,`/${locale}/checkout/${id}`);const {data,error}=await supabase.from("booking_requests").select("id,check_in,check_out,status,quote_snapshot,villas(name)").eq("id",id).single();if(error||!["approved_payment_pending","confirmed"].includes(data.status))notFound();return <PaymentCheckout bookingRequest={{id:data.id,villaName:data.villas?.name??"Villa",checkIn:data.check_in,checkOut:data.check_out,total:total(data.quote_snapshot),status:data.status}} locale={locale} publicKey={process.env.OMISE_PUBLIC_KEY??""}/>;}
