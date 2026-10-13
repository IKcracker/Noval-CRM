import Link from "next/link";
import {redirect} from "next/navigation";
import {ArrowUpRight,AlertTriangle,CalendarClock,ClipboardList,PackageCheck,Truck,MapPinned,Users,ChevronRight} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";
import {QuoteActivityChart} from "@/components/admin/quote-activity-chart";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
type Metrics={quotes:number;new_quotes:number;reviewing:number;awaiting_price:number;accepted:number;bookings:number;pending_bookings:number;active_shipments:number;exceptions:number;delivered:number;fleet_attention:number;today:string};
type Daily={day:string;total:number};
type Quote={id:string;reference:string;contact_name:string;company:string|null;origin:string;destination:string;status:string;created_at:Date};
type Shipment={id:string;tracking_number:string;status:string;origin:string;destination:string;contact_name:string;created_at:Date};
export default async function Dashboard(){
 if(!await isAdmin())redirect("/admin/login");
 let metrics:Metrics|undefined,activity:Daily[]=[],quotes:Quote[]=[],shipments:Shipment[]=[],error="";
 try{
  const sql=db();
  const rows=await sql`SELECT
    (SELECT count(*)::int FROM quote_requests) quotes,
    (SELECT count(*)::int FROM quote_requests WHERE status='NEW') new_quotes,
    (SELECT count(*)::int FROM quote_requests WHERE status='REVIEWING') reviewing,
    (SELECT count(*)::int FROM quote_requests WHERE status IN ('NEW','REVIEWING')) awaiting_price,
    (SELECT count(*)::int FROM quote_requests WHERE status='ACCEPTED') accepted,
    (SELECT count(*)::int FROM bookings) bookings,
    (SELECT count(*)::int FROM bookings WHERE status='PENDING') pending_bookings,
    (SELECT count(*)::int FROM shipments WHERE status NOT IN ('DELIVERED','CANCELLED','RETURNED')) active_shipments,
    (SELECT count(*)::int FROM shipments WHERE status='EXCEPTION') exceptions,
    (SELECT count(*)::int FROM shipments WHERE status='DELIVERED') delivered,
    (SELECT count(*)::int FROM drivers WHERE status <> 'VERIFIED' OR license_expiry < current_date) + (SELECT count(*)::int FROM vehicles WHERE status <> 'VERIFIED' OR roadworthy_expiry < current_date) fleet_attention,
    current_date::text today`;
  metrics=rows[0] as Metrics;
  activity=await sql`SELECT date_trunc('day',created_at)::date::text day,count(*)::int total FROM quote_requests WHERE created_at>=current_date-interval '13 days' GROUP BY 1 ORDER BY 1` as Daily[];
  quotes=await sql`SELECT id,reference,contact_name,company,origin,destination,status,created_at FROM quote_requests WHERE status IN ('NEW','REVIEWING','PRICED','SENT') ORDER BY CASE status WHEN 'NEW' THEN 0 WHEN 'REVIEWING' THEN 1 ELSE 2 END, created_at ASC LIMIT 8` as Quote[];
  shipments=await sql`SELECT s.id,s.tracking_number,s.status,q.origin,q.destination,q.contact_name,s.created_at FROM shipments s JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id WHERE s.status IN ('EXCEPTION','IN_TRANSIT','OUT_FOR_DELIVERY','PICKED_UP') ORDER BY CASE WHEN s.status='EXCEPTION' THEN 0 ELSE 1 END,s.created_at DESC LIMIT 6` as Shipment[];
 }catch{error="Operational records could not be loaded. Verify Neon connectivity and apply the latest database migrations.";}
 const dates=Array.from({length:14},(_,i)=>{const d=new Date(Date.parse((metrics?.today||"1970-01-01")+"T00:00:00Z")-(13-i)*86400000);const day=d.toISOString().slice(0,10);return {day,label:d.toLocaleDateString("en-ZA",{day:"numeric",month:"short",timeZone:"UTC"}),count:activity.find(a=>a.day===day)?.total??0};});
 const kpis=[
  {title:"Enquiries",value:metrics?.quotes??0,detail:"All quote requests",icon:ClipboardList,href:"/dashboard/quotes"},
  {title:"Needs quotation",value:metrics?.awaiting_price??0,detail:"Unpriced / under review",icon:CalendarClock,href:"/dashboard/quotes"},
  {title:"Pending dispatch",value:metrics?.pending_bookings??0,detail:"Bookings awaiting assignment",icon:Truck,href:"/dashboard/bookings"},
  {title:"Active shipments",value:metrics?.active_shipments??0,detail:"Not yet closed",icon:PackageCheck,href:"/dashboard/shipments"}
 ];
 const modules=[{name:"Quotation inbox",description:"Review incoming freight requests",href:"/dashboard/quotes",icon:ClipboardList},{name:"Dispatch board",description:"Assign trucks and drivers",href:"/dashboard/bookings",icon:Truck},{name:"Shipment monitor",description:"Manage delivery milestones",href:"/dashboard/shipments",icon:PackageCheck},{name:"Route planning",description:"Plan road journeys",href:"/dashboard/routes",icon:MapPinned},{name:"Fleet compliance",description:"Review resources and expiry",href:"/dashboard/fleet",icon:Users}];
 return <main className="mx-auto max-w-[1680px] space-y-6 p-4 md:p-7 lg:p-8">
 <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6"><div className="space-y-1"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground"><span className="size-1.5 rounded-full bg-emerald-500"/> Operations / Command center</div><h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Good day, Operations</h1><p className="text-sm text-muted-foreground">Live dispatch workload, exceptions and customer quotation activity.</p></div><div className="flex items-center gap-2"><Badge variant="outline">Neon operational data</Badge><Button render={<Link href="/dashboard/quotes"/>}>Open work queue <ArrowUpRight className="size-4"/></Button></div></div>
 {error?<Card><CardContent className="py-8 text-sm text-destructive">{error}</CardContent></Card>:<>
 <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Operational metrics">{kpis.map(({title,value,detail,icon:Icon,href})=><Link href={href} key={title}><Card className="group h-full transition-colors hover:border-primary/35 hover:bg-accent/25"><CardHeader className="flex flex-row items-start justify-between gap-3 pb-0"><CardDescription>{title}</CardDescription><Icon className="size-4 text-muted-foreground"/></CardHeader><CardContent><div className="mt-3 flex items-end justify-between"><div><p className="text-3xl font-semibold tracking-tight tabular-nums">{value.toLocaleString("en-ZA")}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></div></CardContent></Card></Link>)}</section>
 <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,1fr)]">
 <Card className="min-w-0"><CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3"><div><CardTitle>Enquiry volume</CardTitle><CardDescription>Daily quote submissions, past 14 days</CardDescription></div><Badge variant="secondary">Last 14 days</Badge></CardHeader><CardContent><QuoteActivityChart data={dates}/></CardContent></Card>
 <Card><CardHeader><CardTitle className="flex items-center justify-between">Attention required <AlertTriangle className="size-4 text-amber-600"/></CardTitle><CardDescription>Prioritized queues that need intervention</CardDescription></CardHeader><CardContent className="space-y-2">{[
 {label:"Shipment exceptions",value:metrics?.exceptions??0,href:"/dashboard/shipments",tone:"text-destructive"},
 {label:"Unassigned bookings",value:metrics?.pending_bookings??0,href:"/dashboard/bookings",tone:"text-foreground"},
 {label:"New quote requests",value:metrics?.new_quotes??0,href:"/dashboard/quotes",tone:"text-foreground"},
 {label:"Fleet requiring review",value:metrics?.fleet_attention??0,href:"/dashboard/fleet",tone:"text-foreground"}
 ].map(x=><Link href={x.href} key={x.label} className="flex items-center justify-between rounded-md border px-4 py-3 transition-colors hover:bg-accent"><span className="text-sm font-medium">{x.label}</span><span className="flex items-center gap-2"><span className={"text-lg font-semibold tabular-nums "+x.tone}>{x.value}</span><ChevronRight className="size-4 text-muted-foreground"/></span></Link>)}</CardContent></Card>
 </div>
 <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,1fr)]">
 <Card className="min-w-0 overflow-hidden"><CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b"><div><CardTitle>Quotation work queue</CardTitle><CardDescription>Open enquiries ordered by operational priority</CardDescription></div><Button size="sm" variant="outline" render={<Link href="/dashboard/quotes"/>}>Full pipeline <ArrowUpRight className="size-4"/></Button></CardHeader><CardContent className="overflow-x-auto p-0"><Table><TableHeader><TableRow>{["Reference","Customer","Journey","Status",""].map(x=><TableHead className="px-4" key={x}>{x}</TableHead>)}</TableRow></TableHeader><TableBody>{quotes.length?quotes.map(q=><TableRow key={q.id}><TableCell className="px-4 font-semibold">{q.reference}</TableCell><TableCell><span className="block font-medium">{q.contact_name}</span><span className="block max-w-36 truncate text-xs text-muted-foreground">{q.company||"Individual"}</span></TableCell><TableCell className="max-w-48 truncate text-muted-foreground">{q.origin} → {q.destination}</TableCell><TableCell><Badge variant={q.status==="NEW"?"default":"secondary"}>{q.status.replaceAll("_"," ")}</Badge></TableCell><TableCell className="px-4"><Button size="sm" variant="ghost" render={<Link href={"/dashboard/quotes/"+q.id}/>}>Open <ArrowUpRight className="size-3.5"/></Button></TableCell></TableRow>):<TableRow><TableCell className="h-36 text-center text-muted-foreground" colSpan={5}>Your quotation queue is clear.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
 <Card><CardHeader className="border-b"><CardTitle>Shipment watchlist</CardTitle><CardDescription>Exceptions and shipments currently moving</CardDescription></CardHeader><CardContent className="space-y-1 pt-3">{shipments.length?shipments.map(s=><Link href={"/dashboard/shipments/"+s.id} key={s.id} className="block rounded-lg px-2 py-3 transition-colors hover:bg-accent"><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{s.tracking_number}</span><Badge variant={s.status==="EXCEPTION"?"destructive":"outline"}>{s.status.replaceAll("_"," ")}</Badge></div><p className="mt-1 truncate text-xs text-muted-foreground">{s.contact_name} · {s.origin} → {s.destination}</p></Link>):<p className="py-12 text-center text-sm text-muted-foreground">No active shipment alerts.</p>}</CardContent></Card>
 </div>
 </>}
 <section className="space-y-3"><h2 className="text-sm font-semibold tracking-tight">Operations workspaces</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{modules.map(x=><Link key={x.href} href={x.href} className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/25 hover:bg-accent/30"><x.icon className="mt-0.5 size-4 shrink-0 text-primary"/><span className="min-w-0"><span className="block text-sm font-semibold">{x.name}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{x.description}</span></span></Link>)}</div></section>
 </main>;
}
