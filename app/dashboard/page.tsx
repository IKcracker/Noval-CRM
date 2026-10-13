import Link from "next/link";
import {redirect} from "next/navigation";
import {AlertTriangle,ArrowRight,CalendarClock,CircleCheck,ClipboardList,Clock,MapPin,PackageCheck,PackageOpen,ShieldAlert,Truck,UserRound,type LucideIcon} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {OverviewStats,depotTime,type OverviewStat} from "@/components/admin/overview-stats";
import {QuoteActivityChart} from "@/components/admin/quote-activity-chart";
import {VehicleThumbnail} from "@/components/admin/vehicle-thumbnail";
import {guessVehicleType} from "@/lib/vehicle-type";
import {place} from "@/lib/places";
type Stats={moving:number;out_for_delivery:number;scheduled:number;departing_today:number;exceptions:number;delivered_week:number;delivered_prev_week:number;reviewing:number;pending_bookings:number;today:string};
type Movement={id:string;tracking_number:string;status:string;last_milestone:string|null;origin:string;destination:string;contact_name:string;driver_name:string|null;vehicle_registration:string|null;make_model:string|null;last_event_at:Date|null};
type Departure={shipment_id:string;tracking_number:string;driver_name:string;vehicle_registration:string;destination:string;scheduled_departure:Date};
type Pipeline={status:string;total:number;amount_cents:string};
type Fleet={available:number;on_trip:number;pending:number;out_of_service:number};
type Expiry={kind:string;id:string;name:string;expires:string;days:number};
type Daily={day:string;total:number};
const milestones=["SCHEDULED","PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY","DELIVERED"];
const milestoneNames:Record<string,string>={SCHEDULED:"Scheduled",PICKED_UP:"Picked up",IN_TRANSIT:"In transit",OUT_FOR_DELIVERY:"Out for delivery",DELIVERED:"Delivered",EXCEPTION:"Exception"};
const funnel=[{status:"NEW",name:"New requests"},{status:"REVIEWING",name:"In review"},{status:"PRICED",name:"Priced"},{status:"SENT",name:"Sent to customer"},{status:"ACCEPTED",name:"Accepted"}];
function ago(date:Date|null){
 if(!date)return "No milestones yet";
 const minutes=Math.round((Date.now()-new Date(date).getTime())/60000),rtf=new Intl.RelativeTimeFormat("en",{numeric:"auto"});
 return Math.abs(minutes)<60?rtf.format(-minutes,"minute"):Math.abs(minutes)<1440?rtf.format(-Math.round(minutes/60),"hour"):rtf.format(-Math.round(minutes/1440),"day");
}
const time=(d:Date)=>new Date(d).toLocaleTimeString("en-ZA",{hour:"2-digit",minute:"2-digit",timeZone:"Africa/Johannesburg"});
const pad=(n:number)=>String(n).padStart(2,"0");
function SectionHead({title,description,href,action}:{title:string;description:string;href:string;action:string}){
 return <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-[17px] font-semibold tracking-tight">{title}</h2><p className="mt-1 text-[12.5px] text-muted-foreground">{description}</p></div><Button nativeButton={false} variant="outline" size="sm" className="h-9 px-3" render={<Link href={href}/>}>{action} <ArrowRight className="size-3.5"/></Button></div>;
}
export default async function Dashboard(){
 if(!await isAdmin())redirect("/admin/login");
 let stats:Stats|undefined,moving:Movement[]=[],departures:Departure[]=[],pipeline:Pipeline[]=[],fleet:Fleet|undefined,expiries:Expiry[]=[],activity:Daily[]=[],error="";
 try{
  const sql=db();
  [stats]=await sql`SELECT
   (SELECT count(*)::int FROM shipments WHERE status IN ('PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY')) AS moving,
   (SELECT count(*)::int FROM shipments WHERE status='OUT_FOR_DELIVERY') AS out_for_delivery,
   (SELECT count(*)::int FROM shipments WHERE status='SCHEDULED') AS scheduled,
   (SELECT count(*)::int FROM trips t JOIN shipments s ON s.booking_id=t.booking_id WHERE s.status='SCHEDULED'
     AND (t.scheduled_departure AT TIME ZONE 'Africa/Johannesburg')::date=(now() AT TIME ZONE 'Africa/Johannesburg')::date) AS departing_today,
   (SELECT count(*)::int FROM shipments WHERE status='EXCEPTION') AS exceptions,
   (SELECT count(DISTINCT shipment_id)::int FROM shipment_events WHERE status='DELIVERED' AND created_at>=now()-interval '7 days') AS delivered_week,
   (SELECT count(DISTINCT shipment_id)::int FROM shipment_events WHERE status='DELIVERED' AND created_at>=now()-interval '14 days' AND created_at<now()-interval '7 days') AS delivered_prev_week,
   (SELECT count(*)::int FROM quote_requests WHERE status IN ('NEW','REVIEWING')) AS reviewing,
   (SELECT count(*)::int FROM bookings WHERE status='PENDING') AS pending_bookings,
   (now() AT TIME ZONE 'Africa/Johannesburg')::date::text AS today` as Stats[];
  moving=await sql`SELECT s.id,s.tracking_number,s.status,q.origin,q.destination,q.contact_name,t.driver_name,t.vehicle_registration,
    coalesce(v.make_model,vr.make_model) AS make_model,
    (SELECT e.status FROM shipment_events e WHERE e.shipment_id=s.id AND e.status IN ('SCHEDULED','PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED') ORDER BY e.created_at DESC LIMIT 1) AS last_milestone,
    (SELECT max(e.created_at) FROM shipment_events e WHERE e.shipment_id=s.id) AS last_event_at
   FROM shipments s JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id
   LEFT JOIN trips t ON t.booking_id=b.id LEFT JOIN vehicles v ON v.id=t.vehicle_id
   LEFT JOIN vehicles vr ON t.vehicle_id IS NULL AND vr.registration=t.vehicle_registration
   WHERE s.status IN ('PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY','EXCEPTION')
   ORDER BY (s.status='EXCEPTION') DESC,s.updated_at DESC LIMIT 6` as Movement[];
  departures=await sql`SELECT s.id AS shipment_id,s.tracking_number,t.driver_name,t.vehicle_registration,q.destination,t.scheduled_departure
   FROM trips t JOIN shipments s ON s.booking_id=t.booking_id JOIN bookings b ON b.id=t.booking_id JOIN quote_requests q ON q.id=b.quote_id
   WHERE s.status='SCHEDULED' AND (t.scheduled_departure AT TIME ZONE 'Africa/Johannesburg')::date=(now() AT TIME ZONE 'Africa/Johannesburg')::date
   ORDER BY t.scheduled_departure LIMIT 5` as Departure[];
  pipeline=await sql`SELECT status,count(*)::int AS total,coalesce(sum(quoted_amount_cents),0)::text AS amount_cents
   FROM quote_requests WHERE created_at>=now()-interval '30 days' GROUP BY status` as Pipeline[];
  [fleet]=await sql`SELECT
   count(*) FILTER (WHERE v.status='VERIFIED' AND v.roadworthy_expiry>=current_date AND NOT busy)::int AS available,
   count(*) FILTER (WHERE busy AND v.status<>'OUT_OF_SERVICE')::int AS on_trip,
   count(*) FILTER (WHERE NOT busy AND (v.status='PENDING' OR (v.status='VERIFIED' AND v.roadworthy_expiry<current_date)))::int AS pending,
   count(*) FILTER (WHERE v.status='OUT_OF_SERVICE')::int AS out_of_service
   FROM (SELECT v.*,EXISTS(SELECT 1 FROM trips t JOIN shipments s ON s.booking_id=t.booking_id
     WHERE (t.vehicle_id=v.id OR (t.vehicle_id IS NULL AND t.vehicle_registration=v.registration))
     AND t.status<>'CANCELLED' AND s.status IN ('SCHEDULED','PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY','EXCEPTION')) AS busy FROM vehicles v) v` as Fleet[];
  expiries=await sql`SELECT * FROM (
    SELECT 'Vehicle roadworthy' AS kind,id,registration AS name,roadworthy_expiry::text AS expires,(roadworthy_expiry-current_date)::int AS days FROM vehicles WHERE status<>'OUT_OF_SERVICE' AND roadworthy_expiry<current_date+30
    UNION ALL
    SELECT 'Driver licence',id,full_name,license_expiry::text,(license_expiry-current_date)::int FROM drivers WHERE status<>'SUSPENDED' AND license_expiry<current_date+30
   ) x ORDER BY days LIMIT 4` as Expiry[];
  activity=await sql`SELECT (created_at AT TIME ZONE 'Africa/Johannesburg')::date::text AS day,count(*)::int AS total
   FROM quote_requests WHERE created_at>=now()-interval '14 days' GROUP BY 1 ORDER BY 1` as Daily[];
 }catch{error="Operational data is unavailable. Check your Neon connection and apply pending migrations.";}
 if(error||!stats||!fleet)return <main className="mx-auto max-w-[1740px] p-4 md:p-6"><Card><CardContent className="py-12 text-center text-sm text-destructive">{error||"Operational data is unavailable."}</CardContent></Card></main>;
 const weekChange=stats.delivered_week-stats.delivered_prev_week;
 const overview:OverviewStat[]=[
  {label:"On the road",value:pad(stats.moving),chip:stats.out_for_delivery+" out for delivery",info:"Collected and moving",tone:"text-emerald-600",icon:Truck,href:"/dashboard/shipments?status=IN_TRANSIT"},
  {label:"Awaiting dispatch",value:pad(stats.scheduled),chip:stats.departing_today+" depart today",info:"Scheduled, not yet collected",tone:"text-emerald-600",icon:PackageOpen,href:"/dashboard/warehouse"},
  {label:"Open exceptions",value:pad(stats.exceptions),chip:stats.exceptions?"Needs action":"All clear",info:"Shipments needing intervention",tone:stats.exceptions?"text-red-500":"text-emerald-600",icon:AlertTriangle,href:"/dashboard/shipments?status=EXCEPTION"},
  {label:"Delivered · 7 days",value:pad(stats.delivered_week),chip:(weekChange>=0?"↑ +":"↓ ")+weekChange+" vs prior week",info:"Proof of delivery recorded",tone:weekChange>=0?"text-emerald-600":"text-red-500",icon:CircleCheck,href:"/dashboard/shipments?status=DELIVERED"}
 ];
 const attention:{name:string;count:number;info:string;href:string;icon:LucideIcon}[]=[
  {name:"Shipment exceptions",count:stats.exceptions,info:"Resolve and update the customer",href:"/dashboard/shipments?status=EXCEPTION",icon:AlertTriangle},
  {name:"Quotations to review",count:stats.reviewing,info:"New and in-review requests",href:"/dashboard/quotes?status=REVIEWING",icon:ClipboardList},
  {name:"Bookings to dispatch",count:stats.pending_bookings,info:"Assign a driver and vehicle",href:"/dashboard/bookings?status=PENDING",icon:PackageCheck},
  {name:"Fleet compliance",count:expiries.length,info:"Expired or expiring within 30 days",href:"/dashboard/fleet",icon:ShieldAlert}
 ];
 const counts=Object.fromEntries(pipeline.map(p=>[p.status,p.total])),received=pipeline.reduce((a,p)=>a+p.total,0);
 const decided=(counts.ACCEPTED??0)+(counts.DECLINED??0)+(counts.EXPIRED??0),conversion=decided?Math.round((counts.ACCEPTED??0)/decided*100):null;
 const acceptedValue=Number(pipeline.find(p=>p.status==="ACCEPTED")?.amount_cents||0)/100;
 const fleetTotal=fleet.available+fleet.on_trip+fleet.pending+fleet.out_of_service;
 const fleetParts=[{name:"Available",value:fleet.available,color:"bg-emerald-500"},{name:"On a trip",value:fleet.on_trip,color:"bg-emerald-800"},{name:"Pending checks",value:fleet.pending,color:"bg-amber-400"},{name:"Out of service",value:fleet.out_of_service,color:"bg-zinc-300"}];
 const days=Array.from({length:14},(_,i)=>{const d=new Date(Date.parse(stats.today+"T00:00:00Z")-(13-i)*86400000),day=d.toISOString().slice(0,10);return {day,label:d.toLocaleDateString("en-ZA",{month:"short",day:"numeric",timeZone:"UTC"}),count:activity.find(x=>x.day===day)?.total??0};});
 return <main className="mx-auto max-w-[1740px] space-y-4 p-3 md:p-4">
  <OverviewStats title="Operations overview" updated={depotTime()} stats={overview}/>
  <section className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(17,26,21,.03),0_4px_16px_rgba(17,26,21,.025)] md:p-5">
   <SectionHead title="Shipments on the road" description="Live consignments by latest recorded milestone — exceptions first" href="/dashboard/shipments" action="All shipments"/>
   {moving.length?<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{moving.map(s=>{
    const exception=s.status==="EXCEPTION",step=Math.max(0,milestones.indexOf(exception?(s.last_milestone??"SCHEDULED"):s.status)),percent=Math.round(step/(milestones.length-1)*100);
    return <Link key={s.id} href={"/dashboard/shipments/"+s.id} className={"group min-w-0 overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(17,26,21,.18)] "+(exception?"border-red-200 hover:border-red-300":"border-border hover:border-emerald-200")}>
     <div className="relative h-36 overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50">
      <div className="absolute inset-y-3 right-3 w-[60%] [mask-image:linear-gradient(to_right,transparent,#000_28%)]"><VehicleThumbnail type={guessVehicleType(s.make_model)} className="size-full rounded-lg border-0"/></div>
      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[11.5px] font-medium shadow-xs"><span className={"size-1.5 rounded-full "+(exception?"bg-red-500":s.status==="OUT_FOR_DELIVERY"?"bg-emerald-500":"bg-amber-400")}/>{milestoneNames[s.status]}</span>
      <div className="absolute bottom-3 left-4 max-w-[52%]"><p className="truncate text-[16px] font-semibold tracking-tight">{s.vehicle_registration??"No vehicle"}</p><p className="mt-0.5 truncate text-[12px] text-muted-foreground">{s.tracking_number}</p></div>
     </div>
     <div className="grid grid-cols-2 gap-3 border-t border-border/70 px-4 pt-3 text-[12.5px]">
      <span className="flex min-w-0 items-center gap-1.5 font-medium" title={s.origin+" → "+s.destination}><MapPin className="size-3.5 shrink-0"/><span className="truncate">{place(s.origin)} → {place(s.destination)}</span></span>
      <span className="flex min-w-0 items-center gap-1.5 text-foreground/80"><UserRound className="size-3.5 shrink-0"/><span className="truncate">{s.driver_name??"Unassigned"}</span></span>
     </div>
     <div className="px-4 pb-4 pt-3"><div className="flex items-center justify-between text-[12px] text-muted-foreground"><span>Journey · {milestoneNames[milestones[step]]}</span><span className="flex items-center gap-1"><Clock className="size-3"/>{ago(s.last_event_at)}</span></div>
      <div className="mt-2 grid grid-cols-4 gap-1" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Journey progress">{milestones.slice(1).map((m,i)=><span key={m} className={"h-1.5 rounded-full "+(i<step?(exception?"bg-red-400":"bg-primary"):"bg-muted")}/>)}</div>
     </div>
    </Link>;})}</div>
   :<div className="mt-5 grid min-h-48 place-items-center rounded-xl border border-dashed text-center"><div><Truck className="mx-auto size-8 text-emerald-300"/><p className="mt-2 text-sm font-semibold">Nothing on the road right now</p><p className="mt-1 text-xs text-muted-foreground">Collected shipments appear here until delivery.</p></div></div>}
  </section>
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
   <Card className="gap-0 rounded-2xl py-0"><div className="px-5 pt-5"><h2 className="text-[15px] font-semibold">Needs attention</h2><p className="mt-0.5 text-[12px] text-muted-foreground">Work queues across the operation</p></div>
    <div className="p-2.5">{attention.map(a=><Link key={a.name} href={a.href} className="group flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-muted/60">
     <span className={"flex size-9 shrink-0 items-center justify-center rounded-lg "+(a.count?"bg-emerald-50 text-emerald-700":"bg-muted text-muted-foreground")}><a.icon className="size-4"/></span>
     <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium">{a.name}</span><span className="block truncate text-[11.5px] text-muted-foreground">{a.info}</span></span>
     <span className={"min-w-8 rounded-md px-2 py-0.5 text-center text-[12.5px] font-semibold tabular-nums "+(a.count?(a.name==="Shipment exceptions"?"bg-red-50 text-red-600":"bg-emerald-50 text-emerald-700"):"text-muted-foreground")}>{a.count}</span>
    </Link>)}</div>
   </Card>
   <Card className="gap-0 rounded-2xl py-0"><div className="flex items-center justify-between px-5 pt-5"><div><h2 className="text-[15px] font-semibold">Today&apos;s departures</h2><p className="mt-0.5 text-[12px] text-muted-foreground">Scheduled collections not yet picked up</p></div><Link href="/dashboard/warehouse" className="text-[12px] font-medium text-emerald-700 hover:underline">Warehouse</Link></div>
    <div className="p-2.5">{departures.length?departures.map(d=><Link key={d.shipment_id} href={"/dashboard/shipments/"+d.shipment_id} className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-muted/60">
     <span className="w-12 shrink-0 rounded-md bg-muted py-1 text-center text-[12px] font-semibold tabular-nums">{time(d.scheduled_departure)}</span>
     <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium">{d.vehicle_registration} · {d.driver_name}</span><span className="block truncate text-[11.5px] text-muted-foreground" title={d.destination}>To {place(d.destination)}</span></span>
    </Link>):<p className="flex items-center gap-2 px-2.5 py-4 text-[12.5px] text-muted-foreground"><CalendarClock className="size-4"/> No departures scheduled for today.</p>}</div>
   </Card>
   <Card className="gap-0 rounded-2xl py-0 md:col-span-2 xl:col-span-1"><div className="flex items-center justify-between px-5 pt-5"><div><h2 className="text-[15px] font-semibold">Fleet availability</h2><p className="mt-0.5 text-[12px] text-muted-foreground">{fleetTotal} registered vehicles</p></div><Link href="/dashboard/fleet" className="text-[12px] font-medium text-emerald-700 hover:underline">Manage fleet</Link></div>
    <div className="px-5 pt-5"><div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted">{fleetTotal?fleetParts.filter(p=>p.value).map(p=><span key={p.name} className={p.color} style={{width:p.value/fleetTotal*100+"%"}}/>):null}</div>
     <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 md:grid-cols-4 xl:grid-cols-2">{fleetParts.map(p=><div key={p.name} className="flex items-center gap-2 text-[12.5px]"><span className={"size-2 rounded-full "+p.color}/><span className="flex-1 text-foreground/80">{p.name}</span><span className="font-semibold tabular-nums">{p.value}</span></div>)}</div></div>
    <div className="mt-4 border-t border-border p-2.5">{expiries.length?expiries.map(e=><Link key={e.kind+e.id} href="/dashboard/fleet" className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/60"><ShieldAlert className={"size-4 shrink-0 "+(e.days<0?"text-red-500":"text-amber-500")}/><span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-medium">{e.name}</span><span className="block text-[11px] text-muted-foreground">{e.kind}</span></span><span className={"text-[11.5px] font-medium "+(e.days<0?"text-red-600":"text-amber-600")}>{e.days<0?"Expired":e.days===0?"Today":"In "+e.days+" d"}</span></Link>):<p className="flex items-center gap-2 px-2.5 py-3 text-[12.5px] text-muted-foreground"><CircleCheck className="size-4 text-emerald-500"/> No compliance dates due in 30 days.</p>}</div>
   </Card>
  </div>
  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
   <Card className="gap-0 rounded-2xl py-0"><div className="px-5 pt-5"><h2 className="text-[15px] font-semibold">Quotation pipeline</h2><p className="mt-0.5 text-[12px] text-muted-foreground">Requests received in the last 30 days, by current stage</p></div>
    <div className="space-y-3.5 px-5 py-5">{funnel.map(f=>{const n=counts[f.status]??0;return <Link key={f.status} href={"/dashboard/quotes?status="+f.status} className="group block"><div className="flex items-center justify-between text-[12.5px]"><span className="text-foreground/80 group-hover:text-foreground">{f.name}</span><span className="font-semibold tabular-nums">{n}</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{width:(received?Math.max(n?3:0,n/received*100):0)+"%"}}/></div></Link>;})}</div>
    <div className="grid grid-cols-2 border-t border-border"><div className="px-5 py-4"><p className="text-[11.5px] text-muted-foreground">Win rate (decided)</p><p className="mt-1 text-[20px] font-semibold tabular-nums">{conversion===null?"—":conversion+"%"}</p></div><div className="border-l border-border px-5 py-4"><p className="text-[11.5px] text-muted-foreground">Accepted quote value</p><p className="mt-1 text-[20px] font-semibold tabular-nums">{new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR",notation:"compact",maximumFractionDigits:1}).format(acceptedValue)}</p></div></div>
   </Card>
   <Card className="gap-0 rounded-2xl py-0"><div className="px-5 pt-5"><h2 className="text-[15px] font-semibold">Quote requests</h2><p className="mt-0.5 text-[12px] text-muted-foreground">New enquiries per day, last 14 days</p></div><div className="px-3 pb-3 pt-2"><QuoteActivityChart data={days}/></div></Card>
  </div>
 </main>;
}
