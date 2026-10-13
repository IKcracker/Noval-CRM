import Link from "next/link";
import {redirect} from "next/navigation";
import {ArrowUpRight,ClipboardList,CheckCheck,Truck,Package,ChartNoAxesColumnIncreasing} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import {QuoteActivityChart} from "@/components/admin/quote-activity-chart";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
type Metrics={quotes:string;new_quotes:string;accepted:string;bookings:string;confirmed:string;shipments:string;today:string};
type Daily={day:string;total:number};
export default async function Dashboard(){
 if(!await isAdmin())redirect("/admin/login");
 let metrics:Metrics|undefined,activity:Daily[]=[],error="";
 try{
 const sql=db();
 const rows=await sql`SELECT (SELECT count(*) FROM quote_requests)::text AS quotes,(SELECT count(*) FROM quote_requests WHERE status='NEW')::text AS new_quotes,(SELECT count(*) FROM quote_requests WHERE status='ACCEPTED')::text AS accepted,(SELECT count(*) FROM bookings)::text AS bookings,(SELECT count(*) FROM bookings WHERE status='CONFIRMED')::text AS confirmed,(SELECT count(*) FROM shipments)::text AS shipments,current_date::text AS today`;
 metrics=rows[0] as Metrics;
 activity=await sql`SELECT date_trunc('day',created_at)::date::text AS day,count(*)::int AS total FROM quote_requests WHERE created_at>=current_date-interval '6 days' GROUP BY 1 ORDER BY 1` as Daily[];
 }catch{error="Operational analytics are unavailable until database migrations 001 and 002 are applied.";}
 const entries=Array.from({length:7},(_,i)=>{const d=new Date(Date.parse((metrics?.today||"1970-01-01")+"T00:00:00Z")-(6-i)*86400000);const date=d.toISOString().slice(0,10);return {day:date,label:d.toLocaleDateString("en-ZA",{weekday:"short",timeZone:"UTC"}),count:activity.find(a=>a.day===date)?.total??0};});
 const stats=[
 {label:"Total enquiries",value:metrics?.quotes??"0",icon:ClipboardList},
 {label:"Awaiting review",value:metrics?.new_quotes??"0",icon:ChartNoAxesColumnIncreasing},
 {label:"Accepted quotes",value:metrics?.accepted??"0",icon:CheckCheck},
 {label:"Confirmed bookings",value:metrics?.confirmed??"0",icon:Truck},
 ];
 const modules=[["Quote requests","Review enquiries, set prices and record customer approvals","/dashboard/quotes"],["Bookings & dispatch","Schedule a driver, assign a vehicle and confirm transport","/dashboard/bookings"]];
 return <main className="space-y-7 p-5 md:p-8 xl:p-10">
  <div className="flex flex-wrap items-end justify-between gap-5"><div><Badge variant="secondary" className="mb-3">Operations workspace</Badge><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Operations overview</h1><p className="mt-2 text-sm text-muted-foreground">Shipping activity, enquiries and dispatch performance.</p></div><Button size="lg" render={<Link href="/dashboard/quotes"/>}>Open quotation inbox <ArrowUpRight className="size-4"/></Button></div>
  {error?<Card><CardContent className="text-sm text-destructive">{error}</CardContent></Card>:<>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({label,value,icon:Icon})=><Card key={label}><CardHeader><CardDescription className="flex items-center justify-between">{label}<Icon className="size-4 text-muted-foreground"/></CardDescription></CardHeader><CardContent><p className="text-4xl font-bold tracking-tight tabular-nums">{value}</p><p className="mt-2 text-xs text-muted-foreground">Live database count</p></CardContent></Card>)}</div>
  <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
   <Card><CardHeader><CardTitle>Quote request activity</CardTitle><CardDescription>Enquiries submitted over the past 7 days</CardDescription></CardHeader><CardContent><QuoteActivityChart data={entries}/></CardContent></Card>
   <Card><CardHeader><CardTitle>Dispatch pipeline</CardTitle><CardDescription>Current booking and shipment volumes</CardDescription></CardHeader><CardContent className="space-y-5">{[["Accepted quotations",metrics?.accepted],["Total bookings",metrics?.bookings],["Confirmed trips",metrics?.confirmed],["Scheduled shipments",metrics?.shipments]].map(([label,value])=><div className="flex items-center justify-between border-b border-border py-2 last:border-0" key={label}><span className="text-sm text-muted-foreground">{label}</span><span className="text-2xl font-bold tabular-nums">{value??"0"}</span></div>)}</CardContent></Card>
  </div></>}
  <div><h2 className="mb-4 text-xl font-semibold">Workspaces</h2><div className="grid gap-4 md:grid-cols-2">{modules.map(([title,description,href])=><Link href={href} key={title} className="group"><Card className="h-full transition-shadow hover:shadow-md"><CardHeader><CardTitle className="flex items-center justify-between">{title}<ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5"/></CardTitle><CardDescription>{description}</CardDescription></CardHeader></Card></Link>)}</div></div>
  <p className="flex items-center gap-2 text-xs text-muted-foreground"><Package className="size-4"/> Route maps and live tracking require separate GPS and routing integrations.</p>
 </main>;
}
