import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Card} from "@/components/ui/card";
import {QuoteWorkbench} from "./quote-workbench";
type Quote={id:string;reference:string;contact_name:string;company:string|null;email:string;phone:string;origin:string;destination:string;service_type:string;cargo_details:string;pickup_date:string|null;weight_kg:number|null;status:string;quoted_amount_cents:number|null;created_at:Date};
type Event={id:string;from_status:string|null;to_status:string;note:string|null;actor:string;created_at:Date};
export default async function QuoteDetail({params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())redirect("/admin/login");
 const {id}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))notFound();
 let quotes:Quote[]=[],events:Event[]=[],error="";
 try{
  const sql=db();
  quotes=await sql`SELECT id,reference,contact_name,company,email,phone,origin,destination,service_type,cargo_details,pickup_date,weight_kg,status,quoted_amount_cents,created_at FROM quote_requests WHERE id=${id}::uuid LIMIT 1` as Quote[];
  events=await sql`SELECT id,from_status,to_status,note,actor,created_at FROM quote_events WHERE quote_id=${id}::uuid ORDER BY created_at DESC LIMIT 60` as Event[];
 }catch{error="Unable to load quote. Verify that the database is configured and migrated.";}
 if(!quotes.length&&!error)notFound();
 const q=quotes[0];
 return <main className="min-h-screen bg-[#f5f7fa] px-5 py-10 text-slate-900 md:px-10">
 <div className="mx-auto max-w-7xl">
  <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><Link href="/dashboard/quotes" className="text-sm font-semibold text-[#1688a2]">← All quote requests</Link><Link href="/dashboard/bookings" className="text-sm font-semibold text-slate-700">Bookings →</Link></div>
  {error?<Card className="p-8 text-red-700">{error}</Card>:<>
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#1688a2]">Quotation workbench</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight">{q.reference}</h1><p className="mt-3 text-sm text-slate-500">Received {new Date(q.created_at).toLocaleString("en-ZA")}</p></div><span className="rounded-full bg-cyan-50 px-4 py-2 text-xs font-extrabold tracking-wider text-cyan-900">{q.status}</span></div>
  <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]"><div className="space-y-6">
   <Card className="p-7"><h2 className="text-lg font-bold">Shipment requirements</h2><div className="mt-7 grid gap-6 sm:grid-cols-2">{[["Collection",q.origin],["Delivery",q.destination],["Service",q.service_type],["Preferred pickup",q.pickup_date?new Date(q.pickup_date).toLocaleDateString("en-ZA"):"Not specified"],["Estimated weight",q.weight_kg?String(q.weight_kg)+" kg":"Not provided"],["Customer",q.contact_name]].map(([k,v])=><div key={k}><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{k}</p><p className="mt-2 font-semibold">{v}</p></div>)}</div><div className="mt-7 border-t border-slate-100 pt-6"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cargo details</p><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{q.cargo_details}</p></div></Card>
   <Card className="p-7"><h2 className="text-lg font-bold">Customer contact</h2><div className="mt-5 flex flex-wrap gap-8 text-sm"><div><p className="text-slate-500">Company</p><p className="mt-1 font-semibold">{q.company||"Individual customer"}</p></div><div><p className="text-slate-500">Email</p><p className="mt-1 font-semibold">{q.email}</p></div><div><p className="text-slate-500">Phone</p><p className="mt-1 font-semibold">{q.phone}</p></div></div></Card>
   <Card className="p-7"><h2 className="text-lg font-bold">Activity history</h2><div className="mt-7 space-y-6">{events.length===0?<p className="text-sm text-slate-500">No status changes recorded yet.</p>:events.map(e=><div key={e.id} className="flex gap-4 border-l-2 border-cyan-100 pl-4"><div><p className="text-sm font-bold">{e.from_status?e.from_status+" → ":""}{e.to_status}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{e.note||"Status updated"}</p><p className="mt-2 text-xs text-slate-400">{new Date(e.created_at).toLocaleString("en-ZA")} · {e.actor}</p></div></div>)}</div></Card>
  </div><div className="space-y-6"><Card className="p-7"><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Quoted amount</p><p className="mt-3 text-4xl font-extrabold tracking-tight">{q.quoted_amount_cents!==null?new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(Number(q.quoted_amount_cents)/100):"Not priced"}</p><p className="mt-2 text-xs text-slate-500">Price is set by operations during review.</p></Card><QuoteWorkbench id={q.id} status={q.status}/></div></div></>}
 </div></main>;
}
