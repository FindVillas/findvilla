import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { requireRole } from "@/lib/auth";
import { NewVillaForm } from "@/components/new-villa-form";

export default async function NewVillaPage({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const {supabase}=await requireRole(locale,"partner",`/${locale}/partner/villas/new`);const {data,error}=await supabase.from("destinations").select("id,name").eq("published",true).order("sort_order");if(error)throw error;return <NewVillaForm locale={locale} destinations={data.map(row=>({id:row.id,name:typeof row.name==="object"&&row.name!==null&&!Array.isArray(row.name)&&typeof row.name.en==="string"?row.name.en:"Destination"}))}/>;}
