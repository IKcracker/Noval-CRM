import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Badge} from "@/components/ui/badge";
import {Card,CardContent,CardHeader,CardTitle,CardDescription} from "@/components/ui/card";
import {MilestoneForm} from "./milestone-form";
type Shipment={id:string;tracking_number:string;status:string;origin:string;destination:string;contact_name:string;email:string;booking_reference:string};
type Event={id:string;status:string;note:string|null;actor:string;location_label:string|null;visible_to_customer:boolean;created_at:Date};
export default async function ShipmentPage({params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())redirect("/admin/login");const {id}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))notFound();
 let rows:Shipment[]=[],events:Event[]=[],error="";
 try{const sql=db();rows=await sql`SELECT s.id,s.tracking_number,s.status,q.origin,q.destination,q.contact_name,q.email,b.reference AS booking_reference FROM shipments s JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id WHERE s.id=${id}::uuid` as Shipment[];events=await sql`SELECT id,status,note,actor,location_label,visible_to_customer,created_at FROM shipment_events WHERE shipment_id=${id}::uuid ORDER BY created_at DESC LIMIT 150` as Event[];}
 catch{error="Shipment details are temporarily unavailable. Apply migration 003.";}
 if(!rows.length&&!error)notFound();const s=rows[0];
 return <main className="space-y-7 p-5 md:p-8"><Link className="text-sm font-medium text-primary hover:underline" href="/dashboard/shipments">← All shipments</Link>{error?<Card><CardContent className="text-destructive">{error}</CardContent></Card>:<>
 <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">Shipment / {s.booking_reference}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{s.tracking_number}</h1></div><Badge variant={s.status==="EXCEPTION"?"destructive":"secondary"}>{s.status.replaceAll("_"," ")}</Badge></div>
 <div className="grid gap-5 lg:grid-cols-[1.3fr_.8fr]"><div className="space-y-5"><Card><CardHeader><CardTitle>Shipment overview</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2">{[["Customer",s.contact_name],["Email",s.email],["Collection",s.origin],["Destination",s.destination]].map(([title,value])=><div key={title}><p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p><p className="mt-2 font-medium">{value}</p></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Operational history</CardTitle><CardDescription>Recorded milestones, newest first</CardDescription></CardHeader><CardContent>{events.length===0?<p className="text-sm text-muted-foreground">No milestones recorded.</p>:<div className="space-y-5">{events.map(e=><div key={e.id} className="border-l-2 border-primary/30 pl-4"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{e.status.replaceAll("_"," ")}</p>{!e.visible_to_customer&&<Badge variant="outline">Internal</Badge>}</div><p className="mt-1 text-sm text-muted-foreground">{e.note||"Status updated"}{e.location_label?" · "+e.location_label:""}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString("en-ZA")} · {e.actor}</p></div>)}</div>}</CardContent></Card></div>
 <Card><CardHeader><CardTitle>Update shipment</CardTitle><CardDescription>Record a verified operational event. This is not a live GPS position.</CardDescription></CardHeader><CardContent><MilestoneForm key={s.status} id={s.id} status={s.status}/></CardContent></Card></div></>}</main>;
}
