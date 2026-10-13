import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))return NextResponse.json({error:"Invalid booking ID"},{status:400});
 let payload:unknown;try{payload=await req.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 const p=payload as Record<string,unknown>;
 const driverName=typeof p?.driverName==="string"?p.driverName.trim():"";
 const vehicleRegistration=typeof p?.vehicleRegistration==="string"?p.vehicleRegistration.trim():"";
 const departure=typeof p?.departure==="string"?p.departure:"";
 const arrival=typeof p?.arrival==="string"?p.arrival:"";
 if(driverName.length<2||driverName.length>150||vehicleRegistration.length<2||vehicleRegistration.length>30)
  return NextResponse.json({error:"Provide a driver and vehicle registration"},{status:400});
 const from=new Date(departure),to=new Date(arrival);
 if(!Number.isFinite(from.valueOf())||!Number.isFinite(to.valueOf())||from>=to)
  return NextResponse.json({error:"Enter valid scheduled departure and arrival times"},{status:400});
 try{
  const sql=db();
  const rows=await sql`
   WITH booking AS (SELECT id FROM bookings WHERE id=${id}::uuid AND status='PENDING' FOR UPDATE),
   confirmed AS (
    UPDATE bookings b SET status='CONFIRMED',confirmed_at=now(),updated_at=now()
    FROM booking WHERE b.id=booking.id RETURNING b.id
   ),
   trip AS (
    INSERT INTO trips(booking_id,reference,driver_name,vehicle_registration,scheduled_departure,scheduled_arrival)
    SELECT confirmed.id,'TR-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),${driverName},${vehicleRegistration},${from.toISOString()}::timestamptz,${to.toISOString()}::timestamptz
    FROM confirmed RETURNING id,reference
   ),
   shipment AS (
    INSERT INTO shipments(booking_id,tracking_number)
    SELECT confirmed.id,'NVL-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,16))
    FROM confirmed RETURNING id,tracking_number
   ),
   initial_event AS (
    INSERT INTO shipment_events(shipment_id,status,note,actor)
    SELECT shipment.id,'SCHEDULED','Booking confirmed and trip scheduled',${process.env.ADMIN_EMAIL || "admin"}
    FROM shipment RETURNING id
   )
   SELECT trip.reference AS trip_reference,shipment.tracking_number,(SELECT count(*) FROM initial_event) AS events_written
   FROM trip CROSS JOIN shipment`;
  if(!rows.length)return NextResponse.json({error:"Only PENDING bookings can be confirmed"},{status:409});
  return NextResponse.json({ok:true,tripReference:rows[0].trip_reference,trackingNumber:rows[0].tracking_number});
 }catch{return NextResponse.json({error:"Unable to confirm booking. Check migrations and duplicate assignments."},{status:503});}
}
