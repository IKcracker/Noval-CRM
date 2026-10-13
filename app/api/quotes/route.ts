import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseQuote } from "@/lib/quote-validation";
import { randomUUID } from "node:crypto";
export async function POST(request: Request) {
 const length=Number(request.headers.get("content-length")||0);
 if(length>16000)return NextResponse.json({error:"Request too large"},{status:413});
 let input;
 try{input=parseQuote(await request.json());}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid request"},{status:400});}
 if(!process.env.DATABASE_URL)return NextResponse.json({error:"Quote intake is temporarily unavailable"},{status:503});
 // Public submission must be covered by a WAF/rate limiter before launch.
 const ref="NQ-"+randomUUID().slice(0,8).toUpperCase();
 try{
 const sql=db();
 const rows=await sql`INSERT INTO quote_requests (reference,contact_name,company,email,phone,origin,destination,service_type,cargo_details,pickup_date,weight_kg)
 VALUES (${ref},${input.contactName},${input.company},${input.email},${input.phone},${input.origin},${input.destination},${input.serviceType},${input.cargoDetails},${input.pickupDate},${input.weightKg})
 RETURNING id, reference`;
 return NextResponse.json({reference:rows[0].reference},{status:201});
 }catch{return NextResponse.json({error:"We could not save this request. Please try again later."},{status:503});}
}
