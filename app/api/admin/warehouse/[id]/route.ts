import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {dockCount,loadingStatuses} from "@/lib/warehouse";
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))return NextResponse.json({error:"Invalid trip ID"},{status:400});
 let body:unknown;try{body=await req.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 const p=(body??{}) as Record<string,unknown>;
 const dock=p.dock===null?null:Number(p.dock),loaded=Number(p.loadedKg),status=String(p.loadingStatus);
 if(dock!==null&&(!Number.isInteger(dock)||dock<1||dock>dockCount()))return NextResponse.json({error:"Choose a dock between 1 and "+dockCount()+"."},{status:400});
 if(!Number.isFinite(loaded)||loaded<0||loaded>100000)return NextResponse.json({error:"Enter a valid loaded weight."},{status:400});
 if(!loadingStatuses.some(s=>s===status))return NextResponse.json({error:"Invalid loading status"},{status:400});
 if(status==="NOT_STARTED"&&loaded>0)return NextResponse.json({error:"A vehicle with cargo on board is already loading."},{status:400});
 if(status!=="NOT_STARTED"&&dock===null)return NextResponse.json({error:"Assign a dock before loading starts."},{status:400});
 if(status==="READY"&&loaded<=0)return NextResponse.json({error:"Record the loaded weight before marking the vehicle ready."},{status:400});
 try{
  const sql=db();
  const rows=await sql`
   WITH target AS (
    SELECT t.id,s.id AS shipment_id,t.loading_status AS previous,coalesce(v.capacity_kg,vr.capacity_kg) AS capacity
    FROM trips t JOIN shipments s ON s.booking_id=t.booking_id
    LEFT JOIN vehicles v ON v.id=t.vehicle_id LEFT JOIN vehicles vr ON t.vehicle_id IS NULL AND vr.registration=t.vehicle_registration
    WHERE t.id=${id}::uuid AND t.status='CONFIRMED' AND s.status='SCHEDULED'
   ), eligible AS (
    SELECT target.* FROM target WHERE (target.capacity IS NULL OR ${loaded}<=target.capacity)
    AND (${dock}::smallint IS NULL OR NOT EXISTS (
     SELECT 1 FROM trips o JOIN shipments os ON os.booking_id=o.booking_id
     WHERE o.id<>target.id AND o.loading_dock=${dock}::smallint AND o.status='CONFIRMED' AND os.status='SCHEDULED'))
   ), changed AS (
    UPDATE trips t SET loading_dock=${dock}::smallint,loaded_kg=${loaded},loading_status=${status},loading_updated_at=now(),updated_at=now()
    FROM eligible WHERE t.id=eligible.id RETURNING t.id
   ), event AS (
    INSERT INTO shipment_events(shipment_id,status,note,location_label,visible_to_customer,actor)
    SELECT eligible.shipment_id,'SCHEDULED',
     CASE ${status} WHEN 'READY' THEN 'Loaded and ready for dispatch' WHEN 'LOADING' THEN 'Warehouse loading started' ELSE 'Loading reset' END,
     CASE WHEN ${dock}::smallint IS NULL THEN 'Warehouse' ELSE 'Warehouse dock '||${dock}::smallint END,false,${process.env.ADMIN_EMAIL||"admin"}
    FROM eligible JOIN changed ON changed.id=eligible.id WHERE eligible.previous<>${status}
    RETURNING id
   )
   SELECT (SELECT count(*)::int FROM target) AS found,(SELECT count(*)::int FROM changed) AS updated,
    (SELECT capacity::text FROM target LIMIT 1) AS capacity,(SELECT count(*)::int FROM event) AS events_written`;
  const r=rows[0];
  if(!r?.found)return NextResponse.json({error:"This vehicle is no longer waiting in the warehouse."},{status:409});
  if(!r.updated)return NextResponse.json({error:r.capacity&&loaded>Number(r.capacity)?"Loaded weight exceeds the vehicle capacity of "+Number(r.capacity).toLocaleString("en-ZA")+" kg.":"Dock "+dock+" is already in use by another vehicle."},{status:409});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Unable to update loading. Run npm run data:migrate to apply migration 007."},{status:503});}
}
