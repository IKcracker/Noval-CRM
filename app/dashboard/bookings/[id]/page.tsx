import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {Banknote,Boxes,CalendarClock,ClipboardList,ExternalLink,Mail,MapPin,Navigation,Package,PackageCheck,Phone,Truck,UserRound,Weight} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {guessVehicleType} from "@/lib/vehicle-type";
import {place} from "@/lib/places";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {VehicleThumbnail} from "@/components/admin/vehicle-thumbnail";
import {InfoList,JourneyLine,Panel,RecordHeader,StageStepper,StatusPill,dateTime,shortDateTime,rand} from "@/components/admin/record-detail";
import {ConfirmBooking} from "./confirm-booking";
type Booking={id:string;reference:string;status:string;created_at:Date;confirmed_at:Date|null;quote_id:string;quote_reference:string;contact_name:string;company:string|null;email:string;phone:string;origin:string;destination:string;service_type:string;cargo_details:string;weight_kg:string|null;pickup_date:string|null;quoted_amount_cents:string|null};
type Trip={reference:string;status:string;driver_name:string;vehicle_registration:string;make_model:string|null;scheduled_departure:Date;scheduled_arrival:Date;shipment_id:string|null;tracking_number:string|null;shipment_status:string|null};
export default async function BookingDetail({params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())redirect("/admin/login");const {id}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))notFound();
 let data:Booking[]=[],trips:Trip[]=[],drivers:{id:string;full_name:string}[]=[],vehicles:{id:string;registration:string}[]=[],error="";
 try{
  const sql=db();
  data=await sql`SELECT b.id,b.reference,b.status,b.created_at,b.confirmed_at,b.quote_id,q.reference AS quote_reference,q.contact_name,q.company,q.email,q.phone,
    q.origin,q.destination,q.service_type,q.cargo_details,q.weight_kg::text AS weight_kg,q.pickup_date::text AS pickup_date,q.quoted_amount_cents::text AS quoted_amount_cents
   FROM bookings b JOIN quote_requests q ON q.id=b.quote_id WHERE b.id=${id}::uuid LIMIT 1` as Booking[];
  trips=await sql`SELECT t.reference,t.status,t.driver_name,t.vehicle_registration,coalesce(v.make_model,vr.make_model) AS make_model,t.scheduled_departure,t.scheduled_arrival,
    s.id AS shipment_id,s.tracking_number,s.status AS shipment_status
   FROM trips t LEFT JOIN shipments s ON s.booking_id=t.booking_id LEFT JOIN vehicles v ON v.id=t.vehicle_id
   LEFT JOIN vehicles vr ON t.vehicle_id IS NULL AND vr.registration=t.vehicle_registration
   WHERE t.booking_id=${id}::uuid LIMIT 1` as Trip[];
  drivers=await sql`SELECT id,full_name FROM drivers WHERE status='VERIFIED' AND license_expiry>=current_date ORDER BY full_name` as {id:string;full_name:string}[];
  vehicles=await sql`SELECT id,registration FROM vehicles WHERE status='VERIFIED' AND roadworthy_expiry>=current_date ORDER BY registration` as {id:string;registration:string}[];
 }catch{error="Unable to load booking. Apply the booking migration.";}
 if(!data.length&&!error)notFound();
 if(error)return <main className="mx-auto max-w-[1740px] p-3 md:p-4"><Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card></main>;
 const b=data[0],trip=trips[0];
 // Index of the stage in progress; earlier stages are complete.
 const stage=!trip?1:trip.shipment_status&&trip.shipment_status!=="SCHEDULED"?4:3;
 return <main className="mx-auto max-w-[1740px] space-y-4 p-3 md:p-4">
  <RecordHeader back={{href:"/dashboard/bookings",label:"All bookings"}} icon={Boxes} eyebrow="Booking" title={b.reference} status={b.status}
   meta={<><span className="flex items-center gap-1.5"><MapPin className="size-3.5"/>{place(b.origin)} → {place(b.destination)}</span><span>{b.company||b.contact_name}</span><span>From quotation <Link href={"/dashboard/quotes/"+b.quote_id} className="font-medium text-foreground hover:underline">{b.quote_reference}</Link></span></>}
   actions={trip?.shipment_id?<Button nativeButton={false} size="sm" className="h-9 px-3" render={<Link href={"/dashboard/shipments/"+trip.shipment_id}/>}><PackageCheck className="size-3.5"/> Open shipment</Button>:null}
   facts={[
    {label:"Agreed price",value:rand(b.quoted_amount_cents)??"Not priced",sub:"Accepted quotation value",icon:Banknote},
    {label:"Cargo",value:b.weight_kg?Number(b.weight_kg).toLocaleString("en-ZA")+" kg":"Weight not recorded",sub:b.service_type,icon:Weight},
    {label:"Requested pickup",value:b.pickup_date?new Date(b.pickup_date).toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric"}):"Not specified",sub:"Customer preference",icon:CalendarClock},
    {label:"Booked",value:dateTime(b.created_at),sub:b.confirmed_at?"Confirmed "+dateTime(b.confirmed_at):trip?"Trip "+trip.reference:"Awaiting dispatch",icon:ClipboardList}
   ]}/>
  <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
   <div className="min-w-0 space-y-4">
    <Panel title="Booking progress"><StageStepper steps={["Quote accepted","Dispatch planned","Trip confirmed","Collected"]} current={stage} failed={b.status==="CANCELLED"}/></Panel>
    <div className="grid gap-4 lg:grid-cols-2">
     <Panel title="Route" description="Collection and delivery addresses"><JourneyLine origin={b.origin} destination={b.destination} departure={trip?shortDateTime(trip.scheduled_departure):null} arrival={trip?shortDateTime(trip.scheduled_arrival):null}/></Panel>
     <Panel title="Cargo details" description={b.service_type}><p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/80">{b.cargo_details}</p></Panel>
    </div>
    {trip?<Panel title="Confirmed trip" description={"Trip "+trip.reference} action={<StatusPill status={trip.status}/>}>
     <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
      <VehicleThumbnail type={guessVehicleType(trip.make_model)} className="h-28 w-full rounded-xl border-0 md:w-48"/>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
       <div><p className="text-[11.5px] text-muted-foreground">Vehicle</p><p className="mt-0.5 flex items-center gap-1.5 text-[14px] font-semibold"><Truck className="size-3.5"/>{trip.vehicle_registration}</p><p className="truncate text-[11.5px] text-muted-foreground">{trip.make_model??"Model not recorded"}</p></div>
       <div><p className="text-[11.5px] text-muted-foreground">Driver</p><p className="mt-0.5 flex items-center gap-1.5 text-[14px] font-semibold"><UserRound className="size-3.5"/>{trip.driver_name}</p></div>
       <div><p className="text-[11.5px] text-muted-foreground">Tracking reference</p><p className="mt-0.5 font-mono text-[13px] font-semibold">{trip.tracking_number??"—"}</p></div>
       <div><p className="text-[11.5px] text-muted-foreground">Shipment status</p><div className="mt-1">{trip.shipment_status?<StatusPill status={trip.shipment_status}/>:"—"}</div></div>
      </div>
     </div>
    </Panel>:null}
   </div>
   <div className="min-w-0 space-y-4 xl:sticky xl:top-20">
    {b.status==="PENDING"?<ConfirmBooking id={b.id} drivers={drivers} vehicles={vehicles}/>
    :<Panel title={b.status==="CANCELLED"?"Booking cancelled":"Dispatch confirmed"} description={b.status==="CANCELLED"?"No further dispatch actions are available.":"Trip scheduled and tracking reference issued."}>
     {trip?.shipment_id&&<div className="grid grid-cols-2 gap-2"><Button nativeButton={false} size="sm" className="h-8" render={<Link href={"/dashboard/shipments/"+trip.shipment_id}/>}>Shipment <ExternalLink className="size-3.5"/></Button><Button nativeButton={false} variant="outline" size="sm" className="h-8" render={<Link href="/dashboard/routes"/>}><Navigation className="size-3.5"/> Route</Button></div>}
     <p className="mt-3 text-[11.5px] text-muted-foreground">Live GPS positions need a separate telematics integration.</p>
    </Panel>}
    <Panel title="Customer">
     <InfoList items={[
      {label:"Contact",value:b.contact_name,icon:UserRound},
      ...(b.company?[{label:"Company",value:b.company,icon:Package}]:[]),
      {label:"Email",value:<a href={"mailto:"+b.email} className="text-emerald-700 hover:underline">{b.email}</a>,icon:Mail},
      {label:"Phone",value:<a href={"tel:"+b.phone} className="hover:underline">{b.phone}</a>,icon:Phone}
     ]}/>
    </Panel>
   </div>
  </div>
 </main>;
}
