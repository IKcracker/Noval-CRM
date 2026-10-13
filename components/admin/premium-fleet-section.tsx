import Link from "next/link";
import {AlertTriangle,ArrowUpRight,CalendarClock,ChevronRight,ClipboardList,Truck,Users} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import {QuoteActivityChart} from "@/components/admin/quote-activity-chart";
import {VehicleThumbnail} from "@/components/admin/vehicle-thumbnail";
import {guessVehicleType} from "@/lib/vehicle-type";
export type FleetVehicle={id:string;registration:string;make_model:string;capacity_kg:string;status:string;active_trip:string|null};
export type QueueCounts={reviewing:number;pending_bookings:number;exceptions:number;fleet_attention:number};
export function PremiumFleetSection({vehicles,queue,dates}:{vehicles:FleetVehicle[];queue:QueueCounts;dates:{day:string;label:string;count:number}[]}){
 const queues=[
  {name:"Quotations needing review",count:queue.reviewing,icon:ClipboardList,href:"/dashboard/quotes",tone:"text-emerald-600 bg-emerald-50"},
  {name:"Pending dispatch",count:queue.pending_bookings,icon:CalendarClock,href:"/dashboard/bookings?status=PENDING",tone:"text-amber-600 bg-amber-50"},
  {name:"Delivery exceptions",count:queue.exceptions,icon:AlertTriangle,href:"/dashboard/shipments?status=EXCEPTION",tone:"text-red-600 bg-red-50"},
  {name:"Fleet compliance checks",count:queue.fleet_attention,icon:Users,href:"/dashboard/fleet",tone:"text-violet-600 bg-violet-50"}
 ];
 return <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]">
 <Card className="min-w-0 rounded-2xl"><CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-[15px] font-semibold">Fleet overview</CardTitle><CardDescription className="mt-1">Registered vehicles and active trip assignments</CardDescription></div><Button nativeButton={false} variant="outline" size="sm" render={<Link href="/dashboard/fleet"/>}>Manage fleet <ArrowUpRight className="size-3.5"/></Button></CardHeader><CardContent>{vehicles.length?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{vehicles.map(v=><Link href="/dashboard/fleet" key={v.id} className="group overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md"><div className="relative"><VehicleThumbnail type={guessVehicleType(v.make_model)} className="h-30 rounded-none border-0"/><Badge variant={v.status==="VERIFIED"?"secondary":"outline"} className="absolute left-3 top-3 bg-white/95 text-[10px] shadow-sm">{v.status.replaceAll("_"," ")}</Badge></div><div className="space-y-1.5 px-3 pb-3 pt-2"><p className="flex items-center justify-between text-[13px] font-semibold">{v.registration}<ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"/></p><p className="truncate text-[11px] text-muted-foreground">{v.make_model}</p><div className="flex items-center justify-between gap-2 border-t pt-2 text-[10px] text-muted-foreground"><span>{Number(v.capacity_kg).toLocaleString("en-ZA")} kg capacity</span><span className={v.active_trip?"font-semibold text-emerald-600":"text-muted-foreground"}>{v.active_trip?"Assigned":"Unassigned"}</span></div></div></Link>)}</div>:<div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center"><Truck className="mx-auto size-9 text-emerald-300"/><p className="mt-3 text-sm font-semibold">No vehicles registered yet</p><p className="mt-1 text-xs text-muted-foreground">Register vehicles in Fleet Management to populate this workspace.</p><Button nativeButton={false} size="sm" variant="outline" className="mt-4" render={<Link href="/dashboard/fleet"/>}>Manage fleet</Button></div>}</CardContent></Card>
 <div className="space-y-4">
  <Card className="rounded-2xl"><CardHeader><CardTitle className="text-[15px] font-semibold">Attention required</CardTitle><CardDescription className="mt-1">Operational items needing review</CardDescription></CardHeader><CardContent className="space-y-2">{queues.map(q=><Link href={q.href} key={q.name} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"><span className={"flex size-9 shrink-0 items-center justify-center rounded-lg "+q.tone}><q.icon className="size-4"/></span><span className="min-w-0 flex-1 truncate text-[12px] font-medium">{q.name}</span><span className="text-lg font-semibold tabular-nums">{q.count}</span><ChevronRight className="size-3.5 text-muted-foreground"/></Link>)}</CardContent></Card>
  <Card className="rounded-2xl"><CardHeader><CardTitle className="text-[15px] font-semibold">Quotation activity</CardTitle><CardDescription>Submitted enquiries · last 14 days</CardDescription></CardHeader><CardContent><QuoteActivityChart data={dates}/></CardContent></Card>
 </div>
 </div>;
}
