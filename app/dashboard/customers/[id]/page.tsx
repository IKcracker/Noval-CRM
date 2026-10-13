import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {ArrowLeft,Building2,Mail,Phone,NotebookTabs,Truck,FileText} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Badge} from "@/components/ui/badge";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Tabs,TabsList,TabsTrigger,TabsContent} from "@/components/ui/tabs";
import {Table,TableHeader,TableRow,TableHead,TableBody,TableCell} from "@/components/ui/table";
import {CustomerForm,type CustomerEditable} from "../customer-form";
import {CustomerNoteForm} from "./customer-note-form";
type Customer=CustomerEditable&{created_at:Date;updated_at:Date};
type Quote={id:string;reference:string;status:string;origin:string;destination:string;quoted_amount_cents:string|null;created_at:Date};
type Shipment={id:string;tracking_number:string;status:string;created_at:Date};
type Note={id:string;body:string;actor:string;created_at:Date};
export default async function CustomerDetails({params}:{params:Promise<{id:string}>}){
 if(!await isAdmin())redirect("/admin/login");
 const {id}=await params;if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))notFound();
 let found:Customer[]=[],quotes:Quote[]=[],shipments:Shipment[]=[],notes:Note[]=[],error="";
 try{
  const sql=db();
  found=await sql`SELECT id,company_name,contact_name,email,phone,billing_address,status,created_at,updated_at
   FROM crm_customers WHERE id=${id}::uuid LIMIT 1` as Customer[];
  if(found.length){
   const email=found[0].email;
   quotes=await sql`SELECT id,reference,status,origin,destination,quoted_amount_cents,created_at
    FROM quote_requests WHERE lower(email)=lower(${email}) ORDER BY created_at DESC LIMIT 40` as Quote[];
   shipments=await sql`SELECT s.id,s.tracking_number,s.status,s.created_at FROM shipments s
    JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id
    WHERE lower(q.email)=lower(${email}) ORDER BY s.created_at DESC LIMIT 30` as Shipment[];
   notes=await sql`SELECT id,body,actor,created_at FROM crm_customer_notes
    WHERE customer_id=${id}::uuid ORDER BY created_at DESC LIMIT 60` as Note[];
  }
 }catch{error="Customer information unavailable. Check Neon connectivity and migration 005.";}
 if(!found.length&&!error)notFound();
 const c=found[0];
 return <main className="mx-auto max-w-[1640px] space-y-6 p-4 md:p-7 lg:p-8">
 <Link href="/dashboard/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4"/> All customers</Link>
 {error?<Card><CardContent className="p-8 text-destructive">{error}</CardContent></Card>:<>
 <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5"><div className="space-y-2"><Badge variant="secondary">Customer / 360° profile</Badge><h1 className="text-3xl font-semibold tracking-tight">{c.company_name||c.contact_name}</h1><p className="text-sm text-muted-foreground">{c.company_name?c.contact_name+" · ":""}Customer since {new Date(c.created_at).toLocaleDateString("en-ZA")}</p></div><Badge variant={c.status==="ACTIVE"?"default":"secondary"}>{c.status}</Badge></header>
 <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
 <div className="min-w-0 space-y-5">
 <Card><CardHeader><CardTitle>Contact overview</CardTitle><CardDescription>Current account contact and contact details</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="flex gap-3"><Building2 className="mt-1 size-4 text-muted-foreground"/><div><p className="text-xs text-muted-foreground">Company</p><p className="font-medium">{c.company_name||"Individual account"}</p></div></div><div className="flex gap-3"><Mail className="mt-1 size-4 text-muted-foreground"/><div><p className="text-xs text-muted-foreground">Email</p><a className="font-medium text-primary hover:underline" href={"mailto:"+c.email}>{c.email}</a></div></div><div className="flex gap-3"><Phone className="mt-1 size-4 text-muted-foreground"/><div><p className="text-xs text-muted-foreground">Telephone</p><p className="font-medium">{c.phone||"Not provided"}</p></div></div><div><p className="text-xs text-muted-foreground">Billing address</p><p className="whitespace-pre-wrap font-medium">{c.billing_address||"Not provided"}</p></div></CardContent></Card>
 <Card className="min-w-0"><CardHeader><CardTitle>Customer activity</CardTitle><CardDescription>Linked by customer email to actual quotation and shipment records</CardDescription></CardHeader><CardContent>
 <Tabs defaultValue="quotes"><TabsList variant="line" className="mb-4"><TabsTrigger value="quotes"><FileText className="size-4"/> Quotes ({quotes.length})</TabsTrigger><TabsTrigger value="shipments"><Truck className="size-4"/> Shipments ({shipments.length})</TabsTrigger><TabsTrigger value="notes"><NotebookTabs className="size-4"/> Notes ({notes.length})</TabsTrigger></TabsList>
 <TabsContent value="quotes"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Route</TableHead><TableHead>Status</TableHead><TableHead/></TableRow></TableHeader><TableBody>{quotes.length?quotes.map(q=><TableRow key={q.id}><TableCell className="font-semibold">{q.reference}</TableCell><TableCell className="max-w-44 truncate">{q.origin} → {q.destination}</TableCell><TableCell><Badge variant="secondary">{q.status}</Badge></TableCell><TableCell><Button size="sm" variant="ghost" render={<Link href={"/dashboard/quotes/"+q.id}/>}>Open</Button></TableCell></TableRow>):<TableRow><TableCell colSpan={4} className="h-28 text-center text-muted-foreground">No quotation history.</TableCell></TableRow>}</TableBody></Table></div></TabsContent>
 <TabsContent value="shipments"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Tracking reference</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead/></TableRow></TableHeader><TableBody>{shipments.length?shipments.map(s=><TableRow key={s.id}><TableCell className="font-semibold">{s.tracking_number}</TableCell><TableCell><Badge variant={s.status==="EXCEPTION"?"destructive":"secondary"}>{s.status.replaceAll("_"," ")}</Badge></TableCell><TableCell>{new Date(s.created_at).toLocaleDateString("en-ZA")}</TableCell><TableCell><Button size="sm" variant="ghost" render={<Link href={"/dashboard/shipments/"+s.id}/>}>Open</Button></TableCell></TableRow>):<TableRow><TableCell colSpan={4} className="h-28 text-center text-muted-foreground">No linked shipments.</TableCell></TableRow>}</TableBody></Table></div></TabsContent>
 <TabsContent value="notes"><div className="space-y-5"><CustomerNoteForm customerId={c.id}/>{notes.length?notes.map(n=><article className="border-t pt-4" key={n.id}><p className="whitespace-pre-wrap text-sm">{n.body}</p><p className="mt-2 text-xs text-muted-foreground">{n.actor} · {new Date(n.created_at).toLocaleString("en-ZA")}</p></article>):<p className="text-sm text-muted-foreground">No activity notes yet.</p>}</div></TabsContent>
 </Tabs></CardContent></Card>
 </div>
 <div><CustomerForm initial={{id:c.id,company_name:c.company_name,contact_name:c.contact_name,email:c.email,phone:c.phone,billing_address:c.billing_address,status:c.status}}/></div>
 </div></>}
 </main>;
}
