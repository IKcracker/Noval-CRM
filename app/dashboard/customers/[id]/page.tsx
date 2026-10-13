import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {Banknote,Building2,ClipboardList,Clock,ContactRound,FileText,Mail,MapPin,NotebookTabs,Phone,Truck,UserRound} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {place} from "@/lib/places";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Tabs,TabsList,TabsTrigger,TabsContent} from "@/components/ui/tabs";
import {InfoList,Panel,RecordHeader,StatusPill,Timeline,dateOnly,dateTime,rand} from "@/components/admin/record-detail";
import {CustomerForm,type CustomerEditable} from "../customer-form";
import {CustomerNoteForm} from "./customer-note-form";
type Customer=CustomerEditable&{created_at:Date;updated_at:Date};
type Quote={id:string;reference:string;status:string;origin:string;destination:string;quoted_amount_cents:string|null;created_at:Date};
type Shipment={id:string;tracking_number:string;status:string;origin:string;destination:string;created_at:Date};
type Note={id:string;body:string;actor:string;created_at:Date};
type Totals={quotes:number;open_quotes:number;shipments:number;active_shipments:number;accepted_cents:string;last_activity:Date|null};
export default async function CustomerDetails({params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())redirect("/admin/login");
 const {id}=await params;if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))notFound();
 let found:Customer[]=[],quotes:Quote[]=[],shipments:Shipment[]=[],notes:Note[]=[],totals:Totals|undefined,error="";
 try{
  const sql=db();
  found=await sql`SELECT id,company_name,contact_name,email,phone,billing_address,status,created_at,updated_at
   FROM crm_customers WHERE id=${id}::uuid LIMIT 1` as Customer[];
  if(found.length){
   const email=found[0].email;
   quotes=await sql`SELECT id,reference,status,origin,destination,quoted_amount_cents::text AS quoted_amount_cents,created_at
    FROM quote_requests WHERE lower(email)=lower(${email}) ORDER BY created_at DESC LIMIT 40` as Quote[];
   shipments=await sql`SELECT s.id,s.tracking_number,s.status,q.origin,q.destination,s.created_at FROM shipments s
    JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id
    WHERE lower(q.email)=lower(${email}) ORDER BY s.created_at DESC LIMIT 30` as Shipment[];
   notes=await sql`SELECT id,body,actor,created_at FROM crm_customer_notes
    WHERE customer_id=${id}::uuid ORDER BY created_at DESC LIMIT 60` as Note[];
   [totals]=await sql`SELECT
     (SELECT count(*)::int FROM quote_requests WHERE lower(email)=lower(${email})) AS quotes,
     (SELECT count(*)::int FROM quote_requests WHERE lower(email)=lower(${email}) AND status IN ('NEW','REVIEWING','PRICED','SENT')) AS open_quotes,
     (SELECT count(*)::int FROM shipments s JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id WHERE lower(q.email)=lower(${email})) AS shipments,
     (SELECT count(*)::int FROM shipments s JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id WHERE lower(q.email)=lower(${email}) AND s.status NOT IN ('DELIVERED','RETURNED','CANCELLED')) AS active_shipments,
     (SELECT coalesce(sum(quoted_amount_cents),0)::text FROM quote_requests WHERE lower(email)=lower(${email}) AND status='ACCEPTED') AS accepted_cents,
     greatest((SELECT max(created_at) FROM quote_requests WHERE lower(email)=lower(${email})),(SELECT max(created_at) FROM crm_customer_notes WHERE customer_id=${id}::uuid)) AS last_activity` as Totals[];
  }
 }catch{error="Customer information unavailable. Check Neon connectivity and migration 005.";}
 if(!found.length&&!error)notFound();
 if(error||!totals)return <main className="mx-auto max-w-[1740px] p-3 md:p-4"><Card><CardContent className="py-12 text-center text-sm text-destructive">{error||"Customer information unavailable."}</CardContent></Card></main>;
 const c=found[0];
 const row="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60";
 return <main className="mx-auto max-w-[1740px] space-y-4 p-3 md:p-4">
  <RecordHeader back={{href:"/dashboard/customers",label:"All customers"}} icon={c.company_name?Building2:ContactRound} eyebrow="Customer" title={c.company_name||c.contact_name} status={c.status}
   meta={<>{c.company_name&&<span className="flex items-center gap-1.5"><UserRound className="size-3.5"/>{c.contact_name}</span>}<span>Customer since {dateOnly(c.created_at)}</span></>}
   actions={<><Button nativeButton={false} variant="outline" size="sm" className="h-9 px-3" render={<a href={"mailto:"+c.email}/>}><Mail className="size-3.5"/> Email</Button>{c.phone&&<Button nativeButton={false} variant="outline" size="sm" className="h-9 px-3" render={<a href={"tel:"+c.phone}/>}><Phone className="size-3.5"/> Call</Button>}<Button nativeButton={false} size="sm" className="h-9 px-3" render={<Link href="/quote"/>}><ClipboardList className="size-3.5"/> New enquiry</Button></>}
   facts={[
    {label:"Quotations",value:totals.quotes,sub:totals.open_quotes+" open",icon:FileText},
    {label:"Shipments",value:totals.shipments,sub:totals.active_shipments+" in progress",icon:Truck},
    {label:"Accepted quote value",value:rand(totals.accepted_cents),sub:"Quoted, not received revenue",icon:Banknote},
    {label:"Last activity",value:totals.last_activity?dateTime(totals.last_activity):"No activity yet",sub:"Latest enquiry or note",icon:Clock}
   ]}/>
  <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
   <Panel title="Customer activity" description="Matched to quotation and shipment records by email address" bodyClassName="px-5 pb-5">
    <Tabs defaultValue="quotes">
     <TabsList variant="line" className="mb-3"><TabsTrigger value="quotes"><FileText className="size-4"/> Quotations ({quotes.length})</TabsTrigger><TabsTrigger value="shipments"><Truck className="size-4"/> Shipments ({shipments.length})</TabsTrigger><TabsTrigger value="notes"><NotebookTabs className="size-4"/> Notes ({notes.length})</TabsTrigger></TabsList>
     <TabsContent value="quotes"><div className="divide-y divide-border">{quotes.length?quotes.map(q=><Link key={q.id} href={"/dashboard/quotes/"+q.id} className={row}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><FileText className="size-4"/></span>
      <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{q.reference}</span><span className="flex items-center gap-1 truncate text-[11.5px] text-muted-foreground" title={q.origin+" → "+q.destination}><MapPin className="size-3 shrink-0"/>{place(q.origin)} → {place(q.destination)} · {dateOnly(q.created_at)}</span></span>
      <span className="hidden text-[13px] font-medium tabular-nums sm:block">{rand(q.quoted_amount_cents)??"—"}</span><StatusPill status={q.status}/>
     </Link>):<p className="py-10 text-center text-[12.5px] text-muted-foreground">No quotation history.</p>}</div></TabsContent>
     <TabsContent value="shipments"><div className="divide-y divide-border">{shipments.length?shipments.map(s=><Link key={s.id} href={"/dashboard/shipments/"+s.id} className={row}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Truck className="size-4"/></span>
      <span className="min-w-0 flex-1"><span className="block font-mono text-[12.5px] font-semibold">{s.tracking_number}</span><span className="flex items-center gap-1 truncate text-[11.5px] text-muted-foreground" title={s.origin+" → "+s.destination}><MapPin className="size-3 shrink-0"/>{place(s.origin)} → {place(s.destination)} · {dateOnly(s.created_at)}</span></span>
      <StatusPill status={s.status}/>
     </Link>):<p className="py-10 text-center text-[12.5px] text-muted-foreground">No linked shipments.</p>}</div></TabsContent>
     <TabsContent value="notes"><div className="space-y-5"><CustomerNoteForm customerId={c.id}/><Timeline empty="No activity notes yet." items={notes.map(n=>({id:n.id,title:n.actor,body:n.body,meta:dateTime(n.created_at)}))}/></div></TabsContent>
    </Tabs>
   </Panel>
   <div className="min-w-0 space-y-4 xl:sticky xl:top-20">
    <Panel title="Contact details">
     <InfoList items={[
      {label:"Contact",value:c.contact_name,icon:UserRound},
      {label:"Company",value:c.company_name||"Individual account",icon:Building2},
      {label:"Email",value:<a href={"mailto:"+c.email} className="text-emerald-700 hover:underline">{c.email}</a>,icon:Mail},
      {label:"Phone",value:c.phone||"Not provided",icon:Phone},
      {label:"Billing address",value:<span className="whitespace-pre-wrap">{c.billing_address||"Not provided"}</span>,icon:MapPin}
     ]}/>
    </Panel>
    <CustomerForm initial={{id:c.id,company_name:c.company_name,contact_name:c.contact_name,email:c.email,phone:c.phone,billing_address:c.billing_address,status:c.status}}/>
   </div>
  </div>
 </main>;
}
