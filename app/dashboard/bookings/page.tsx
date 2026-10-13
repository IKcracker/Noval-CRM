import Link from "next/link";
import {redirect} from "next/navigation";
import {ArrowUpRight,CalendarClock,CheckCircle2,ClipboardList,Truck} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {parseOperationsQuery,countPages,type RawListParams} from "@/lib/operations-query";
import {OperationsRegister,type OperationsRow} from "@/components/admin/operations-register";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
const PAGE_SIZE=20;
type Stats={total:number;pending:number;confirmed:number;cancelled:number};
type BookingRow=Omit<OperationsRow,"created_at">&{created_at:Date|string};
export default async function Bookings({searchParams}:{searchParams:Promise<RawListParams>}){
 if(!await isAdmin())redirect("/admin/login");
 const filters=parseOperationsQuery(await searchParams,["ALL","PENDING","CONFIRMED","CANCELLED"]);
 let rows:BookingRow[]=[],stats:Stats={total:0,pending:0,confirmed:0,cancelled:0},matched=0,error="";
 let page=1,pages=1;
 try {
  const sql=db();
  const summary=await sql`SELECT count(*)::int AS total,
    count(*) FILTER (WHERE status='PENDING')::int AS pending,
    count(*) FILTER (WHERE status='CONFIRMED')::int AS confirmed,
    count(*) FILTER (WHERE status='CANCELLED')::int AS cancelled
    FROM bookings`;
  stats=summary[0] as Stats;
  const counting=await sql`SELECT count(*)::int AS total FROM bookings b
    JOIN quote_requests q ON q.id=b.quote_id
    WHERE (${filters.status}='ALL' OR b.status=${filters.status})
    AND (${filters.q}='' OR b.reference ILIKE ${filters.pattern}
      OR q.contact_name ILIKE ${filters.pattern} OR q.reference ILIKE ${filters.pattern}
      OR q.origin ILIKE ${filters.pattern} OR q.destination ILIKE ${filters.pattern}
      OR coalesce(q.company,'') ILIKE ${filters.pattern})`;
  matched=Number(counting[0].total);
  pages=countPages(matched,PAGE_SIZE);
  page=Math.min(filters.requestedPage,pages);
  const offset=(page-1)*PAGE_SIZE;
  rows=await sql`SELECT b.id,b.reference,q.contact_name AS customer,q.company,
    q.origin,q.destination,q.reference AS related_reference,b.status,b.created_at
    FROM bookings b JOIN quote_requests q ON q.id=b.quote_id
    WHERE (${filters.status}='ALL' OR b.status=${filters.status})
    AND (${filters.q}='' OR b.reference ILIKE ${filters.pattern}
      OR q.contact_name ILIKE ${filters.pattern} OR q.reference ILIKE ${filters.pattern}
      OR q.origin ILIKE ${filters.pattern} OR q.destination ILIKE ${filters.pattern}
      OR coalesce(q.company,'') ILIKE ${filters.pattern})
    ORDER BY CASE WHEN ${filters.sort}='oldest' THEN b.created_at END ASC,
      CASE WHEN ${filters.sort}='customer' THEN lower(q.contact_name) END ASC,
      CASE WHEN ${filters.sort}='status' THEN b.status END ASC,
      CASE WHEN ${filters.sort}='newest' THEN b.created_at END DESC,b.created_at DESC,b.id DESC
    LIMIT ${PAGE_SIZE} OFFSET ${offset}` as BookingRow[];
 }catch{error="Bookings could not be loaded. Check Neon connectivity and database migrations.";}
 return <main className="mx-auto max-w-[1680px] space-y-5 p-4 md:p-7 lg:p-8">
  <header className="flex flex-wrap items-end justify-between gap-4"><div className="space-y-1"><Badge variant="secondary">Dispatch / Bookings</Badge><h1 className="text-3xl font-semibold tracking-tight">Bookings & dispatch</h1><p className="text-sm text-muted-foreground">A complete, searchable register of accepted orders and their dispatch status.</p></div>
  <Button nativeButton={false} variant="outline" render={<Link href="/dashboard/quotes"/>}><ClipboardList className="size-4"/> Quote pipeline <ArrowUpRight className="size-4"/></Button></header>
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Booking metrics">{[
   {label:"All bookings",value:stats.total,icon:Truck},
   {label:"Awaiting dispatch",value:stats.pending,icon:CalendarClock},
   {label:"Confirmed",value:stats.confirmed,icon:CheckCircle2},
   {label:"Cancelled",value:stats.cancelled,icon:ClipboardList}
  ].map(({label,value,icon:Icon})=><Card key={label}><CardHeader className="flex flex-row items-center justify-between pb-0"><CardDescription>{label}</CardDescription><Icon className="size-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-3xl font-semibold tabular-nums">{value}</div></CardContent></Card>)}</section>
  <Card className="min-w-0 overflow-hidden"><CardHeader className="border-b"><CardTitle>Booking register</CardTitle><CardDescription>Filter, sort and export records. Open a booking to manage its dispatch.</CardDescription></CardHeader><CardContent className="p-0">{error?<p role="alert" className="p-7 text-sm text-destructive">{error}</p>:<OperationsRegister kind="bookings" records={rows.map(r=>({...r,created_at:new Date(r.created_at).toISOString()}))} total={matched} pages={pages} page={page} pageSize={PAGE_SIZE} query={filters.q} status={filters.status} sort={filters.sort}/>}</CardContent></Card>
 </main>;
}
