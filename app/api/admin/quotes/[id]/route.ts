import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
const transitions:Record<string,string[]>={NEW:["REVIEWING","DECLINED"],REVIEWING:["PRICED","DECLINED"],PRICED:["SENT","DECLINED"],SENT:["ACCEPTED","DECLINED","EXPIRED"],ACCEPTED:[],DECLINED:[],EXPIRED:[]};
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Invalid quote ID"},{status:400});
 let data:unknown;try{data=await req.json();}catch{return NextResponse.json({error:"Invalid payload"},{status:400});}
 const status=(data as {status?:unknown})?.status;if(typeof status!=="string"||!Object.keys(transitions).includes(status))return NextResponse.json({error:"Invalid status"},{status:400});
 try{
  const sql=db();
  const rows=await sql`WITH updated AS (UPDATE quote_requests SET status=${status},updated_at=now() WHERE id=${id}::uuid AND ( (status='NEW' AND ${status} IN ('REVIEWING','DECLINED')) OR (status='REVIEWING' AND ${status} IN ('PRICED','DECLINED')) OR (status='PRICED' AND ${status} IN ('SENT','DECLINED')) OR (status='SENT' AND ${status} IN ('ACCEPTED','DECLINED','EXPIRED')) ) RETURNING id,status) SELECT id,status FROM updated`;
  if(!rows.length)return NextResponse.json({error:"Transition unavailable. Refresh and verify the current status."},{status:409});
  // TODO: status events should be written in the same transaction as the update.
  return NextResponse.json({ok:true,status});
 }catch{return NextResponse.json({error:"Unable to update quote"},{status:503});}
}
