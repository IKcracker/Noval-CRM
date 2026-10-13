import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
const allowed:Record<string,string[]>={
 SCHEDULED:["PICKED_UP","CANCELLED","EXCEPTION"],PICKED_UP:["IN_TRANSIT","EXCEPTION"],
 IN_TRANSIT:["OUT_FOR_DELIVERY","EXCEPTION"],OUT_FOR_DELIVERY:["DELIVERED","EXCEPTION"],
 EXCEPTION:["IN_TRANSIT","OUT_FOR_DELIVERY","RETURNED","CANCELLED"],
 DELIVERED:[],RETURNED:[],CANCELLED:[]
};
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))return NextResponse.json({error:"Invalid shipment ID"},{status:400});
 let body:unknown;try{body=await req.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 const p=(body??{}) as Record<string,unknown>,status=p.status,notes=typeof p.note==="string"?p.note.trim():"",location=typeof p.location==="string"?p.location.trim():"";
 const visible=p.visibleToCustomer!==false;
 if(typeof status!=="string"||!Object.keys(allowed).includes(status)||notes.length>1000||location.length>180||((status==="EXCEPTION"||status==="CANCELLED")&&notes.length<10))
 return NextResponse.json({error:"Invalid milestone, location or note. Exceptions and cancellations require a reason."},{status:400});
 try{
 const sql=db();
 const rows=await sql`
 WITH before AS (SELECT id,status FROM shipments WHERE id=${id}::uuid FOR UPDATE),
 changed AS (
 UPDATE shipments s SET status=${status},updated_at=now() FROM before b WHERE s.id=b.id AND (
 (b.status='SCHEDULED' AND ${status} IN ('PICKED_UP','CANCELLED','EXCEPTION')) OR
 (b.status='PICKED_UP' AND ${status} IN ('IN_TRANSIT','EXCEPTION')) OR
 (b.status='IN_TRANSIT' AND ${status} IN ('OUT_FOR_DELIVERY','EXCEPTION')) OR
 (b.status='OUT_FOR_DELIVERY' AND ${status} IN ('DELIVERED','EXCEPTION')) OR
 (b.status='EXCEPTION' AND ${status} IN ('IN_TRANSIT','OUT_FOR_DELIVERY','RETURNED','CANCELLED'))
 ) RETURNING s.id,s.status
 ), event AS (
 INSERT INTO shipment_events(shipment_id,status,note,location_label,visible_to_customer,actor)
 SELECT changed.id,changed.status,${notes || "Status updated"},${location},${visible},${process.env.ADMIN_EMAIL || "admin"}
 FROM changed RETURNING id
 )
 SELECT changed.id,changed.status,(SELECT count(*) FROM event) AS events_written FROM changed`;
 if(!rows.length)return NextResponse.json({error:"Invalid shipment transition or shipment not found"},{status:409});
 return NextResponse.json({ok:true,status:rows[0].status});
 }catch{return NextResponse.json({error:"Could not save milestone. Apply migration 003."},{status:503});}
}
