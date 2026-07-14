import "server-only";

import nodemailer from "nodemailer";
import { Resend } from "resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

function payload(value:Json){return typeof value==="object"&&value!==null&&!Array.isArray(value)?value:{};}
function render(template:string, value:Json){const data=payload(value);const reference=typeof data.reference==="string"?data.reference:typeof data.requestId==="string"?data.requestId:"your booking";return {subject:template==="booking-approved"?`FindVillas request approved: ${reference}`:`FindVillas update: ${reference}`,html:`<div style="font-family:sans-serif"><h1>FindVillas</h1><p>Your booking request has an update: <strong>${template.replaceAll("-"," ")}</strong>.</p><p>Reference: ${reference}</p><p>Open FindVillas to see the next step.</p></div>`};}

async function send(recipient:string,subject:string,html:string){
  const from=process.env.EMAIL_FROM??"FindVillas <bookings@findvillas.local>";
  if(process.env.EMAIL_TRANSPORT==="smtp"){
    const transport=nodemailer.createTransport({host:process.env.SMTP_HOST??"127.0.0.1",port:Number(process.env.SMTP_PORT??54325),secure:false});
    await transport.sendMail({from,to:recipient,subject,html});return;
  }
  if(!process.env.RESEND_API_KEY)throw new Error("RESEND_API_KEY is required when EMAIL_TRANSPORT is not smtp");
  const result=await new Resend(process.env.RESEND_API_KEY).emails.send({from,to:recipient,subject,html});
  if(result.error)throw new Error(result.error.message);
}

export async function drainEmailOutbox(limit=20){
  const admin=createSupabaseAdminClient();
  const {data:rows,error}=await admin.from("email_outbox").select("*").is("delivered_at",null).lte("next_attempt_at",new Date().toISOString()).order("created_at").limit(limit);
  if(error)throw error;let delivered=0;let failed=0;
  for(const row of rows){try{const message=render(row.template,row.payload);await send(row.recipient,message.subject,message.html);await admin.from("email_outbox").update({delivered_at:new Date().toISOString(),last_error:null,attempts:row.attempts+1}).eq("id",row.id);delivered++;}catch(cause){const attempts=row.attempts+1;const retry=new Date(Date.now()+Math.min(60,2**attempts)*60_000).toISOString();await admin.from("email_outbox").update({attempts,next_attempt_at:retry,last_error:cause instanceof Error?cause.message:"Delivery failed"}).eq("id",row.id);failed++;}}
  return {delivered,failed};
}
