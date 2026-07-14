import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createOmiseCharge, createOmisePromptPaySource } from "@/lib/services/omise";
import type { Json } from "@/lib/supabase/database.types";

const schema = z.object({ requestId:z.uuid(), method:z.enum(["card","promptpay"]), cardToken:z.string().startsWith("tokn_").optional(), idempotencyKey:z.uuid() });
function total(value:Json){return typeof value==="object"&&value!==null&&!Array.isArray(value)&&typeof value.total==="number"?value.total:0;}

export async function POST(request:Request){
  const parsed=schema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:"Invalid payment request",details:parsed.error.flatten()},{status:400});
  if(parsed.data.method==="card"&&!parsed.data.cardToken)return NextResponse.json({error:"Card token required"},{status:400});
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const {data:bookingRequest,error}=await supabase.from("booking_requests").select("id,reference,status,quote_snapshot").eq("id",parsed.data.requestId).single();
  if(error||bookingRequest.status!=="approved_payment_pending")return NextResponse.json({error:"Request is not ready for payment"},{status:422});
  const amountThb=total(bookingRequest.quote_snapshot);
  if(amountThb<1)return NextResponse.json({error:"Invalid booking total"},{status:422});
  if(amountThb>150000)return NextResponse.json({error:"This Omise test account has a ฿150,000 per-charge limit. Choose a shorter stay or configure a higher merchant limit."},{status:422});
  const admin=createSupabaseAdminClient();
  const {data:existing}=await admin.from("payment_attempts").select("*").eq("idempotency_key",parsed.data.idempotencyKey).maybeSingle();
  if(existing)return NextResponse.json({attemptId:existing.id,status:existing.status,chargeId:existing.provider_charge_id});
  let source: {id?:string}|undefined;
  if(parsed.data.method==="promptpay")source=await createOmisePromptPaySource(amountThb*100);
  const {data:attempt,error:insertError}=await admin.from("payment_attempts").insert({request_id:bookingRequest.id,idempotency_key:parsed.data.idempotencyKey,method:parsed.data.method,status:"created",amount_thb:amountThb,test_mode:true,provider_source_id:source?.id}).select().single();
  if(insertError)return NextResponse.json({error:insertError.message},{status:422});
  try{
    const site=process.env.NEXT_PUBLIC_SITE_URL??new URL(request.url).origin;
    const charge=await createOmiseCharge({amountThbMinor:amountThb*100,cardToken:parsed.data.cardToken,sourceId:source?.id,returnUri:`${site}/en/trips`,metadata:{requestId:bookingRequest.id,attemptId:attempt.id,reference:bookingRequest.reference}});
    await admin.from("payment_attempts").update({provider_charge_id:charge.id,status:"pending",raw:charge as unknown as Json}).eq("id",attempt.id);
    let booking=null;
    if(charge.paid){const result=await admin.rpc("confirm_test_payment",{p_attempt_id:attempt.id,p_provider_charge_id:charge.id,p_raw:charge as unknown as Json});if(result.error)throw result.error;booking=result.data;}
    return NextResponse.json({attemptId:attempt.id,chargeId:charge.id,status:charge.paid?"successful":charge.status,booking,authorizeUri:charge.authorize_uri,qrUrl:charge.source?.scannable_code?.image?.download_uri});
  }catch(cause){await admin.from("payment_attempts").update({status:"failed",raw:{error:cause instanceof Error?cause.message:"Payment failed"}}).eq("id",attempt.id);return NextResponse.json({error:cause instanceof Error?cause.message:"Payment failed"},{status:502});}
}
