import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { drainEmailOutbox } from "@/lib/services/email";
import { purgeExpiredApplicationEvidence } from "@/lib/services/evidence-retention";
export async function GET(request: Request) {
  const secret=process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({error:"Unauthorized"},{status:401});
  const admin=createSupabaseAdminClient();
  const {data,error}=await admin.rpc("expire_due_work");
  if(error)return NextResponse.json({error:error.message},{status:500});
  const {data:verification,error:verificationError}=await admin.rpc("expire_verification_evidence");
  if(verificationError)return NextResponse.json({error:verificationError.message},{status:500});
  const retention=await purgeExpiredApplicationEvidence();
  const email=await drainEmailOutbox();
  return NextResponse.json({ok:true,expired:data,verification,retention,email,ranAt:new Date().toISOString()});
}
