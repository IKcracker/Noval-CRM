import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))return NextResponse.json({error:"Invalid quote ID"},{status:400});
 let input:unknown;try{input=await req.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 const evidence=typeof (input as {evidence?:unknown})?.evidence==="string"?(input as {evidence:string}).evidence.trim():"";
 if(evidence.length<10||evidence.length>1000)return NextResponse.json({error:"Record at least 10 characters of customer approval evidence"},{status:400});
 try{
  const sql=db();
  const rows=await sql`
  WITH previous AS (SELECT id,status FROM quote_requests WHERE id=${id}::uuid AND status='SENT' AND quoted_amount_cents>0 FOR UPDATE),
  updated AS (
   UPDATE quote_requests q SET status='ACCEPTED',updated_at=now()
   FROM previous p WHERE q.id=p.id RETURNING q.id
  ),
  booking AS (
   INSERT INTO bookings (quote_id,reference)
   SELECT updated.id, 'BK-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))
   FROM updated RETURNING id,reference
  ),
  audit AS (
   INSERT INTO quote_events (quote_id,from_status,to_status,note,actor)
   SELECT updated.id,'SENT','ACCEPTED',${evidence},${process.env.ADMIN_EMAIL || "admin"}
   FROM updated RETURNING id
  )
  SELECT booking.id,booking.reference,(SELECT count(*) FROM audit) AS audited FROM booking`;
  if(!rows.length)return NextResponse.json({error:"Only SENT quotes with a price can be accepted"},{status:409});
  return NextResponse.json({ok:true,bookingId:rows[0].id,bookingReference:rows[0].reference});
 }catch{return NextResponse.json({error:"Unable to convert accepted quote to booking. Check the booking migration."},{status:503});}
}
