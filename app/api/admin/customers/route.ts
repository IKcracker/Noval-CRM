import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
const UUID=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const states=["PROSPECT","ACTIVE","INACTIVE"];
function value(v:unknown,max:number){return typeof v==="string"?v.trim().slice(0,max+1):"";}
function parse(body:Record<string,unknown>){
 const contactName=value(body.contactName,160),email=value(body.email,255).toLowerCase(),
 companyName=value(body.companyName,180),phone=value(body.phone,45),billingAddress=value(body.billingAddress,1500),
 status=value(body.status,30)||"PROSPECT";
 if(contactName.length<2||contactName.length>160||email.length>255||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  throw new Error("Enter a valid contact name and email address.");
 if(companyName.length>180||phone.length>45||billingAddress.length>1500||!states.includes(status))throw new Error("Invalid customer details.");
 return {contactName,email,companyName,phone,billingAddress,status};
}
export async function POST(req:Request){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 let data:Record<string,unknown>;try{data=await req.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 try{
  const sql=db();
  if(data.action==="import-quotes"){
   // Explicit import. Never create customer records implicitly during a migration or page render.
   const rows=await sql`INSERT INTO crm_customers(company_name,contact_name,email,phone,status)
    SELECT DISTINCT ON (lower(q.email))
     NULLIF(trim(q.company),''),
     q.contact_name,lower(trim(q.email)),NULLIF(trim(q.phone),''),
     CASE WHEN q.status='ACCEPTED' THEN 'ACTIVE' ELSE 'PROSPECT' END
    FROM quote_requests q WHERE q.reference NOT LIKE 'DEMO-Q%'
     AND q.email IS NOT NULL AND position('@' IN trim(q.email))>1 AND position('.' IN split_part(trim(q.email),'@',2))>0
     AND length(trim(q.contact_name))>=2
    ORDER BY lower(q.email),q.created_at DESC
    ON CONFLICT DO NOTHING RETURNING id`;
   return NextResponse.json({ok:true,imported:rows.length});
  }
  const c=parse(data);
  const rows=await sql`INSERT INTO crm_customers(company_name,contact_name,email,phone,billing_address,status)
   VALUES (NULLIF(${c.companyName},''),${c.contactName},${c.email},NULLIF(${c.phone},''),NULLIF(${c.billingAddress},''),${c.status})
   RETURNING id`;
  return NextResponse.json({ok:true,id:rows[0].id},{status:201});
 }catch(e){
  if(e instanceof Error&&"code" in e&&e.code==="23505")return NextResponse.json({error:"A customer with this email already exists."},{status:409});
  if(e instanceof Error&&(e.message.startsWith("Enter")||e.message==="Invalid customer details."))return NextResponse.json({error:e.message},{status:400});
  return NextResponse.json({error:"Customer operation failed. Verify the database migration and try again."},{status:503});
 }
}
export async function PATCH(req:Request){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 let data:Record<string,unknown>;try{data=await req.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 if(typeof data.id!=="string"||!UUID.test(data.id))return NextResponse.json({error:"Invalid customer ID"},{status:400});
 let customer:ReturnType<typeof parse>;try{customer=parse(data);}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid details"},{status:400});}
 try{
  const sql=db();
  const rows=await sql`UPDATE crm_customers SET contact_name=${customer.contactName},company_name=NULLIF(${customer.companyName},''),
   email=${customer.email},phone=NULLIF(${customer.phone},''),billing_address=NULLIF(${customer.billingAddress},''),
   status=${customer.status},updated_at=now() WHERE id=${data.id}::uuid RETURNING id`;
  if(!rows.length)return NextResponse.json({error:"Customer not found"},{status:404});
  return NextResponse.json({ok:true});
 }catch(e){
  if(e instanceof Error&&"code" in e&&e.code==="23505")return NextResponse.json({error:"A customer with this email already exists."},{status:409});
  return NextResponse.json({error:"Unable to update customer"},{status:503});
 }
}
