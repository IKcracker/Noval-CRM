import Link from "next/link";
import {redirect} from "next/navigation";
import {ArrowRight,ClipboardList,Truck} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import {Table,TableHeader,TableRow,TableHead,TableBody,TableCell} from "@/components/ui/table";
type Booking={id:string;reference:string;status:string;quote_reference:string;contact_name:string;origin:string;destination:string;created_at:Date};
export default async function Bookings(){
 if(!await isAdmin())redirect("/admin/login");
 let bookings:Booking[]=[],error="";
 try{bookings=await db()`SELECT b.id,b.reference,b.status,q.reference AS quote_reference,q.contact_name,q.origin,q.destination,b.created_at FROM bookings b JOIN quote_requests q ON q.id=b.quote_id ORDER BY b.created_at DESC LIMIT 100` as Booking[];}
 catch{error="Booking information is unavailable. Apply db/002_booking_pipeline.sql.";}
 return <main className="space-y-6 p-4 md:p-7 xl:p-9">
 <div className="flex flex-wrap items-center justify-between gap-5"><div><Badge variant="secondary" className="mb-3">Dispatch operations</Badge><h1 className="text-3xl font-semibold tracking-tight">Bookings & dispatch</h1><p className="mt-2 text-sm text-muted-foreground">Accepted quotations, scheduling and confirmed movements.</p></div><Button variant="outline" render={<Link href="/dashboard/quotes"/>}><ClipboardList className="size-4"/> Quotation inbox</Button></div>
 <div className="grid gap-3 sm:grid-cols-3"><Card><CardHeader><CardDescription>All bookings</CardDescription></CardHeader><CardContent className="text-3xl font-semibold tabular-nums">{bookings.length}</CardContent></Card><Card><CardHeader><CardDescription>Pending dispatch</CardDescription></CardHeader><CardContent className="text-3xl font-semibold tabular-nums">{bookings.filter(x=>x.status==="PENDING").length}</CardContent></Card><Card><CardHeader><CardDescription>Confirmed</CardDescription></CardHeader><CardContent className="text-3xl font-semibold tabular-nums">{bookings.filter(x=>x.status==="CONFIRMED").length}</CardContent></Card></div>
 <Card><CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Truck className="size-5"/> Booking register</CardTitle><CardDescription>Showing the latest {bookings.length} records</CardDescription></CardHeader><CardContent className="overflow-x-auto p-0">{error?<p role="alert" className="p-7 text-sm text-destructive">{error}</p>:!bookings.length?<p className="p-14 text-center text-sm text-muted-foreground">No accepted quotations have generated bookings yet.</p>:<Table><TableHeader><TableRow>{["Booking","Customer","Route","Quote","Status","Action"].map(x=><TableHead key={x} className="px-4">{x}</TableHead>)}</TableRow></TableHeader><TableBody>{bookings.map(b=><TableRow key={b.id}><TableCell className="px-4 font-semibold">{b.reference}</TableCell><TableCell className="px-4">{b.contact_name}</TableCell><TableCell className="max-w-56 truncate px-4">{b.origin} → {b.destination}</TableCell><TableCell className="px-4">{b.quote_reference}</TableCell><TableCell className="px-4"><Badge variant={b.status==="CONFIRMED"?"default":"secondary"}>{b.status}</Badge></TableCell><TableCell className="px-4"><Button size="sm" variant="outline" render={<Link href={"/dashboard/bookings/"+b.id}/>}>Open <ArrowRight className="size-4"/></Button></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card></main>;
}
