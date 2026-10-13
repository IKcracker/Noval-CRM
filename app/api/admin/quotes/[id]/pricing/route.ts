import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
const validId=(s:string)=>/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(s);
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 if(!validId(id))return NextResponse.json({error:"Invalid quote ID"},{status:400});
 let input:unknown;try{input=await req.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 const data=input as {amount?:unknown;note?:unknown};
 const amount=typeof data?.amount==="string"?data.amount.trim():"";
 const note=typeof data?.note==="string"?data.note.trim():"";
 if(!/^(?:0|[1-9]\d{0,8})(?:\.\d{1,2})?$/.test(amount)||Number(amount)<=0)
  return NextResponse.json({error:"Enter a positive ZAR price with at most two decimals"},{status:400});
 if(note.length>1000)return NextResponse.json({error:"Notes are too long"},{status:400});
 const cents=Math.round(Number(amount)*100);
 try{
  const sql=db();
  const rows=await sql`
  WITH previous AS (SELECT id,status FROM quote_requests WHERE id=${id}::uuid AND status='REVIEWING' FOR UPDATE),
  updated AS (
   UPDATE quote_requests q SET status='PRICED',quoted_amount_cents=${cents},quoted_currency='ZAR',updated_at=now()
   FROM previous p WHERE q.id=p.id RETURNING q.id,q.reference
  ), audit AS (
   INSERT INTO quote_events (quote_id,from_status,to_status,note,actor)
   SELECT updated.id,'REVIEWING','PRICED',${note || "Price calculated and saved"},${process.env.ADMIN_EMAIL || "admin"}
   FROM updated RETURNING id
  )
  SELECT updated.reference,(SELECT count(*) FROM audit) AS audited FROM updated`;
  if(!rows.length)return NextResponse.json({error:"Quote must be in REVIEWING status before pricing"},{status:409});
  return NextResponse.json({ok:true,reference:rows[0].reference,amountCents:cents});
 }catch{return NextResponse.json({error:"Unable to price the quotation. Check database migrations."},{status:503});}
}
