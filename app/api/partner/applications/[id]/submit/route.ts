import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const supabase=await createSupabaseServerClient();const {data,error}=await supabase.rpc("submit_partner_application",{p_application_id:id});if(error)return NextResponse.json({error:error.message},{status:422});return NextResponse.json({id:data.id,status:data.status});}
