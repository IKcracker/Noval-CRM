import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
const statuses=["NEW","REVIEWING","PRICED","SENT","ACCEPTED","DECLINED","EXPIRED"];
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return NextResponse.json({error:"Invalid quote ID"},{status:400});
 let data:unknown;try{data=await req.json();}catch{return NextResponse.json({error:"Invalid payload"},{status:400});}
 const status=(data as {status?:unknown})?.status;if(typeof status!=="string"||!statuses.includes(status))return NextResponse.json({error:"Invalid status"},{status:400});
 try{
 const sql=db();
 const rows=await sql`
 WITH previous AS (
   SELECT id,status FROM quote_requests WHERE id=${id}::uuid FOR UPDATE
 ), updated AS (
   UPDATE quote_requests q SET status=${status},updated_at=now()
   FROM previous p WHERE q.id=p.id AND (
    (p.status='NEW' AND ${status} IN ('REVIEWING','DECLINED')) OR
    (p.status='REVIEWING' AND ${status} IN ('PRICED','DECLINED')) OR
    (p.status='PRICED' AND ${status} IN ('SENT','DECLINED')) OR
    (p.status='SENT' AND ${status} IN ('ACCEPTED','DECLINED','EXPIRED'))
   ) RETURNING q.id,q.status
 ), audit AS (
   INSERT INTO quote_events (quote_id,from_status,to_status,actor)
   SELECT updated.id,previous.status,updated.status,'admin'
   FROM updated JOIN previous ON previous.id=updated.id RETURNING id
 ) SELECT updated.id,updated.status,(SELECT count(*) FROM audit) AS audited FROM updated`;
 if(!rows.length)return NextResponse.json({error:"Transition unavailable. Refresh to see the current status."},{status:409});
 return NextResponse.json({ok:true,status:rows[0].status});
 }catch{return NextResponse.json({error:"Unable to update quote"},{status:503});}
}
