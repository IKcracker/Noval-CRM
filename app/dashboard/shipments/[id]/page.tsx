import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {CalendarClock,ClipboardList,Clock,ExternalLink,Mail,MapPin,Navigation,Package,PackageCheck,Phone,Truck,UserRound,Weight} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {guessVehicleType} from "@/lib/vehicle-type";
import {place} from "@/lib/places";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {VehicleThumbnail} from "@/components/admin/vehicle-thumbnail";
import {InfoList,JourneyLine,Panel,RecordHeader,StageStepper,Timeline,dateTime,shortDateTime,statusLabel} from "@/components/admin/record-detail";
import {MilestoneForm} from "./milestone-form";
type Shipment={id:string;tracking_number:string;status:string;origin:string;destination:string;contact_name:string;company:string|null;email:string;phone:string;service_type:string;cargo_details:string;weight_kg:string|null;quote_id:string;booking_id:string;booking_reference:string;trip_reference:string|null;driver_name:string|null;vehicle_registration:string|null;make_model:string|null;scheduled_departure:Date|null;scheduled_arrival:Date|null;created_at:Date};
type Event={id:string;status:string;note:string|null;actor:string;location_label:string|null;visible_to_customer:boolean;created_at:Date};
const milestones=["SCHEDULED","PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY","DELIVERED"];
export default async function ShipmentPage({params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())redirect("/admin/login");const {id}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))notFound();
 let rows:Shipment[]=[],events:Event[]=[],error="";
 try{
  const sql=db();
  rows=await sql`SELECT s.id,s.tracking_number,s.status,s.created_at,q.origin,q.destination,q.contact_name,q.company,q.email,q.phone,q.service_type,q.cargo_details,
    q.weight_kg::text AS weight_kg,q.id AS quote_id,b.id AS booking_id,b.reference AS booking_reference,
    t.reference AS trip_reference,t.driver_name,t.vehicle_registration,coalesce(v.make_model,vr.make_model) AS make_model,t.scheduled_departure,t.scheduled_arrival
   FROM shipments s JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id
   LEFT JOIN trips t ON t.booking_id=b.id LEFT JOIN vehicles v ON v.id=t.vehicle_id
   LEFT JOIN vehicles vr ON t.vehicle_id IS NULL AND vr.registration=t.vehicle_registration
   WHERE s.id=${id}::uuid` as Shipment[];
  events=await sql`SELECT id,status,note,actor,location_label,visible_to_customer,created_at FROM shipment_events WHERE shipment_id=${id}::uuid ORDER BY created_at DESC LIMIT 150` as Event[];
 }catch{error="Shipment details are temporarily unavailable. Apply migration 003.";}
 if(!rows.length&&!error)notFound();
 if(error)return <main className="mx-auto max-w-[1740px] p-3 md:p-4"><Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card></main>;
 const s=rows[0],exception=s.status==="EXCEPTION",halted=["EXCEPTION","CANCELLED","RETURNED"].includes(s.status);
 const lastMilestone=events.find(e=>milestones.includes(e.status))?.status??"SCHEDULED";
 const step=milestones.indexOf(halted?lastMilestone:s.status);
 const latest=events[0];
 return <main className="mx-auto max-w-[1740px] space-y-4 p-3 md:p-4">
  <RecordHeader back={{href:"/dashboard/shipments",label:"All shipments"}} icon={PackageCheck} eyebrow="Shipment" title={s.tracking_number} status={s.status}
   meta={<><span className="flex items-center gap-1.5"><MapPin className="size-3.5"/>{place(s.origin)} → {place(s.destination)}</span><span>{s.company||s.contact_name}</span><span>Booking <Link href={"/dashboard/bookings/"+s.booking_id} className="font-medium text-foreground hover:underline">{s.booking_reference}</Link></span></>}
   actions={<><Button nativeButton={false} variant="outline" size="sm" className="h-9 px-3" render={<Link href="/dashboard/routes"/>}><Navigation className="size-3.5"/> Route</Button><Button nativeButton={false} size="sm" className="h-9 px-3" render={<a href="#update"/>}>Record milestone</Button></>}
   facts={[
    {label:"Current milestone",value:statusLabel(s.status),sub:latest?"Updated "+dateTime(latest.created_at):"No milestones yet",icon:Clock},
    {label:"Scheduled collection",value:s.scheduled_departure?shortDateTime(s.scheduled_departure):"Not scheduled",sub:place(s.origin),icon:CalendarClock},
    {label:"Scheduled delivery",value:s.scheduled_arrival?shortDateTime(s.scheduled_arrival):"Not scheduled",sub:place(s.destination),icon:CalendarClock},
    {label:"Cargo",value:s.weight_kg?Number(s.weight_kg).toLocaleString("en-ZA")+" kg":"Weight not recorded",sub:s.service_type,icon:Weight}
   ]}/>
  <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
   <div className="min-w-0 space-y-4">
    <Panel title="Delivery progress" description="Based on recorded milestones, not live GPS">
     <StageStepper steps={milestones.map(statusLabel)} current={Math.max(0,step)+1} failed={halted}/>
     {exception&&<p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[12.5px] text-red-700">Exception recorded{latest?.note?": "+latest.note:""}. Resolve it and record the next milestone.</p>}
    </Panel>
    <div className="grid gap-4 lg:grid-cols-2">
     <Panel title="Journey" description={s.trip_reference?"Trip "+s.trip_reference:"No trip assigned"}>
      <JourneyLine origin={s.origin} destination={s.destination} departure={s.scheduled_departure?shortDateTime(s.scheduled_departure):null} arrival={s.scheduled_arrival?shortDateTime(s.scheduled_arrival):null}/>
     </Panel>
     <Panel title="Vehicle & driver" description="Assigned at dispatch">
      {s.vehicle_registration?<div className="flex items-center gap-4"><VehicleThumbnail type={guessVehicleType(s.make_model)} className="h-20 w-32 shrink-0 rounded-lg border-0"/><div className="min-w-0 space-y-1.5"><p className="flex items-center gap-1.5 text-[15px] font-semibold"><Truck className="size-4"/>{s.vehicle_registration}</p><p className="truncate text-[12px] text-muted-foreground">{s.make_model??"Model not recorded"}</p><p className="flex items-center gap-1.5 text-[13px] font-medium"><UserRound className="size-3.5"/>{s.driver_name}</p></div></div>
      :<p className="text-[12.5px] text-muted-foreground">No vehicle assigned yet.</p>}
     </Panel>
    </div>
    <Panel title="Milestone history" description={events.length+" recorded event"+(events.length===1?"":"s")+", newest first"}>
     <Timeline empty="No milestones recorded." items={events.map(e=>({id:e.id,status:e.status,title:statusLabel(e.status),body:e.note,badge:e.visible_to_customer?undefined:"Internal",meta:dateTime(e.created_at)+(e.location_label?" · "+e.location_label:"")+" · "+e.actor}))}/>
    </Panel>
   </div>
   <div className="min-w-0 space-y-4 xl:sticky xl:top-20">
    <Panel title="Update shipment" description="Record a verified event. This is not a live GPS position." className="scroll-mt-20" bodyClassName="px-5 pb-5"><div id="update"><MilestoneForm key={s.status} id={s.id} status={s.status}/></div></Panel>
    <Panel title="Customer">
     <InfoList items={[
      {label:"Contact",value:s.contact_name,icon:UserRound},
      ...(s.company?[{label:"Company",value:s.company,icon:Package}]:[]),
      {label:"Email",value:<a href={"mailto:"+s.email} className="text-emerald-700 hover:underline">{s.email}</a>,icon:Mail},
      {label:"Phone",value:<a href={"tel:"+s.phone} className="hover:underline">{s.phone}</a>,icon:Phone}
     ]}/>
     <p className="mt-4 rounded-lg bg-muted/60 p-3 text-[12px] leading-relaxed text-foreground/75">{s.cargo_details}</p>
     <div className="mt-4 grid grid-cols-2 gap-2"><Button nativeButton={false} variant="outline" size="sm" className="h-8" render={<Link href={"/dashboard/quotes/"+s.quote_id}/>}><ClipboardList className="size-3.5"/> Quotation</Button><Button nativeButton={false} variant="outline" size="sm" className="h-8" render={<Link href={"/dashboard/bookings/"+s.booking_id}/>}>Booking <ExternalLink className="size-3.5"/></Button></div>
    </Panel>
   </div>
  </div>
 </main>;
}
