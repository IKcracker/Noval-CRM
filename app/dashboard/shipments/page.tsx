import Link from "next/link";
import {redirect} from "next/navigation";
import {PackageCheck} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell} from "@/components/ui/table";
type Row={id:string;tracking_number:string;status:string;origin:string;destination:string;contact_name:string;booking_reference:string;created_at:Date};
export default async function Shipments(){
 if(!await isAdmin())redirect("/admin/login");
 let records:Row[]=[],error="";
 try{records=await db()`SELECT s.id,s.tracking_number,s.status,q.origin,q.destination,q.contact_name,b.reference AS booking_reference,s.created_at FROM shipments s JOIN bookings b ON b.id=s.booking_id JOIN quote_requests q ON q.id=b.quote_id ORDER BY s.created_at DESC LIMIT 200` as Row[];}
 catch{error="Cannot load shipments. Check database connectivity and migrations.";}
 return <main className="space-y-6 p-4 md:p-7 xl:p-9">
 <div><Badge variant="secondary">Operations</Badge><h1 className="mt-3 text-3xl font-semibold tracking-tight">Shipments</h1><p className="mt-2 text-muted-foreground">Manage consignment milestones and delivery exceptions.</p></div>
 <div className="grid gap-3 sm:grid-cols-3">{[["Shipments",records.length],["In transit",records.filter(x=>x.status==="IN_TRANSIT").length],["Exceptions",records.filter(x=>x.status==="EXCEPTION").length]].map(([label,value])=><Card key={label}><CardHeader><CardDescription>{label}</CardDescription></CardHeader><CardContent className="text-3xl font-semibold tabular-nums tabular-nums">{value}</CardContent></Card>)}</div>
 <Card><CardHeader><CardTitle className="flex items-center gap-2"><PackageCheck className="size-5"/> Shipment register</CardTitle><CardDescription>Latest 200 records · open a consignment to manage its progress</CardDescription></CardHeader><CardContent className="overflow-x-auto p-0">{error?<p role="alert" className="p-6 text-destructive">{error}</p>:!records.length?<p className="p-10 text-center text-muted-foreground">No shipments yet. Confirm a booking to create one.</p>:<Table><TableHeader><TableRow>{["Tracking","Customer","Route","Booking","Status",""].map(t=><TableHead key={t} className="px-4">{t}</TableHead>)}</TableRow></TableHeader><TableBody>{records.map(s=><TableRow key={s.id}><TableCell className="px-4 font-semibold">{s.tracking_number}</TableCell><TableCell className="px-4">{s.contact_name}</TableCell><TableCell className="max-w-56 truncate px-4">{s.origin} → {s.destination}</TableCell><TableCell className="px-4">{s.booking_reference}</TableCell><TableCell className="px-4"><Badge variant={s.status==="EXCEPTION"?"destructive":"secondary"}>{s.status.replaceAll("_"," ")}</Badge></TableCell><TableCell className="px-4"><Button size="sm" variant="outline" render={<Link href={"/dashboard/shipments/"+s.id}/>}>Open →</Button></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card></main>;
}
