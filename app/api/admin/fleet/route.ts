import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {isAdmin} from "@/lib/admin-auth";
export async function POST(req:Request){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 let data:Record<string,unknown>;try{data=await req.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 const kind=data.kind;
 const str=(v:unknown)=>typeof v==="string"?v.trim():"";
 try{
 const sql=db();
 if(kind==="driver"){
  const name=str(data.fullName),phone=str(data.phone),license=str(data.licenseNumber),expiry=str(data.licenseExpiry);
  if(name.length<3||name.length>150||phone.length<7||phone.length>40||license.length<4||license.length>70||!/^\d{4}-\d{2}-\d{2}$/.test(expiry))return NextResponse.json({error:"Provide valid driver details."},{status:400});
  const rows=await sql`INSERT INTO drivers(full_name,phone,license_number,license_expiry) VALUES (${name},${phone},${license},${expiry}::date) RETURNING id`;
  return NextResponse.json({ok:true,id:rows[0].id},{status:201});
 }
 if(kind==="vehicle"){
  const registration=str(data.registration).toUpperCase(),model=str(data.makeModel),capacity=Number(data.capacityKg),expiry=str(data.roadworthyExpiry);
  if(registration.length<3||registration.length>30||model.length<3||model.length>120||!Number.isFinite(capacity)||capacity<=0||capacity>100000||!/^\d{4}-\d{2}-\d{2}$/.test(expiry))return NextResponse.json({error:"Provide valid vehicle details."},{status:400});
  const rows=await sql`INSERT INTO vehicles(registration,make_model,capacity_kg,roadworthy_expiry) VALUES (${registration},${model},${capacity},${expiry}::date) RETURNING id`;
  return NextResponse.json({ok:true,id:rows[0].id},{status:201});
 }
 return NextResponse.json({error:"Unknown record type"},{status:400});
 }catch(e){const reason=e instanceof Error&&e.message.includes("unique")?"A record with this identifier already exists.":"Unable to save record. Check migration 004.";return NextResponse.json({error:reason},{status:409});}
}
export async function PATCH(req:Request){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 let data:Record<string,unknown>;try{data=await req.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 const kind=data.kind,status=data.status,id=data.id;
 if(typeof id!=="string"||!/^[a-f0-9-]{36}$/i.test(id))return NextResponse.json({error:"Invalid record ID"},{status:400});
 if(kind==="driver"&&!["PENDING","VERIFIED","SUSPENDED"].includes(String(status)))return NextResponse.json({error:"Invalid driver status"},{status:400});
 if(kind==="vehicle"&&!["PENDING","VERIFIED","OUT_OF_SERVICE"].includes(String(status)))return NextResponse.json({error:"Invalid vehicle status"},{status:400});
 try{
 const sql=db();let result;
 if(kind==="driver")result=await sql`UPDATE drivers SET status=${status as string},updated_at=now() WHERE id=${id}::uuid AND ( ${status as string}<>'VERIFIED' OR license_expiry>=current_date ) RETURNING id`;
 else if(kind==="vehicle")result=await sql`UPDATE vehicles SET status=${status as string},updated_at=now() WHERE id=${id}::uuid AND ( ${status as string}<>'VERIFIED' OR roadworthy_expiry>=current_date ) RETURNING id`;
 else return NextResponse.json({error:"Invalid record type"},{status:400});
 if(!result.length)return NextResponse.json({error:"Record missing or compliance date expired"},{status:409});
 return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Unable to update status"},{status:503});}
}
/** Edit a driver's or vehicle's details. Status changes go through PATCH. */
export async function PUT(req:Request){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 let data:Record<string,unknown>;try{data=await req.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 const str=(v:unknown)=>typeof v==="string"?v.trim():"";
 const id=str(data.id);
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))return NextResponse.json({error:"Invalid record ID"},{status:400});
 try{
  const sql=db();let rows;
  if(data.kind==="driver"){
   const name=str(data.fullName),phone=str(data.phone),license=str(data.licenseNumber),expiry=str(data.licenseExpiry);
   if(name.length<3||name.length>150||phone.length<7||phone.length>40||license.length<4||license.length>70||!/^\d{4}-\d{2}-\d{2}$/.test(expiry))return NextResponse.json({error:"Provide valid driver details."},{status:400});
   // An expired licence cannot stay verified.
   rows=await sql`UPDATE drivers SET full_name=${name},phone=${phone},license_number=${license},license_expiry=${expiry}::date,
     status=CASE WHEN status='VERIFIED' AND ${expiry}::date<current_date THEN 'PENDING' ELSE status END,updated_at=now()
    WHERE id=${id}::uuid RETURNING id`;
  }else if(data.kind==="vehicle"){
   const registration=str(data.registration).toUpperCase(),model=str(data.makeModel),capacity=Number(data.capacityKg),expiry=str(data.roadworthyExpiry);
   if(registration.length<3||registration.length>30||model.length<3||model.length>120||!Number.isFinite(capacity)||capacity<=0||capacity>100000||!/^\d{4}-\d{2}-\d{2}$/.test(expiry))return NextResponse.json({error:"Provide valid vehicle details."},{status:400});
   rows=await sql`UPDATE vehicles SET registration=${registration},make_model=${model},capacity_kg=${capacity},roadworthy_expiry=${expiry}::date,
     status=CASE WHEN status='VERIFIED' AND ${expiry}::date<current_date THEN 'PENDING' ELSE status END,updated_at=now()
    WHERE id=${id}::uuid RETURNING id`;
  }else return NextResponse.json({error:"Unknown record type"},{status:400});
  if(!rows.length)return NextResponse.json({error:"Record not found"},{status:404});
  return NextResponse.json({ok:true});
 }catch(e){const reason=e instanceof Error&&e.message.includes("unique")?"Another record already uses this registration or licence number.":"Unable to save changes.";return NextResponse.json({error:reason},{status:409});}
}
