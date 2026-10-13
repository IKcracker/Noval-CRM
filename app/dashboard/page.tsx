import Link from "next/link";
import {redirect} from "next/navigation";
import {ArrowUpRight,CheckCircle2,Navigation,PackageCheck,TrendingUp,Truck} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardDescription,CardHeader} from "@/components/ui/card";
import {PremiumDeliveryBoard} from "@/components/admin/premium-delivery-board";
import {PremiumFleetSection,type FleetVehicle} from "@/components/admin/premium-fleet-section";
import {PremiumTrackingTable} from "@/components/admin/premium-tracking-table";
type Stats={shipments:number;moving:number;delivered:number;exceptions:number;reviewing:number;pending_bookings:number;fleet_attention:number;accepted_amount_cents:string;today:string};
type Freight={id:string;tracking_number:string;status:string;contact_name:string;origin:string;destination:string;booking_reference:string;driver_name:string|null;vehicle_registration:string|null;weight_kg:string|null;created_at:Date};
type Daily={day:string;total:number};
export default async function Dashboard(){
 if(!await isAdmin())redirect("/admin/login");
 let stats:Stats|undefined,deliveries:Freight[]=[],recent:Freight[]=[],fleet:FleetVehicle[]=[],activity:Daily[]=[],error="";
 try{
  const sql=db();
  const summaries=await sql`SELECT
   (SELECT count(*)::int FROM shipments) AS shipments,
   (SELECT count(*)::int FROM shipments WHERE status IN ('PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY')) AS moving,
   (SELECT count(*)::int FROM shipments WHERE status='DELIVERED') AS delivered,
   (SELECT count(*)::int FROM shipments WHERE status='EXCEPTION') AS exceptions,
   (SELECT count(*)::int FROM quote_requests WHERE status IN ('NEW','REVIEWING')) AS reviewing,
   (SELECT count(*)::int FROM bookings WHERE status='PENDING') AS pending_bookings,
   (SELECT count(*)::int FROM drivers WHERE status<>'VERIFIED' OR license_expiry<current_date) +
   (SELECT count(*)::int FROM vehicles WHERE status<>'VERIFIED' OR roadworthy_expiry<current_date) AS fleet_attention,
   (SELECT coalesce(sum(quoted_amount_cents),0)::text FROM quote_requests WHERE status='ACCEPTED') AS accepted_amount_cents,
   current_date::text AS today`;
  stats=summaries[0] as Stats;
  const consignments=await sql`SELECT s.id,s.tracking_number,s.status,q.contact_name,q.origin,q.destination,
   b.reference AS booking_reference,t.driver_name,t.vehicle_registration,q.weight_kg::text AS weight_kg,s.created_at
   FROM shipments s JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id
   LEFT JOIN trips t ON t.booking_id=b.id ORDER BY s.created_at DESC LIMIT 75` as Freight[];
  recent=consignments.slice(0,8);
  deliveries=consignments.filter(x=>!['DELIVERED','CANCELLED','RETURNED'].includes(x.status))
   .sort((a,b)=>Number(b.status==='EXCEPTION')-Number(a.status==='EXCEPTION')).slice(0,10);
  fleet=await sql`SELECT v.id,v.registration,v.make_model,v.capacity_kg::text,v.status,
   (SELECT t.reference FROM trips t WHERE t.vehicle_id=v.id AND t.status IN ('CONFIRMED','IN_TRANSIT')
    ORDER BY t.scheduled_departure DESC LIMIT 1) AS active_trip
   FROM vehicles v ORDER BY v.created_at DESC LIMIT 6` as FleetVehicle[];
  activity=await sql`SELECT date_trunc('day',created_at)::date::text AS day,count(*)::int AS total
   FROM quote_requests WHERE created_at>=current_date-interval '13 days' GROUP BY 1 ORDER BY 1` as Daily[];
 }catch{error="Operational data is unavailable. Check your Neon connection and apply pending migrations.";}
 const completed=stats?.shipments?Math.round(stats.delivered/stats.shipments*100):0;
 const acceptedValue=Number(stats?.accepted_amount_cents||"0")/100;
 const quoteAmount=new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR",notation:"compact",maximumFractionDigits:1}).format(acceptedValue);
 const days=Array.from({length:14},(_,i)=>{const d=new Date(Date.parse((stats?.today||"1970-01-01")+"T00:00:00Z")-(13-i)*86400000),day=d.toISOString().slice(0,10);return {day,label:d.toLocaleDateString("en-ZA",{month:"short",day:"numeric",timeZone:"UTC"}),count:activity.find(x=>x.day===day)?.total??0};});
 const cards=[
  {label:"Total shipments",value:(stats?.shipments??0).toLocaleString("en-ZA"),info:"All consignments",icon:PackageCheck,href:"/dashboard/shipments",style:"bg-blue-50 text-blue-600"},
  {label:"On the road",value:(stats?.moving??0).toLocaleString("en-ZA"),info:"Collected and in transit",icon:Truck,href:"/dashboard/shipments?status=IN_TRANSIT",style:"bg-teal-50 text-teal-600"},
  {label:"Accepted quote value",value:quoteAmount,info:"Quoted, not received revenue",icon:TrendingUp,href:"/dashboard/quotes?status=ACCEPTED",style:"bg-indigo-50 text-indigo-600"},
  {label:"Delivered",value:(stats?.delivered??0).toLocaleString("en-ZA"),info:completed+"% of all shipments",icon:CheckCircle2,href:"/dashboard/shipments?status=DELIVERED",style:"bg-emerald-50 text-emerald-600"}
 ];
 return <main className="mx-auto max-w-[1740px] space-y-5 p-4 md:p-6 xl:p-8">
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div><p className="text-[11px] font-semibold uppercase tracking-[.13em] text-muted-foreground">LOGISTICS / CONTROL CENTER</p><h1 className="mt-1.5 text-[27px] font-semibold tracking-tight md:text-[31px]">Operations dashboard</h1><p className="mt-1 text-[13px] text-muted-foreground">Everything moving through Noval Logistics, in one workspace.</p></div>
 <div className="flex items-center gap-2"><Badge variant="outline" className="h-8 gap-1.5 rounded-lg bg-white px-3 text-[11px]"><span className="size-1.5 rounded-full bg-emerald-500"/> Operational records</Badge><Button variant="outline" render={<Link href="/dashboard/routes"/>}><Navigation className="size-4"/> Route planner</Button></div></div>
 {error?<Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card>:<>
 <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Logistics overview">{cards.map(s=><Link href={s.href} className="group min-w-0" key={s.label}><Card className="h-full rounded-xl transition-all hover:-translate-y-0.5 hover:ring-blue-200 hover:shadow-md"><CardHeader className="flex flex-row items-center justify-between gap-3 pb-0"><CardDescription className="text-xs font-medium">{s.label}</CardDescription><span className={"flex size-9 items-center justify-center rounded-lg "+s.style}><s.icon className="size-4"/></span></CardHeader><CardContent><p className="text-[30px] font-semibold tracking-tight tabular-nums">{s.value}</p><div className="mt-2 flex items-center justify-between"><span className="text-[11px] text-muted-foreground">{s.info}</span><ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></div></CardContent></Card></Link>)}</div>
 <PremiumDeliveryBoard shipments={deliveries.map(s=>({id:s.id,tracking_number:s.tracking_number,status:s.status,contact_name:s.contact_name,origin:s.origin,destination:s.destination,booking_reference:s.booking_reference,driver_name:s.driver_name,vehicle_registration:s.vehicle_registration,weight_kg:s.weight_kg}))}/>
 <PremiumTrackingTable shipments={recent}/>
 <PremiumFleetSection vehicles={fleet} queue={{reviewing:stats?.reviewing??0,pending_bookings:stats?.pending_bookings??0,exceptions:stats?.exceptions??0,fleet_attention:stats?.fleet_attention??0}} dates={days}/>
 </>}
 </main>;
}
