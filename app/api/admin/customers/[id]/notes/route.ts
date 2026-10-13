import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))return NextResponse.json({error:"Invalid customer ID"},{status:400});
 let data:Record<string,unknown>;try{data=await req.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 const body=typeof data.body==="string"?data.body.trim():"";
 if(body.length<1||body.length>5000)return NextResponse.json({error:"Notes must contain 1–5000 characters."},{status:400});
 try{
  const sql=db();
  const rows=await sql`INSERT INTO crm_customer_notes(customer_id,body,actor)
   SELECT id,${body},${process.env.ADMIN_EMAIL||"administrator"} FROM crm_customers WHERE id=${id}::uuid RETURNING id`;
  if(!rows.length)return NextResponse.json({error:"Customer not found"},{status:404});
  return NextResponse.json({ok:true,id:rows[0].id},{status:201});
 }catch{return NextResponse.json({error:"Unable to save note."},{status:503});}
}
