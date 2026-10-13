import Link from "next/link";
import {redirect} from "next/navigation";
import {MapPinned,Truck,Clock3,Navigation,ExternalLink} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardHeader,CardDescription} from "@/components/ui/card";
import {RouteSelector} from "./route-selector";
type Journey={upcoming:boolean;id:string;reference:string;status:string;origin:string;destination:string;driver_name:string;vehicle_registration:string;scheduled_departure:string;scheduled_arrival:string;customer:string;booking_id:string};
export default async function RoutePlanning(){
 if(!await isAdmin())redirect("/admin/login");
 let routes:Journey[]=[],error="";
 try {
  const sql=db();
  const result=await sql`SELECT (t.scheduled_departure>now()) AS upcoming,t.id,t.reference,t.status,q.origin,q.destination,t.driver_name,t.vehicle_registration,t.scheduled_departure,t.scheduled_arrival,q.contact_name AS customer,b.id AS booking_id FROM trips t JOIN bookings b ON b.id=t.booking_id JOIN quote_requests q ON q.id=b.quote_id ORDER BY t.scheduled_departure DESC LIMIT 150`;
  routes=result.map(r=>({...r,scheduled_departure:new Date(r.scheduled_departure).toISOString(),scheduled_arrival:new Date(r.scheduled_arrival).toISOString()})) as Journey[];
 }catch{error="Trip routes are unavailable. Verify the Neon connection and migration 002.";}
 const mapsKey=process.env.GOOGLE_MAPS_EMBED_API_KEY ?? "";
 return <main className="space-y-6 p-5 md:p-8 xl:p-10">
  <div className="flex flex-wrap items-end justify-between gap-4"><div><Badge variant="secondary" className="mb-3"><MapPinned className="size-3.5"/> Dispatch planning</Badge><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Route planning</h1><p className="mt-2 text-sm text-muted-foreground">Inspect confirmed trip routes, scheduled times, vehicles and assigned drivers.</p></div><Button variant="outline" render={<Link href="/dashboard/bookings"/>}><Truck className="size-4"/> Manage bookings</Button></div>
  <div className="grid gap-4 sm:grid-cols-3">{[
  {label:"Scheduled trips",value:routes.length,icon:Navigation},
  {label:"Upcoming departures",value:routes.filter(r=>r.upcoming).length,icon:Clock3},
  {label:"Recorded vehicles",value:new Set(routes.map(r=>r.vehicle_registration)).size,icon:Truck}
  ].map(({label,value,icon:Icon})=><Card key={label}><CardHeader><CardDescription className="flex items-center justify-between">{label}<Icon className="size-4"/></CardDescription></CardHeader><CardContent className="text-3xl font-bold tabular-nums">{value}</CardContent></Card>)}</div>
  {error?<Card><CardContent className="text-sm text-destructive">{error}</CardContent></Card>:routes.length===0?<Card><CardContent className="py-14 text-center text-muted-foreground">No confirmed trips yet. Confirm a booking to create a route.</CardContent></Card>:<RouteSelector routes={routes} mapsKey={mapsKey}/>}
  <p className="flex items-center gap-2 text-xs text-muted-foreground"><ExternalLink className="size-3.5"/> Directions are planned road routes, not live driver GPS or proof of arrival. Exact addresses improve routing accuracy.</p>
 </main>;
}
