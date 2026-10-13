import Link from "next/link";
import {redirect} from "next/navigation";
import {ArrowUpRight,AlertTriangle,PackageCheck,Truck,CheckCircle2} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {parseOperationsQuery,countPages,type RawListParams} from "@/lib/operations-query";
import {OperationsRegister,type OperationsRow} from "@/components/admin/operations-register";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
const PAGE_SIZE=20;
type Stats={total:number;moving:number;exceptions:number;delivered:number};
type ShipmentRow=Omit<OperationsRow,"created_at">&{created_at:Date|string};
export default async function Shipments({searchParams}:{searchParams:Promise<RawListParams>}){
 if(!await isAdmin())redirect("/admin/login");
 const filters=parseOperationsQuery(await searchParams,["ALL","SCHEDULED","PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY","EXCEPTION","DELIVERED","RETURNED","CANCELLED"]);
 let records:ShipmentRow[]=[],stats:Stats={total:0,moving:0,exceptions:0,delivered:0},matched=0,page=1,pages=1,error="";
 try{
  const sql=db();
  const summary=await sql`SELECT count(*)::int AS total,
   count(*) FILTER (WHERE status IN ('PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY'))::int AS moving,
   count(*) FILTER (WHERE status='EXCEPTION')::int AS exceptions,
   count(*) FILTER (WHERE status='DELIVERED')::int AS delivered
   FROM shipments`;
  stats=summary[0] as Stats;
  const counting=await sql`SELECT count(*)::int AS total FROM shipments s
   JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id
   WHERE (${filters.status}='ALL' OR s.status=${filters.status})
   AND (${filters.q}='' OR s.tracking_number ILIKE ${filters.pattern}
   OR b.reference ILIKE ${filters.pattern} OR q.contact_name ILIKE ${filters.pattern}
   OR q.origin ILIKE ${filters.pattern} OR q.destination ILIKE ${filters.pattern}
   OR coalesce(q.company,'') ILIKE ${filters.pattern})`;
  matched=Number(counting[0].total);
  pages=countPages(matched,PAGE_SIZE);page=Math.min(filters.requestedPage,pages);
  const offset=(page-1)*PAGE_SIZE;
  records=await sql`SELECT s.id,s.tracking_number AS reference,q.contact_name AS customer,q.company,
    q.origin,q.destination,b.reference AS related_reference,s.status,s.created_at
    FROM shipments s JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id
    WHERE (${filters.status}='ALL' OR s.status=${filters.status})
    AND (${filters.q}='' OR s.tracking_number ILIKE ${filters.pattern}
    OR b.reference ILIKE ${filters.pattern} OR q.contact_name ILIKE ${filters.pattern}
    OR q.origin ILIKE ${filters.pattern} OR q.destination ILIKE ${filters.pattern}
    OR coalesce(q.company,'') ILIKE ${filters.pattern})
    ORDER BY CASE WHEN ${filters.sort}='oldest' THEN s.created_at END ASC,
     CASE WHEN ${filters.sort}='customer' THEN lower(q.contact_name) END ASC,
     CASE WHEN ${filters.sort}='status' THEN s.status END ASC,
     CASE WHEN ${filters.sort}='newest' THEN s.created_at END DESC,s.created_at DESC,s.id DESC
    LIMIT ${PAGE_SIZE} OFFSET ${offset}` as ShipmentRow[];
 }catch{error="Unable to retrieve shipments. Verify Neon and migration 003.";}
 return <main className="mx-auto max-w-[1680px] space-y-5 p-4 md:p-7 lg:p-8">
  <header className="flex flex-wrap items-end justify-between gap-4"><div className="space-y-1"><Badge variant="secondary">Transport / Consignments</Badge><h1 className="text-3xl font-semibold tracking-tight">Shipment operations</h1><p className="text-sm text-muted-foreground">Monitor your full shipment register, delivery status and operational exceptions.</p></div><Button variant="outline" render={<Link href="/dashboard/routes"/>}>Route planning <ArrowUpRight className="size-4"/></Button></header>
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Shipment metrics">{[
   {label:"Total shipments",value:stats.total,icon:PackageCheck},
   {label:"In movement",value:stats.moving,icon:Truck},
   {label:"Exceptions",value:stats.exceptions,icon:AlertTriangle},
   {label:"Delivered",value:stats.delivered,icon:CheckCircle2}
  ].map(({label,value,icon:Icon})=><Card key={label}><CardHeader className="flex flex-row items-center justify-between pb-0"><CardDescription>{label}</CardDescription><Icon className="size-4 text-muted-foreground"/></CardHeader><CardContent><p className="text-3xl font-semibold tabular-nums">{value}</p></CardContent></Card>)}</section>
  <Card className="min-w-0 overflow-hidden"><CardHeader className="border-b"><CardTitle>Consignment register</CardTitle><CardDescription>Search, filter, export selected records and open individual shipments for milestone updates.</CardDescription></CardHeader><CardContent className="p-0">{error?<p role="alert" className="p-7 text-sm text-destructive">{error}</p>:<OperationsRegister kind="shipments" records={records.map(s=>({...s,created_at:new Date(s.created_at).toISOString()}))} total={matched} page={page} pages={pages} pageSize={PAGE_SIZE} query={filters.q} status={filters.status} sort={filters.sort}/>}</CardContent></Card>
 </main>;
}
