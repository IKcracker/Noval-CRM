import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {Banknote,Boxes,Building2,CalendarClock,ClipboardList,Clock,Mail,MapPin,Phone,UserRound,Weight} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {place} from "@/lib/places";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {InfoList,JourneyLine,Panel,RecordHeader,StageStepper,Timeline,dateOnly,dateTime,rand,statusLabel} from "@/components/admin/record-detail";
import {QuoteWorkbench} from "./quote-workbench";
type Quote={id:string;reference:string;contact_name:string;company:string|null;email:string;phone:string;origin:string;destination:string;service_type:string;cargo_details:string;pickup_date:string|null;weight_kg:string|null;status:string;quoted_amount_cents:string|null;created_at:Date;updated_at:Date;booking_id:string|null;customer_id:string|null};
type Event={id:string;from_status:string|null;to_status:string;note:string|null;actor:string;created_at:Date};
const stages=["NEW","REVIEWING","PRICED","SENT","ACCEPTED"];
export default async function QuoteDetail({params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())redirect("/admin/login");
 const {id}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))notFound();
 let quotes:Quote[]=[],events:Event[]=[],error="";
 try{
  const sql=db();
  quotes=await sql`SELECT q.id,q.reference,q.contact_name,q.company,q.email,q.phone,q.origin,q.destination,q.service_type,q.cargo_details,q.pickup_date::text AS pickup_date,
    q.weight_kg::text AS weight_kg,q.status,q.quoted_amount_cents::text AS quoted_amount_cents,q.created_at,q.updated_at,
    (SELECT b.id FROM bookings b WHERE b.quote_id=q.id) AS booking_id,
    (SELECT c.id FROM crm_customers c WHERE lower(c.email)=lower(q.email) LIMIT 1) AS customer_id
   FROM quote_requests q WHERE q.id=${id}::uuid LIMIT 1` as Quote[];
  events=await sql`SELECT id,from_status,to_status,note,actor,created_at FROM quote_events WHERE quote_id=${id}::uuid ORDER BY created_at DESC LIMIT 60` as Event[];
 }catch{error="Unable to load quote. Verify that the database is configured and migrated.";}
 if(!quotes.length&&!error)notFound();
 if(error)return <main className="mx-auto max-w-[1740px] p-3 md:p-4"><Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card></main>;
 const q=quotes[0],closed=["DECLINED","EXPIRED"].includes(q.status);
 // Closed quotes show the stage they never reached (the one after their furthest recorded stage) in red.
 const reached=closed?Math.max(0,...events.map(e=>stages.indexOf(e.from_status??""))):stages.indexOf(q.status);
 const current=q.status==="ACCEPTED"?stages.length:reached+1;
 return <main className="mx-auto max-w-[1740px] space-y-4 p-3 md:p-4">
  <RecordHeader back={{href:"/dashboard/quotes",label:"All quotations"}} icon={ClipboardList} eyebrow="Quotation" title={q.reference} status={q.status}
   meta={<><span className="flex items-center gap-1.5"><MapPin className="size-3.5"/>{place(q.origin)} → {place(q.destination)}</span><span>{q.company||q.contact_name}</span><span>Received {dateTime(q.created_at)}</span></>}
   actions={q.booking_id?<Button nativeButton={false} size="sm" className="h-9 px-3" render={<Link href={"/dashboard/bookings/"+q.booking_id}/>}><Boxes className="size-3.5"/> Open booking</Button>:null}
   facts={[
    {label:"Quoted amount",value:rand(q.quoted_amount_cents)??"Not priced",sub:q.quoted_amount_cents?"Set during review":"Price after review",icon:Banknote},
    {label:"Service",value:q.service_type,sub:q.weight_kg?Number(q.weight_kg).toLocaleString("en-ZA")+" kg estimated":"Weight not provided",icon:Weight},
    {label:"Preferred pickup",value:q.pickup_date?dateOnly(q.pickup_date):"Not specified",sub:"Customer preference",icon:CalendarClock},
    {label:"Last activity",value:dateTime(events[0]?.created_at??q.updated_at),sub:events.length+" status change"+(events.length===1?"":"s"),icon:Clock}
   ]}/>
  <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
   <div className="min-w-0 space-y-4">
    <Panel title="Quotation pipeline" description={closed?"Closed as "+statusLabel(q.status).toLowerCase()+" at the highlighted stage":"Review → price → send → customer acceptance"}><StageStepper steps={stages.map(s=>s==="NEW"?"Received":statusLabel(s))} current={current} failed={closed}/></Panel>
    <div className="grid gap-4 lg:grid-cols-2">
     <Panel title="Requested route"><JourneyLine origin={q.origin} destination={q.destination} departure={q.pickup_date?"preferred "+dateOnly(q.pickup_date):null}/></Panel>
     <Panel title="Cargo details" description={q.service_type}><p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/80">{q.cargo_details}</p></Panel>
    </div>
    <Panel title="Activity history" description="Status changes and recorded evidence, newest first">
     <Timeline empty="No status changes recorded yet." items={events.map(e=>({id:e.id,status:e.to_status,title:(e.from_status?statusLabel(e.from_status)+" → ":"")+statusLabel(e.to_status),body:e.note,meta:dateTime(e.created_at)+" · "+e.actor}))}/>
    </Panel>
   </div>
   <div className="min-w-0 space-y-4 xl:sticky xl:top-20">
    <QuoteWorkbench id={q.id} status={q.status}/>
    <Panel title="Customer" action={q.customer_id?<Link href={"/dashboard/customers/"+q.customer_id} className="text-[12px] font-medium text-emerald-700 hover:underline">View profile</Link>:null}>
     <InfoList items={[
      {label:"Contact",value:q.contact_name,icon:UserRound},
      {label:"Company",value:q.company||"Individual customer",icon:Building2},
      {label:"Email",value:<a href={"mailto:"+q.email} className="text-emerald-700 hover:underline">{q.email}</a>,icon:Mail},
      {label:"Phone",value:<a href={"tel:"+q.phone} className="hover:underline">{q.phone}</a>,icon:Phone}
     ]}/>
    </Panel>
   </div>
  </div>
 </main>;
}
