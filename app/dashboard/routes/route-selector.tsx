"use client";
import {useMemo,useState,useEffect} from "react";
import Link from "next/link";
import {RouteRoadMap} from "@/components/admin/route-road-map";
import {ArrowUpRight,CalendarDays,MapPin,Search,Truck,Route} from "lucide-react";
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
 const [route,setRoute]=useState<null|{origin:{lat:number;lon:number;label:string};destination:{lat:number;lon:number;label:string};geometry:number[][];distanceKm:number;durationMinutes:number}>(null);
 const [error,setError]=useState(""),[loading,setLoading]=useState(false);
 useEffect(()=>{
  let active=true;
  async function calculate(){
   setLoading(true);setRoute(null);setError("");
   const item=routes.find(r=>r.id===id)??routes[0];
   try{
    const response=await fetch("/api/admin/routing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin:item.origin,destination:item.destination})});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||"Unable to calculate driving route");
    if(active)setRoute(result);
   }catch(e){if(active)setError(e instanceof Error?e.message:"Road route unavailable");}
   finally{if(active)setLoading(false);}
  }
  void calculate();return ()=>{active=false;};
 },[id,routes]);
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
  <div className="min-w-0 space-y-5"><Card className="overflow-hidden"><CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3"><div><CardTitle>{selected.origin} → {selected.destination}</CardTitle><CardDescription>{selected.reference} · Calculated road directions</CardDescription></div><Button size="sm" variant="outline" render={<a href={directions} target="_blank" rel="noopener noreferrer"/>}>Plan driving route <ArrowUpRight className="size-4"/></Button></CardHeader><CardContent>
  {loading?<div className="grid h-[420px] place-items-center rounded-xl bg-muted/50 text-sm text-muted-foreground">Calculating road route and travel estimate...</div>:
  route?<><RouteRoadMap geometry={route.geometry} origin={route.origin} destination={route.destination}/><div className="mt-3 flex flex-wrap gap-2"><Badge variant="secondary"><Route className="size-3"/> {route.distanceKm} km by road</Badge><Badge variant="outline">Approx. {Math.round(route.durationMinutes/60*10)/10} hours driving</Badge></div><p className="mt-3 text-xs text-muted-foreground">Calculated road directions only; not live vehicle GPS or a promised ETA.</p></>:
  <div className="grid h-[420px] place-items-center gap-3 rounded-xl bg-muted/50 px-6 text-center"><div><MapPin className="mx-auto mb-3 size-7 text-muted-foreground"/><p className="font-medium">Road route unavailable</p><p className="mt-2 max-w-sm text-sm text-muted-foreground">{error||"No route found."}</p><p className="mt-2 text-xs text-muted-foreground">Configure OPENROUTESERVICE_API_KEY or verify the collection/delivery addresses.</p></div></div>}
  </CardContent></Card>
   <Card><CardHeader><CardTitle>Dispatch details</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Driver</p><p className="mt-1 font-semibold">{selected.driver_name}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Vehicle</p><p className="mt-1 font-semibold">{selected.vehicle_registration}</p></div><div><p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground"><CalendarDays className="size-3"/> Scheduled departure</p><p className="mt-1 font-semibold">{new Date(selected.scheduled_departure).toLocaleString("en-ZA")}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Scheduled arrival</p><p className="mt-1 font-semibold">{new Date(selected.scheduled_arrival).toLocaleString("en-ZA")}</p></div><div className="sm:col-span-2"><Button variant="outline" render={<Link href={"/dashboard/bookings/"+selected.booking_id}/>}>Open booking <Truck className="size-4"/></Button></div></CardContent></Card>
  </div>
 </div>;
}
