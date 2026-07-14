import "server-only";
import { createHash } from "node:crypto";

const signatures:{mime:string;test:(bytes:Uint8Array)=>boolean}[]=[
  {mime:"application/pdf",test:b=>String.fromCharCode(...b.slice(0,4))==="%PDF"},
  {mime:"image/jpeg",test:b=>b[0]===0xff&&b[1]===0xd8&&b[2]===0xff},
  {mime:"image/png",test:b=>[0x89,0x50,0x4e,0x47].every((v,i)=>b[i]===v)},
  {mime:"image/webp",test:b=>String.fromCharCode(...b.slice(0,4))==="RIFF"&&String.fromCharCode(...b.slice(8,12))==="WEBP"},
];
export async function inspectEvidenceFile(file:File){if(file.size<1||file.size>20*1024*1024)throw new Error("Evidence must be between 1 byte and 20MB");const buffer=Buffer.from(await file.arrayBuffer());const match=signatures.find(item=>item.mime===file.type&&item.test(buffer));if(!match)throw new Error("File content does not match an allowed PDF, JPEG, PNG, or WebP type");return{buffer,sha256:createHash("sha256").update(buffer).digest("hex"),mime:match.mime};}
