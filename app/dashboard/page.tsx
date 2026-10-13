import Link from "next/link";
import {redirect} from "next/navigation";
import {ArrowUpRight,ClipboardList,CheckCheck,Truck,ChartNoAxesColumnIncreasing} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import {QuoteActivityChart} from "@/components/admin/quote-activity-chart";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
type Metrics={quotes:string;new_quotes:string;accepted:string;bookings:string;confirmed:string;shipments:string;today:string};
type Daily={day:string;total:number};
type LatestQuote={id:string;reference:string;contact_name:string;origin:string;destination:string;status:string;created_at:Date};
export default async function Dashboard(){
 if(!await isAdmin())redirect("/admin/login");
 let metrics:Metrics|undefined,activity:Daily[]=[],recent:LatestQuote[]=[],error="";
 try{
 const sql=db();
 const rows=await sql`SELECT (SELECT count(*) FROM quote_requests)::text AS quotes,(SELECT count(*) FROM quote_requests WHERE status='NEW')::text AS new_quotes,(SELECT count(*) FROM quote_requests WHERE status='ACCEPTED')::text AS accepted,(SELECT count(*) FROM bookings)::text AS bookings,(SELECT count(*) FROM bookings WHERE status='CONFIRMED')::text AS confirmed,(SELECT count(*) FROM shipments)::text AS shipments,current_date::text AS today`;
 metrics=rows[0] as Metrics;
 recent=await sql`SELECT id,reference,contact_name,origin,destination,status,created_at FROM quote_requests ORDER BY created_at DESC LIMIT 7` as LatestQuote[];
 activity=await sql`SELECT date_trunc('day',created_at)::date::text AS day,count(*)::int AS total FROM quote_requests WHERE created_at>=current_date-interval '6 days' GROUP BY 1 ORDER BY 1` as Daily[];
 }catch{error="Operational analytics are unavailable until database migrations 001 and 002 are applied.";}
 const entries=Array.from({length:7},(_,i)=>{const d=new Date(Date.parse((metrics?.today||"1970-01-01")+"T00:00:00Z")-(6-i)*86400000);const date=d.toISOString().slice(0,10);return {day:date,label:d.toLocaleDateString("en-ZA",{weekday:"short",timeZone:"UTC"}),count:activity.find(a=>a.day===date)?.total??0};});
 const stats=[
 {label:"Total enquiries",value:metrics?.quotes??"0",icon:ClipboardList},
 {label:"Awaiting review",value:metrics?.new_quotes??"0",icon:ChartNoAxesColumnIncreasing},
 {label:"Accepted quotes",value:metrics?.accepted??"0",icon:CheckCheck},
 {label:"Confirmed bookings",value:metrics?.confirmed??"0",icon:Truck},
 ];
 
 return <main className="space-y-6 p-4 md:p-7 xl:p-9">
  <div className="flex flex-wrap items-end justify-between gap-5"><div><Badge variant="secondary" className="mb-3">Operations workspace</Badge><h1 className="text-3xl font-semibold tracking-tight">Operations overview</h1><p className="mt-2 text-sm text-muted-foreground">Shipping activity, enquiries and dispatch performance.</p></div><Button size="lg" render={<Link href="/dashboard/quotes"/>}>Open quotation inbox <ArrowUpRight className="size-4"/></Button></div>
  {error?<Card><CardContent className="text-sm text-destructive">{error}</CardContent></Card>:<>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({label,value,icon:Icon})=><Card key={label}><CardHeader><CardDescription className="flex items-center justify-between">{label}<Icon className="size-4 text-muted-foreground"/></CardDescription></CardHeader><CardContent><p className="text-4xl font-bold tracking-tight tabular-nums">{value}</p><p className="mt-2 text-xs text-muted-foreground">Live database count</p></CardContent></Card>)}</div>
  <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
   <Card><CardHeader><CardTitle>Quote request activity</CardTitle><CardDescription>Enquiries submitted over the past 7 days</CardDescription></CardHeader><CardContent><QuoteActivityChart data={entries}/></CardContent></Card>
   <Card><CardHeader><CardTitle>Dispatch pipeline</CardTitle><CardDescription>Current booking and shipment volumes</CardDescription></CardHeader><CardContent className="space-y-5">{[["Accepted quotations",metrics?.accepted],["Total bookings",metrics?.bookings],["Confirmed trips",metrics?.confirmed],["Scheduled shipments",metrics?.shipments]].map(([label,value])=><div className="flex items-center justify-between border-b border-border py-2 last:border-0" key={label}><span className="text-sm text-muted-foreground">{label}</span><span className="text-2xl font-bold tabular-nums">{value??"0"}</span></div>)}</CardContent></Card>
  </div></>}
  <Card className="min-w-0 overflow-hidden"><CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b"><div><CardTitle>Recent quote requests</CardTitle><CardDescription>Latest customer enquiries from the live CRM</CardDescription></div><Button size="sm" variant="outline" render={<Link href="/dashboard/quotes"/>}>View all <ArrowUpRight className="size-4"/></Button></CardHeader><CardContent className="overflow-x-auto p-0"><Table><TableHeader><TableRow>{["Reference","Customer","Route","Status",""].map(x=><TableHead className="px-5" key={x}>{x}</TableHead>)}</TableRow></TableHeader><TableBody>{recent.length?recent.map(q=><TableRow key={q.id}><TableCell className="px-5 font-semibold">{q.reference}</TableCell><TableCell>{q.contact_name}</TableCell><TableCell className="max-w-56 truncate">{q.origin} → {q.destination}</TableCell><TableCell><Badge variant={q.status==="ACCEPTED"?"default":"secondary"}>{q.status.replaceAll("_"," ")}</Badge></TableCell><TableCell className="px-5 text-right"><Button size="sm" variant="ghost" render={<Link href={"/dashboard/quotes/"+q.id}/>}>Open <ArrowUpRight className="size-3.5"/></Button></TableCell></TableRow>):<TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">No quote requests yet.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
 </main>;
}
