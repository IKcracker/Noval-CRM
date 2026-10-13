import {redirect} from "next/navigation";
import {CircleCheck,ShieldAlert,Truck,UserRound} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Card,CardContent} from "@/components/ui/card";
import {OverviewStats,depotTime,type OverviewStat} from "@/components/admin/overview-stats";
import {FleetWorkspace,type DriverRecord,type VehicleRecord} from "./workspace";
// A trip occupies its driver and vehicle until the shipment is delivered, returned or cancelled.
const ACTIVE="t.status<>'CANCELLED' AND coalesce(s.status,'SCHEDULED') NOT IN ('DELIVERED','RETURNED','CANCELLED')";
export default async function Fleet(){
 if(!await isAdmin())redirect("/admin/login");
 let drivers:DriverRecord[]=[],vehicles:VehicleRecord[]=[],error="";
 try{
  const sql=db();
  const [driverRows,vehicleRows]=await Promise.all([
   sql.query(`SELECT d.id,d.full_name,d.phone,d.license_number,d.license_expiry::text AS license_expiry,d.status,d.created_at,
     (d.license_expiry-current_date)::int AS days_left,
     (SELECT count(*)::int FROM trips t WHERE t.driver_id=d.id OR (t.driver_id IS NULL AND t.driver_name=d.full_name)) AS trips,
     a.reference AS trip_reference,a.shipment_id,a.origin,a.destination
    FROM drivers d LEFT JOIN LATERAL (
     SELECT t.reference,s.id AS shipment_id,q.origin,q.destination FROM trips t JOIN bookings b ON b.id=t.booking_id
     JOIN quote_requests q ON q.id=b.quote_id LEFT JOIN shipments s ON s.booking_id=b.id
     WHERE (t.driver_id=d.id OR (t.driver_id IS NULL AND t.driver_name=d.full_name)) AND ${ACTIVE}
     ORDER BY t.scheduled_departure LIMIT 1) a ON true
    ORDER BY d.full_name LIMIT 300`),
   sql.query(`SELECT v.id,v.registration,v.make_model,v.capacity_kg::text AS capacity_kg,v.roadworthy_expiry::text AS roadworthy_expiry,v.status,v.created_at,
     (v.roadworthy_expiry-current_date)::int AS days_left,
     (SELECT count(*)::int FROM trips t WHERE t.vehicle_id=v.id OR (t.vehicle_id IS NULL AND t.vehicle_registration=v.registration)) AS trips,
     a.reference AS trip_reference,a.shipment_id,a.origin,a.destination,a.driver_name
    FROM vehicles v LEFT JOIN LATERAL (
     SELECT t.reference,t.driver_name,s.id AS shipment_id,q.origin,q.destination FROM trips t JOIN bookings b ON b.id=t.booking_id
     JOIN quote_requests q ON q.id=b.quote_id LEFT JOIN shipments s ON s.booking_id=b.id
     WHERE (t.vehicle_id=v.id OR (t.vehicle_id IS NULL AND t.vehicle_registration=v.registration)) AND ${ACTIVE}
     ORDER BY t.scheduled_departure LIMIT 1) a ON true
    ORDER BY v.registration LIMIT 300`)
  ]);
  drivers=driverRows as DriverRecord[];vehicles=vehicleRows as VehicleRecord[];
 }catch{error="Fleet unavailable. Run npm run data:migrate to apply migration 004.";}
 const dispatchable=(r:{status:string;days_left:number;trip_reference:string|null})=>r.status==="VERIFIED"&&r.days_left>=0&&!r.trip_reference;
 const expired=[...drivers,...vehicles].filter(r=>r.days_left<0).length,expiring=[...drivers,...vehicles].filter(r=>r.days_left>=0&&r.days_left<=30).length;
 const pending=[...drivers,...vehicles].filter(r=>r.status==="PENDING").length;
 const stats:OverviewStat[]=[
  {label:"Vehicles available",value:String(vehicles.filter(dispatchable).length).padStart(2,"0"),chip:vehicles.filter(v=>v.trip_reference).length+" on a trip",info:"Verified, compliant and free · "+vehicles.length+" registered",tone:"text-emerald-600",icon:Truck,href:"#fleet"},
  {label:"Drivers available",value:String(drivers.filter(dispatchable).length).padStart(2,"0"),chip:drivers.filter(d=>d.trip_reference).length+" on a trip",info:"Verified, licensed and free · "+drivers.length+" registered",tone:"text-emerald-600",icon:UserRound,href:"#fleet"},
  {label:"Compliance alerts",value:String(expired+expiring).padStart(2,"0"),chip:expired?expired+" expired":"None expired",info:"Licences and roadworthies due within 30 days",tone:expired?"text-red-500":"text-emerald-600",icon:ShieldAlert,href:"#fleet"},
  {label:"Awaiting verification",value:String(pending).padStart(2,"0"),chip:pending?"Review documents":"All reviewed",info:"New or reinstated records",tone:pending?"text-amber-600":"text-emerald-600",icon:CircleCheck,href:"#fleet"}
 ];
 return <main className="mx-auto max-w-[1740px] space-y-4 p-3 md:p-4">
  {error?<Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card>:<>
   <OverviewStats title="Fleet overview" updated={depotTime()} stats={stats}/>
   <FleetWorkspace drivers={drivers.map(d=>({...d,created_at:new Date(d.created_at).toISOString()}))} vehicles={vehicles.map(v=>({...v,created_at:new Date(v.created_at).toISOString()}))}/>
  </>}
 </main>;
}
