import {NextResponse} from "next/server";
import {db} from "@/lib/db";
export async function POST(req:Request){
 let data:unknown;try{data=await req.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 const p=data as Record<string,unknown>;
 const reference=typeof p?.reference==="string"?p.reference.trim().toUpperCase():"";
 const email=typeof p?.email==="string"?p.email.trim().toLowerCase():"";
 if(!/^NVL-[A-F0-9]{16}$/.test(reference)||email.length>254||!/^\S+@\S+\.\S+$/.test(email))
  return NextResponse.json({error:"Enter a valid tracking number and customer email"},{status:400});
 if(!process.env.DATABASE_URL)return NextResponse.json({error:"Tracking is currently unavailable"},{status:503});
 try{
  const sql=db();
  const matches=await sql`
   SELECT s.id,s.tracking_number,s.status,q.origin,q.destination,t.scheduled_departure,t.scheduled_arrival
   FROM shipments s JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id
   LEFT JOIN trips t ON t.booking_id=b.id
   WHERE s.tracking_number=${reference} AND lower(q.email)=${email} LIMIT 1`;
  if(!matches.length)return NextResponse.json({error:"No shipment found for those details"},{status:404});
  const s=matches[0];
  const events=await sql`SELECT status,note,created_at FROM shipment_events WHERE shipment_id=${s.id}::uuid ORDER BY created_at DESC LIMIT 40`;
  return NextResponse.json({trackingNumber:s.tracking_number,status:s.status,origin:s.origin,destination:s.destination,scheduledDeparture:s.scheduled_departure,scheduledArrival:s.scheduled_arrival,events});
 }catch{return NextResponse.json({error:"Tracking information is temporarily unavailable"},{status:503});}
}
