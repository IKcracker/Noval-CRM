import {redirect} from "next/navigation";
import {AlarmClock,Flag,Navigation,Truck} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Card,CardContent} from "@/components/ui/card";
import {OverviewStats,depotTime,type OverviewStat} from "@/components/admin/overview-stats";
import {RouteSelector,type Journey} from "./route-selector";
/** Overview figures, computed against a single request timestamp. */
function routeStats(routes:Journey[]){
 const now=Date.now(),day=86400000,time=(iso:string)=>new Date(iso).getTime();
 const open=(r:Journey)=>!["DELIVERED","RETURNED","CANCELLED"].includes(r.shipment_status??"")&&!["COMPLETED","CANCELLED"].includes(r.status);
 const waiting=routes.filter(r=>open(r)&&(r.shipment_status??"SCHEDULED")==="SCHEDULED");
 const moving=routes.filter(r=>open(r)&&r.shipment_status!=null&&r.shipment_status!=="SCHEDULED");
 const overdueDepartures=waiting.filter(r=>time(r.scheduled_departure)<now).length;
 const lateArrivals=moving.filter(r=>time(r.scheduled_arrival)<now).length;
 const stats:OverviewStat[]=[
  {label:"Active trips",value:String(waiting.length+moving.length).padStart(2,"0"),chip:routes.length+" on record",info:"Planned or underway",tone:"text-emerald-600",icon:Navigation,href:"#trips"},
  {label:"Departing in 24 hours",value:String(waiting.filter(r=>time(r.scheduled_departure)>=now&&time(r.scheduled_departure)<now+day).length).padStart(2,"0"),chip:overdueDepartures?overdueDepartures+" overdue":"None overdue",info:"Scheduled collections",tone:overdueDepartures?"text-red-500":"text-emerald-600",icon:AlarmClock,href:"#trips"},
  {label:"On the road",value:String(moving.length).padStart(2,"0"),chip:lateArrivals?lateArrivals+" past ETA":"On schedule",info:"Collected, not yet delivered",tone:lateArrivals?"text-red-500":"text-emerald-600",icon:Truck,href:"#trips"},
  {label:"Arriving in 24 hours",value:String(moving.filter(r=>time(r.scheduled_arrival)>=now&&time(r.scheduled_arrival)<now+day).length).padStart(2,"0"),chip:new Set([...waiting,...moving].map(r=>r.vehicle_registration)).size+" vehicles",info:"Scheduled deliveries",tone:"text-emerald-600",icon:Flag,href:"#trips"}
 ];
 return {now,stats};
}
export default async function RoutePlanning(){
 if(!await isAdmin())redirect("/admin/login");
 let routes:Journey[]=[],error="";
 try {
  const sql=db();
  const result=await sql`SELECT t.id,t.reference,t.status,q.origin,q.destination,q.service_type,q.weight_kg::text AS weight_kg,
    t.driver_name,t.vehicle_registration,coalesce(v.make_model,vr.make_model) AS make_model,
    t.scheduled_departure,t.scheduled_arrival,q.contact_name AS customer,b.id AS booking_id,
    s.id AS shipment_id,s.tracking_number,s.status AS shipment_status
   FROM trips t JOIN bookings b ON b.id=t.booking_id JOIN quote_requests q ON q.id=b.quote_id
   LEFT JOIN shipments s ON s.booking_id=b.id
   LEFT JOIN vehicles v ON v.id=t.vehicle_id
   LEFT JOIN vehicles vr ON t.vehicle_id IS NULL AND vr.registration=t.vehicle_registration
   ORDER BY CASE WHEN t.status IN ('CONFIRMED','IN_TRANSIT') THEN 0 ELSE 1 END,t.scheduled_departure LIMIT 150`;
  routes=result.map(r=>({...r,scheduled_departure:new Date(r.scheduled_departure).toISOString(),scheduled_arrival:new Date(r.scheduled_arrival).toISOString()})) as Journey[];
 }catch{error="Trip routes are unavailable. Verify the Neon connection and migration 002.";}
 const {now,stats}=routeStats(routes);
 return <main className="mx-auto max-w-[1740px] space-y-4 p-3 md:p-4">
  {error?<Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card>:<>
  <OverviewStats title="Route overview" updated={depotTime()} stats={stats}/>
  {routes.length===0?<Card><CardContent className="py-14 text-center text-sm text-muted-foreground">No confirmed trips yet. Confirm a booking to create a route.</CardContent></Card>:<RouteSelector routes={routes} now={now}/>}
  </>}
 </main>;
}
