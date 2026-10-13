"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {ArrowUpRight,CalendarDays,MapPin,Search,Truck} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
type Journey={id:string;reference:string;status:string;origin:string;destination:string;driver_name:string;vehicle_registration:string;scheduled_departure:string;scheduled_arrival:string;customer:string;booking_id:string};
const cities:Record<string,[number,number]>={
 "pretoria":[-25.7479,28.2293],"johannesburg":[-26.2041,28.0473],"centurion":[-25.8603,28.1894],
 "cape town":[-33.9249,18.4241],"durban":[-29.8587,31.0218],"polokwane":[-23.9045,29.4689],
 "bloemfontein":[-29.0852,26.1596],"gqeberha":[-33.9608,25.6022],"port elizabeth":[-33.9608,25.6022],
 "east london":[-33.0153,27.9116],"george":[-33.9644,22.4617],"stellenbosch":[-33.9321,18.8602],
 "pietermaritzburg":[-29.6094,30.3794],"nelspruit":[-25.4745,30.9703],"mbombela":[-25.4745,30.9703],
 "witbank":[-25.8713,29.2332],"emalahleni":[-25.8713,29.2332],"kimberley":[-28.7282,24.7499],
 "rustenburg":[-25.6676,27.2421],"midrand":[-25.9992,28.1263]
};
function cityPoint(input:string):[number,number]|null{
 const lower=input.trim().toLowerCase();
 const match=Object.entries(cities).find(([name])=>lower===name || lower.startsWith(name+",") || lower.endsWith(", "+name));
 return match?.[1]??null;
}
export function RouteSelector({routes}:{routes:Journey[]}){
 const [id,setId]=useState(routes[0].id),[filter,setFilter]=useState("");
 const filtered=useMemo(()=>routes.filter(r=>[r.reference,r.origin,r.destination,r.driver_name,r.vehicle_registration,r.customer].some(v=>v.toLowerCase().includes(filter.trim().toLowerCase()))),[routes,filter]);
 const selected=routes.find(r=>r.id===id)??routes[0];
 const origin=cityPoint(selected.origin),destination=cityPoint(selected.destination);
 const directions="https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route="+
 (origin?encodeURIComponent(origin.join(",")):"")+"%3B"+(destination?encodeURIComponent(destination.join(",")):"");
 const bbox=(origin&&destination)?(()=>{
  const pad=Math.max(.4,Math.abs(origin[0]-destination[0])*.25,Math.abs(origin[1]-destination[1])*.25);
  return [Math.min(origin[1],destination[1])-pad,Math.min(origin[0],destination[0])-pad,
    Math.max(origin[1],destination[1])+pad,Math.max(origin[0],destination[0])+pad].join(",");
 })():null;
 const embed=bbox?"https://www.openstreetmap.org/export/embed.html?bbox="+encodeURIComponent(bbox)+"&layer=mapnik&marker="+
 encodeURIComponent(destination!.join(",")):null;
 return <div className="grid gap-5 xl:grid-cols-[370px_minmax(0,1fr)]">
  <Card className="min-w-0 overflow-hidden"><CardHeader><CardTitle>Trip register</CardTitle><CardDescription>Choose a scheduled movement to inspect</CardDescription><div className="relative mt-3"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"/><Input className="pl-9" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Find trip, route, driver..."/></div></CardHeader>
   <CardContent className="max-h-[620px] space-y-2 overflow-y-auto">{filtered.length===0?<p className="py-8 text-center text-sm text-muted-foreground">No trips match your search.</p>:filtered.map(r=><button type="button" key={r.id} onClick={()=>setId(r.id)} className={`w-full rounded-xl border p-4 text-left transition hover:border-primary/30 ${selected.id===r.id?"border-primary bg-secondary/70":"border-border bg-background"}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-bold">{r.reference}</span><Badge variant={selected.id===r.id?"default":"outline"}>{r.status.replaceAll("_"," ")}</Badge></div><p className="mt-3 text-sm font-semibold">{r.origin} → {r.destination}</p><p className="mt-2 text-xs text-muted-foreground">{r.customer} · {r.vehicle_registration}</p></button>)}</CardContent>
  </Card>
  <div className="min-w-0 space-y-5"><Card className="overflow-hidden"><CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3"><div><CardTitle>{selected.origin} → {selected.destination}</CardTitle><CardDescription>{selected.reference} · OpenStreetMap · approximate city locations</CardDescription></div><Button size="sm" variant="outline" render={<a href={directions} target="_blank" rel="noopener noreferrer"/>}>Plan driving route <ArrowUpRight className="size-4"/></Button></CardHeader><CardContent>{embed?<iframe title={"OpenStreetMap overview for "+selected.reference} key={selected.id} src={embed} className="h-[400px] w-full rounded-xl border border-border md:h-[490px]" referrerPolicy="strict-origin-when-cross-origin" loading="lazy" allowFullScreen/>:<div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/40 px-8 text-center"><MapPin className="size-9 text-muted-foreground"/><h2 className="text-lg font-semibold">Map location not available</h2><p className="max-w-md text-sm text-muted-foreground">The origin or destination is not among the supported city names. Open OpenStreetMap to search for the exact addresses.</p><Button variant="outline" render={<a href={directions} target="_blank" rel="noopener noreferrer"/>}>Open OpenStreetMap directions <ArrowUpRight className="size-4"/></Button></div>}<p className="mt-3 text-xs text-muted-foreground">Map shows approximate city locations, not the actual driving path or a live driver position. Use “Plan driving route” for detailed road directions.</p></CardContent></Card>
   <Card><CardHeader><CardTitle>Dispatch details</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Driver</p><p className="mt-1 font-semibold">{selected.driver_name}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Vehicle</p><p className="mt-1 font-semibold">{selected.vehicle_registration}</p></div><div><p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground"><CalendarDays className="size-3"/> Scheduled departure</p><p className="mt-1 font-semibold">{new Date(selected.scheduled_departure).toLocaleString("en-ZA")}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Scheduled arrival</p><p className="mt-1 font-semibold">{new Date(selected.scheduled_arrival).toLocaleString("en-ZA")}</p></div><div className="sm:col-span-2"><Button variant="outline" render={<Link href={"/dashboard/bookings/"+selected.booking_id}/>}>Open booking <Truck className="size-4"/></Button></div></CardContent></Card>
  </div>
 </div>;
}
