import Link from "next/link";
import {redirect} from "next/navigation";
import {ArrowUpRight,FileText,ClipboardCheck,Clock3} from "lucide-react";
import {db} from "@/lib/db";
import {isAdmin} from "@/lib/admin-auth";
import {parseOperationsQuery,countPages,type RawListParams} from "@/lib/operations-query";
import {OperationsRegister,type OperationsRow} from "@/components/admin/operations-register";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
const PAGE_SIZE=20;
type Stats={total:number;awaiting:number;priced:number;accepted:number};
type QuoteRow=Omit<OperationsRow,"created_at">&{created_at:Date|string};
export default async function QuotesPage({searchParams}:{searchParams:Promise<RawListParams>}){
 if(!await isAdmin())redirect("/admin/login");
 const filters=parseOperationsQuery(await searchParams,["ALL","NEW","REVIEWING","PRICED","SENT","ACCEPTED","DECLINED","EXPIRED"]);
 let stats:Stats={total:0,awaiting:0,priced:0,accepted:0},rows:QuoteRow[]=[],matched=0,page=1,pages=1,error="";
 try{
  const sql=db();
  const summary=await sql`SELECT count(*)::int AS total,
   count(*) FILTER (WHERE status IN ('NEW','REVIEWING'))::int AS awaiting,
   count(*) FILTER (WHERE status IN ('PRICED','SENT'))::int AS priced,
   count(*) FILTER (WHERE status='ACCEPTED')::int AS accepted FROM quote_requests`;
  stats=summary[0] as Stats;
  const counting=await sql`SELECT count(*)::int AS total FROM quote_requests q
   WHERE (${filters.status}='ALL' OR q.status=${filters.status})
   AND (${filters.q}='' OR q.reference ILIKE ${filters.pattern}
     OR q.contact_name ILIKE ${filters.pattern} OR coalesce(q.company,'') ILIKE ${filters.pattern}
     OR q.email ILIKE ${filters.pattern} OR q.origin ILIKE ${filters.pattern}
     OR q.destination ILIKE ${filters.pattern} OR q.service_type ILIKE ${filters.pattern})`;
  matched=Number(counting[0].total);
  pages=countPages(matched,PAGE_SIZE);page=Math.min(filters.requestedPage,pages);
  const offset=(page-1)*PAGE_SIZE;
  rows=await sql`SELECT q.id,q.reference,q.contact_name AS customer,q.company,q.origin,q.destination,
   q.service_type AS related_reference,q.status,q.created_at FROM quote_requests q
   WHERE (${filters.status}='ALL' OR q.status=${filters.status})
   AND (${filters.q}='' OR q.reference ILIKE ${filters.pattern}
     OR q.contact_name ILIKE ${filters.pattern} OR coalesce(q.company,'') ILIKE ${filters.pattern}
     OR q.email ILIKE ${filters.pattern} OR q.origin ILIKE ${filters.pattern}
     OR q.destination ILIKE ${filters.pattern} OR q.service_type ILIKE ${filters.pattern})
   ORDER BY CASE WHEN ${filters.sort}='oldest' THEN q.created_at END ASC,
    CASE WHEN ${filters.sort}='customer' THEN lower(q.contact_name) END ASC,
    CASE WHEN ${filters.sort}='status' THEN q.status END ASC,
    CASE WHEN ${filters.sort}='newest' THEN q.created_at END DESC,q.created_at DESC,q.id DESC
   LIMIT ${PAGE_SIZE} OFFSET ${offset}` as QuoteRow[];
 }catch{error="Unable to load quotations. Verify Neon connectivity and the migrations.";}
 return <main className="mx-auto max-w-[1680px] space-y-5 p-4 md:p-7 lg:p-8">
 <header className="flex flex-wrap items-end justify-between gap-4"><div className="space-y-1"><Badge variant="secondary">Sales / Quotation pipeline</Badge><h1 className="text-3xl font-semibold tracking-tight">Quote requests</h1><p className="text-sm text-muted-foreground">Qualify, price and track every freight quotation request.</p></div><Button nativeButton={false} variant="outline" render={<Link href="/dashboard/bookings"/>}>Dispatch bookings <ArrowUpRight className="size-4"/></Button></header>
 <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Quote metrics">{[
 {label:"All enquiries",value:stats.total,icon:FileText},
 {label:"Needs review",value:stats.awaiting,icon:Clock3},
 {label:"Pricing & sent",value:stats.priced,icon:ClipboardCheck},
 {label:"Accepted",value:stats.accepted,icon:ArrowUpRight}
 ].map(({label,value,icon:Icon})=><Card key={label}><CardHeader className="flex flex-row items-center justify-between pb-0"><CardDescription>{label}</CardDescription><Icon className="size-4 text-muted-foreground"/></CardHeader><CardContent><p className="text-3xl font-semibold tabular-nums">{value}</p></CardContent></Card>)}</section>
 <Card className="min-w-0 overflow-hidden"><CardHeader className="border-b"><CardTitle>Quotation workbench</CardTitle><CardDescription>Database-backed search, sort, export and record actions across the full pipeline.</CardDescription></CardHeader><CardContent className="p-0">{error?<p role="alert" className="p-8 text-destructive">{error}</p>:<OperationsRegister kind="quotes" records={rows.map(r=>({...r,created_at:new Date(r.created_at).toISOString()}))} total={matched} page={page} pages={pages} pageSize={PAGE_SIZE} query={filters.q} status={filters.status} sort={filters.sort}/>}</CardContent></Card></main>;
}
