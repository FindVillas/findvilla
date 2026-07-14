import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema=z.object({persona:z.enum(["guest","partner","staff"])});
const password="LocalFindVillas!2026";
function localOnly(){try{return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname==="127.0.0.1"&&process.env.NODE_ENV!=="production";}catch{return false;}}

export async function POST(request:Request){
  if(!localOnly())return NextResponse.json({error:"Local sessions are disabled"},{status:404});
  const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid persona"},{status:400});
  const email=`${parsed.data.persona}@findvillas.local`;const admin=createSupabaseAdminClient();
  const {data:list,error:listError}=await admin.auth.admin.listUsers({page:1,perPage:100});if(listError)throw listError;
  if(!list.users.some(user=>user.email===email)){const created=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:`Local ${parsed.data.persona}`}});if(created.error)return NextResponse.json({error:created.error.message},{status:422});}
  const supabase=await createSupabaseServerClient();const {error}=await supabase.auth.signInWithPassword({email,password});if(error)return NextResponse.json({error:error.message},{status:422});
  return NextResponse.json({ok:true,role:parsed.data.persona});
}
