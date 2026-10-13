import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
const transitions:Record<string,string[]>={NEW:["REVIEWING","DECLINED"],REVIEWING:["DECLINED"],PRICED:["SENT","DECLINED"],SENT:["DECLINED","EXPIRED"],ACCEPTED:[],DECLINED:[],EXPIRED:[]};
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))return NextResponse.json({error:"Invalid quote ID"},{status:400});
 let data:unknown;try{data=await req.json();}catch{return NextResponse.json({error:"Invalid payload"},{status:400});}
 const p=data as {status?:unknown;note?:unknown};
 const status=typeof p?.status==="string"?p.status:"";
 const note=typeof p?.note==="string"?p.note.trim():"";
 if(!Object.keys(transitions).includes(status)||!Object.values(transitions).some(allowed=>allowed.includes(status)))
  return NextResponse.json({error:"Invalid transition. Pricing and acceptance require their dedicated actions."},{status:400});
 if(note.length>1000||(["SENT","DECLINED","EXPIRED"].includes(status)&&note.length<10))
  return NextResponse.json({error:"Provide a reason or communication evidence (10–1000 characters)"},{status:400});
 try{
 const sql=db();
 const rows=await sql`
 WITH previous AS (SELECT id,status,quoted_amount_cents FROM quote_requests WHERE id=${id}::uuid FOR UPDATE),
 updated AS (
  UPDATE quote_requests q SET status=${status},updated_at=now()
  FROM previous p WHERE q.id=p.id AND (
   (p.status='NEW' AND ${status} IN ('REVIEWING','DECLINED')) OR
   (p.status='REVIEWING' AND ${status}='DECLINED') OR
   (p.status='PRICED' AND p.quoted_amount_cents>0 AND ${status} IN ('SENT','DECLINED')) OR
   (p.status='SENT' AND ${status} IN ('DECLINED','EXPIRED'))
  ) RETURNING q.id
 ),
 audited AS (
  INSERT INTO quote_events(quote_id,from_status,to_status,note,actor)
  SELECT updated.id,previous.status,${status},${note || "Review started"},${process.env.ADMIN_EMAIL || "admin"}
  FROM updated JOIN previous ON updated.id=previous.id RETURNING id
 )
 SELECT updated.id,(SELECT count(*) FROM audited) AS audited FROM updated`;
 if(!rows.length)return NextResponse.json({error:"Status transition is not allowed. Refresh the quotation."},{status:409});
 return NextResponse.json({ok:true,status});
 }catch{return NextResponse.json({error:"Unable to update quotation"},{status:503});}
}
