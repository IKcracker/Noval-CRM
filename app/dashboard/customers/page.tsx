import Link from "next/link";
import {redirect} from "next/navigation";
import {Users,UserCheck,UserRoundPlus,ArrowUpRight} from "lucide-react";
import {db} from "@/lib/db";
import {isAdmin} from "@/lib/admin-auth";
import {parseOperationsQuery,countPages,type RawListParams} from "@/lib/operations-query";
import {Card,CardHeader,CardDescription,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {CustomerDirectory,type CustomerRow} from "./customer-directory";
const PAGE_SIZE=20;
type Metrics={total:number;active:number;prospects:number};
export default async function Customers({searchParams}:{searchParams:Promise<RawListParams>}){
 if(!await isAdmin())redirect("/admin/login");
 const filters=parseOperationsQuery(await searchParams,["ALL","PROSPECT","ACTIVE","INACTIVE"]);
 let metrics:Metrics={total:0,active:0,prospects:0},rows:CustomerRow[]=[],total=0,page=1,pages=1,error="";
 try{
  const sql=db();
  const result=await sql`SELECT count(*)::int total,
   count(*) FILTER (WHERE status='ACTIVE')::int active,
   count(*) FILTER (WHERE status='PROSPECT')::int prospects FROM crm_customers`;
  metrics=result[0] as Metrics;
  const count=await sql`SELECT count(*)::int total FROM crm_customers c WHERE
   (${filters.status}='ALL' OR c.status=${filters.status}) AND
   (${filters.q}='' OR c.contact_name ILIKE ${filters.pattern}
   OR coalesce(c.company_name,'') ILIKE ${filters.pattern} OR c.email ILIKE ${filters.pattern}
   OR coalesce(c.phone,'') ILIKE ${filters.pattern})`;
  total=Number(count[0].total);pages=countPages(total,PAGE_SIZE);page=Math.min(filters.requestedPage,pages);
  const offset=(page-1)*PAGE_SIZE;
  rows=await sql`SELECT c.id,c.company_name,c.contact_name,c.email,c.phone,c.status,c.created_at,
   (SELECT count(*)::int FROM quote_requests q WHERE lower(q.email)=lower(c.email)) AS quote_count
   FROM crm_customers c WHERE
   (${filters.status}='ALL' OR c.status=${filters.status}) AND
   (${filters.q}='' OR c.contact_name ILIKE ${filters.pattern}
   OR coalesce(c.company_name,'') ILIKE ${filters.pattern} OR c.email ILIKE ${filters.pattern}
   OR coalesce(c.phone,'') ILIKE ${filters.pattern})
   ORDER BY CASE WHEN ${filters.sort}='oldest' THEN c.created_at END ASC,
   CASE WHEN ${filters.sort}='customer' THEN lower(c.contact_name) END ASC,
   CASE WHEN ${filters.sort}='status' THEN c.status END ASC,
   CASE WHEN ${filters.sort}='newest' THEN c.created_at END DESC,c.created_at DESC,c.id DESC
   LIMIT ${PAGE_SIZE} OFFSET ${offset}` as CustomerRow[];
 }catch{error="Customer records are unavailable. Apply db/005_customer_workspace.sql with npm run data:migrate.";}
 return <main className="mx-auto max-w-[1680px] space-y-5 p-4 md:p-7 lg:p-8">
 <header className="flex flex-wrap items-end justify-between gap-4"><div className="space-y-1"><Badge variant="secondary">CRM / Relationships</Badge><h1 className="text-3xl font-semibold tracking-tight">Customers</h1><p className="text-sm text-muted-foreground">Manage client contacts and follow their quotation and shipment history.</p></div>
 <Button render={<Link href="/dashboard/customers/new"/>}><UserRoundPlus className="size-4"/> New customer <ArrowUpRight className="size-4"/></Button></header>
 <section className="grid gap-3 sm:grid-cols-3" aria-label="Customer metrics">{[
  {label:"Total customers",value:metrics.total,icon:Users},{label:"Active accounts",value:metrics.active,icon:UserCheck},{label:"Prospects",value:metrics.prospects,icon:UserRoundPlus}
 ].map(({label,value,icon:Icon})=><Card key={label}><CardHeader className="flex flex-row items-center justify-between pb-0"><CardDescription>{label}</CardDescription><Icon className="size-4 text-muted-foreground"/></CardHeader><CardContent><p className="text-3xl font-semibold tabular-nums">{value}</p></CardContent></Card>)}</section>
 {error?<Card><CardContent className="p-8 text-destructive">{error}</CardContent></Card>:<CustomerDirectory rows={rows.map(r=>({...r,created_at:new Date(r.created_at).toISOString()}))} total={total} page={page} pages={pages} query={filters.q} status={filters.status} sort={filters.sort}/>}
 </main>;
}
