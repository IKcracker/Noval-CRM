import {redirect} from "next/navigation";
import {CircleCheck,PackageOpen,Truck,Warehouse} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {dockCount} from "@/lib/warehouse";
import {Card,CardContent} from "@/components/ui/card";
import {OverviewStats,depotTime,type OverviewStat} from "@/components/admin/overview-stats";
import {WarehouseBoard,type WarehouseVehicle} from "./warehouse-board";
type Summary={at_docks:number;loading:number;pending_bookings:number;new_bookings:number;docks_used:number;ready:number;departing_today:number};
export default async function WarehouseOperations(){
 if(!await isAdmin())redirect("/admin/login");
 const docks=dockCount();
 let vehicles:WarehouseVehicle[]=[],summary:Summary|undefined,error="";
 try{
  const sql=db();
  const rows=await sql`
   SELECT t.id,t.reference,t.driver_name,coalesce(v.registration,t.vehicle_registration) AS registration,
    coalesce(v.make_model,vr.make_model) AS make_model,coalesce(v.capacity_kg,vr.capacity_kg)::text AS capacity_kg,
    t.loading_dock,t.loaded_kg::text AS loaded_kg,t.loading_status,t.scheduled_departure,
    s.id AS shipment_id,s.tracking_number,s.status AS shipment_status,b.id AS booking_id,
    q.origin,q.destination,q.weight_kg::text AS booked_kg
   FROM trips t JOIN shipments s ON s.booking_id=t.booking_id JOIN bookings b ON b.id=t.booking_id
   JOIN quote_requests q ON q.id=b.quote_id
   LEFT JOIN vehicles v ON v.id=t.vehicle_id
   LEFT JOIN vehicles vr ON t.vehicle_id IS NULL AND vr.registration=t.vehicle_registration
   WHERE t.status='CONFIRMED' AND (s.status='SCHEDULED' OR (t.loading_dock IS NOT NULL AND s.status NOT IN ('CANCELLED','EXCEPTION')
    AND EXISTS (SELECT 1 FROM shipment_events e WHERE e.shipment_id=s.id AND e.status='PICKED_UP' AND e.created_at>=current_date)))
   ORDER BY (s.status<>'SCHEDULED'),CASE t.loading_status WHEN 'LOADING' THEN 0 WHEN 'READY' THEN 1 ELSE 2 END,t.scheduled_departure
   LIMIT 120`;
  vehicles=rows.map(r=>({...r,scheduled_departure:new Date(r.scheduled_departure).toISOString()})) as WarehouseVehicle[];
  const localDay=(d:string|Date)=>new Date(d).toLocaleDateString("en-CA",{timeZone:"Africa/Johannesburg"});
  const queue=vehicles.filter(v=>v.shipment_status==="SCHEDULED"),today=localDay(new Date());
  const counts=await sql`SELECT count(*)::int AS pending_bookings,count(*) FILTER (WHERE created_at>=current_date)::int AS new_bookings FROM bookings WHERE status='PENDING'`;
  summary={
   at_docks:queue.filter(v=>v.loading_dock!==null).length,
   loading:queue.filter(v=>v.loading_status==="LOADING").length,
   pending_bookings:counts[0].pending_bookings,new_bookings:counts[0].new_bookings,
   docks_used:new Set(queue.map(v=>v.loading_dock).filter(d=>d!==null)).size,
   ready:queue.filter(v=>v.loading_status==="READY").length,
   departing_today:queue.filter(v=>localDay(v.scheduled_departure)===today).length
  };
 }catch{error="Warehouse data is unavailable. Run npm run data:migrate to apply migration 007, then refresh.";}
 const updated=depotTime();
 const stats:OverviewStat[]=summary?[
  {label:"Vehicles at docks",value:String(summary.at_docks).padStart(2,"0"),chip:summary.loading+" loading",info:"Assigned to a loading dock",tone:"text-emerald-600",icon:Truck,href:"#vehicles"},
  {label:"Unassigned bookings",value:String(summary.pending_bookings).padStart(2,"0"),chip:"+"+summary.new_bookings+" today",info:"Awaiting driver and vehicle",tone:summary.new_bookings?"text-red-500":"text-muted-foreground",icon:PackageOpen,href:"/dashboard/bookings?status=PENDING"},
  {label:"Active loading docks",value:summary.docks_used+"/"+docks,chip:Math.round(summary.docks_used/docks*100)+"%",info:"Currently in use",tone:"text-emerald-600",icon:Warehouse,href:"#vehicles"},
  {label:"Dispatch ready",value:String(summary.ready).padStart(2,"0"),chip:summary.departing_today+" due today",info:"Loaded and ready for departure",tone:"text-emerald-600",icon:CircleCheck,href:"#vehicles"}
 ]:[];
 return <main className="mx-auto max-w-[1740px] space-y-4 p-3 md:p-4">
  {error?<Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card>:<>
  <OverviewStats title="Warehouse overview" updated={updated} stats={stats}/>
  <WarehouseBoard vehicles={vehicles} docks={docks}/>
  </>}
 </main>;
}
