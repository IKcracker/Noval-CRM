"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ArrowUpRight,CalendarClock,Clock,ExternalLink,Info,MapPin,Package,Route,Search,UserRound} from "lucide-react";
import {RouteRoadMap} from "@/components/admin/route-road-map";
import {VehicleThumbnail} from "@/components/admin/vehicle-thumbnail";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Skeleton} from "@/components/ui/skeleton";
import {guessVehicleType} from "@/lib/vehicle-type";
import {place} from "@/lib/places";
export type Journey={id:string;reference:string;status:string;origin:string;destination:string;service_type:string;weight_kg:string|null;driver_name:string;vehicle_registration:string;make_model:string|null;scheduled_departure:string;scheduled_arrival:string;customer:string;booking_id:string;shipment_id:string|null;tracking_number:string|null;shipment_status:string|null};
type Point={lat:number;lon:number;label:string};
type RoadRoute={origin:Point;destination:Point;geometry:number[][];distanceKm:number;durationMinutes:number};
type Stage="SCHEDULED"|"MOVING"|"EXCEPTION"|"DONE"|"CANCELLED";
const stages:Record<Stage,{label:string;dot:string}>={
 SCHEDULED:{label:"Scheduled",dot:"bg-zinc-400"},MOVING:{label:"On the road",dot:"bg-amber-400"},
 EXCEPTION:{label:"Exception",dot:"bg-red-500"},DONE:{label:"Completed",dot:"bg-emerald-500"},CANCELLED:{label:"Cancelled",dot:"bg-zinc-300"}
};
function stageOf(r:Journey):Stage{
 const s=r.shipment_status;
 if(r.status==="CANCELLED"||s==="CANCELLED")return "CANCELLED";
 if(r.status==="COMPLETED"||s==="DELIVERED"||s==="RETURNED")return "DONE";
 if(s==="EXCEPTION")return "EXCEPTION";
 return !s||s==="SCHEDULED"?"SCHEDULED":"MOVING";
}
const tabs=[{key:"ACTIVE",name:"Active"},{key:"DONE",name:"Completed"},{key:"ALL",name:"All"}] as const;
// Approximate city centres, used only for the straight-line fallback when road routing is unavailable.
const cities:Record<string,[number,number]>={
 "pretoria":[-25.7479,28.2293],"johannesburg":[-26.2041,28.0473],"centurion":[-25.8603,28.1894],
 "cape town":[-33.9249,18.4241],"durban":[-29.8587,31.0218],"polokwane":[-23.9045,29.4689],
 "bloemfontein":[-29.0852,26.1596],"gqeberha":[-33.9608,25.6022],"port elizabeth":[-33.9608,25.6022],
 "east london":[-33.0153,27.9116],"george":[-33.9644,22.4617],"stellenbosch":[-33.9321,18.8602],
 "pietermaritzburg":[-29.6094,30.3794],"nelspruit":[-25.4745,30.9703],"mbombela":[-25.4745,30.9703],
 "witbank":[-25.8713,29.2332],"emalahleni":[-25.8713,29.2332],"kimberley":[-28.7282,24.7499],
 "rustenburg":[-25.6676,27.2421],"midrand":[-25.9992,28.1263]
};
function cityPoint(input:string):Point|null{
 const lower=input.trim().toLowerCase();
 const match=Object.entries(cities).find(([name])=>lower===name||lower.startsWith(name+",")||lower.endsWith(", "+name));
 return match?{lat:match[1][0],lon:match[1][1],label:input}:null;
}
function straightKm(a:Point,b:Point){
 const r=Math.PI/180,dLat=(b.lat-a.lat)*r,dLon=(b.lon-a.lon)*r;
 const h=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLon/2)**2;
 return Math.round(6371*2*Math.asin(Math.sqrt(h)));
}
const when=(iso:string)=>new Date(iso).toLocaleString("en-ZA",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Africa/Johannesburg"});
const hours=(minutes:number)=>minutes<60?minutes+" min":Math.floor(minutes/60)+" h "+String(minutes%60).padStart(2,"0")+" min";
function Pill({stage}:{stage:Stage}){return <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-medium shadow-xs"><span className={"size-1.5 rounded-full "+stages[stage].dot}/>{stages[stage].label}</span>;}
export function RouteSelector({routes,now}:{routes:Journey[];now:number}){
 const [tab,setTab]=useState<(typeof tabs)[number]["key"]>("ACTIVE"),[filter,setFilter]=useState("");
 const [id,setId]=useState(()=>(routes.find(r=>["SCHEDULED","MOVING","EXCEPTION"].includes(stageOf(r)))??routes[0]).id);
 const [road,setRoad]=useState<{id:string;route?:RoadRoute;error?:string}|null>(null);
 const selected=routes.find(r=>r.id===id)??routes[0];
 useEffect(()=>{
  let active=true;
  fetch("/api/admin/routing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin:selected.origin,destination:selected.destination})})
   .then(async res=>{const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error(body.error||"Road route unavailable");if(active)setRoad({id:selected.id,route:body});})
   .catch(e=>{if(active)setRoad({id:selected.id,error:e instanceof Error?e.message:"Road route unavailable"});});
  return ()=>{active=false;};
 },[selected.id,selected.origin,selected.destination]);
 const counts=useMemo(()=>({ACTIVE:routes.filter(r=>["SCHEDULED","MOVING","EXCEPTION"].includes(stageOf(r))).length,DONE:routes.filter(r=>stageOf(r)==="DONE").length,ALL:routes.length}),[routes]);
 const filtered=useMemo(()=>{const q=filter.trim().toLowerCase();return routes.filter(r=>{const s=stageOf(r);return (tab==="ALL"||(tab==="DONE"?s==="DONE":["SCHEDULED","MOVING","EXCEPTION"].includes(s)))&&(!q||[r.reference,r.origin,r.destination,r.driver_name,r.vehicle_registration,r.customer,r.tracking_number??""].some(v=>v.toLowerCase().includes(q)));});},[routes,filter,tab]);
 const current=road?.id===selected.id?road:null,loading=!current;
 const fallbackFrom=cityPoint(selected.origin),fallbackTo=cityPoint(selected.destination);
 const approximate=!loading&&!current?.route&&fallbackFrom&&fallbackTo?{from:fallbackFrom,to:fallbackTo,km:straightKm(fallbackFrom,fallbackTo)}:null;
 const directions="https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&from="+encodeURIComponent(selected.origin+", South Africa")+"&to="+encodeURIComponent(selected.destination+", South Africa");
 const stage=stageOf(selected),start=new Date(selected.scheduled_departure).getTime(),end=new Date(selected.scheduled_arrival).getTime();
 const elapsed=stage==="MOVING"||stage==="EXCEPTION"?Math.min(100,Math.max(0,Math.round((now-start)/(end-start)*100))):stage==="DONE"?100:0;
 return <div id="trips" className="grid scroll-mt-20 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
  <section className="flex min-w-0 flex-col rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(17,26,21,.03),0_4px_16px_rgba(17,26,21,.025)]">
   <div className="space-y-3 p-4 pb-3"><div><h2 className="text-[17px] font-semibold tracking-tight">Trips</h2><p className="mt-0.5 text-[12.5px] text-muted-foreground">Select a trip to view its route</p></div>
    <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="h-9 pl-9" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Trip, city, driver or vehicle..." aria-label="Search trips"/></div>
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1" role="tablist">{tabs.map(t=><button key={t.key} type="button" role="tab" aria-selected={tab===t.key} onClick={()=>setTab(t.key)} className={"flex h-7 items-center justify-center gap-1.5 rounded-md text-[12px] font-medium transition "+(tab===t.key?"bg-card text-foreground shadow-xs":"text-muted-foreground hover:text-foreground")}>{t.name}<span className="text-[10.5px] tabular-nums text-muted-foreground">{counts[t.key]}</span></button>)}</div>
   </div>
   <div className="relative min-h-0 flex-1"><div className="max-h-[520px] space-y-2 overflow-y-auto px-4 pb-4 xl:absolute xl:inset-0 xl:max-h-none">{filtered.length===0?<p className="py-10 text-center text-[12.5px] text-muted-foreground">No trips match this view.</p>:filtered.map(r=>{const active=r.id===selected.id;return <button type="button" key={r.id} onClick={()=>setId(r.id)} aria-pressed={active} className={"w-full rounded-xl border p-3.5 text-left transition "+(active?"border-emerald-300 bg-emerald-50/60 ring-1 ring-emerald-200":"border-border bg-card hover:border-emerald-200 hover:bg-muted/40")}>
    <div className="flex items-center justify-between gap-2"><span className="text-[13px] font-semibold">{r.reference}</span><Pill stage={stageOf(r)}/></div>
    <p className="mt-2.5 flex items-center gap-1.5 text-[13px] font-medium" title={r.origin+" → "+r.destination}><MapPin className="size-3.5 shrink-0 text-muted-foreground"/><span className="truncate">{place(r.origin)} → {place(r.destination)}</span></p>
    <div className="mt-2 flex items-center justify-between gap-2 text-[11.5px] text-muted-foreground"><span className="flex min-w-0 items-center gap-1"><UserRound className="size-3 shrink-0"/><span className="truncate">{r.driver_name} · {r.vehicle_registration}</span></span><span className="shrink-0 tabular-nums">{new Date(r.scheduled_departure).toLocaleDateString("en-ZA",{day:"numeric",month:"short",timeZone:"Africa/Johannesburg"})}</span></div>
   </button>;})}</div></div>
  </section>
  <div className="min-w-0 space-y-4">
   <section className="relative h-[540px] overflow-hidden rounded-2xl border border-border bg-muted shadow-[0_1px_2px_rgba(17,26,21,.03),0_4px_16px_rgba(17,26,21,.025)]">
    {loading?<div className="grid size-full place-items-center"><div className="text-center"><Skeleton className="mx-auto size-10 rounded-full"/><p className="mt-3 text-[12.5px] text-muted-foreground">Calculating road route…</p></div></div>
    :current?.route?<RouteRoadMap key={selected.id} className="h-full" geometry={current.route.geometry} origin={current.route.origin} destination={current.route.destination}/>
    :approximate?<RouteRoadMap key={selected.id+"-approx"} className="h-full" approximate geometry={[[approximate.from.lat,approximate.from.lon],[approximate.to.lat,approximate.to.lon]]} origin={approximate.from} destination={approximate.to}/>
    :<div className="grid size-full place-items-center px-6 text-center"><div><MapPin className="mx-auto size-7 text-muted-foreground"/><p className="mt-3 text-sm font-semibold">Map unavailable for this trip</p><p className="mx-auto mt-1 max-w-sm text-[12.5px] text-muted-foreground">{current?.error} The locations aren&apos;t in the approximate city list either; use the directions link instead.</p></div></div>}
    <div className="absolute left-3 top-3 z-[1000] w-[min(340px,calc(100%-1.5rem))] rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
     <div className="flex items-center justify-between gap-2"><span className="text-[12px] font-medium text-muted-foreground">{selected.reference}</span><Pill stage={stage}/></div>
     <ol className="relative mt-3 space-y-3 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-border">
      <li className="relative flex gap-3"><span className="mt-1 size-[11px] shrink-0 rounded-full border-2 border-card bg-foreground ring-1 ring-foreground/20"/><span className="min-w-0"><span className="block truncate text-[13.5px] font-semibold" title={selected.origin}>{selected.origin}</span><span className="block text-[11.5px] text-muted-foreground">Collection · {when(selected.scheduled_departure)}</span></span></li>
      <li className="relative flex gap-3"><span className="mt-1 size-[11px] shrink-0 rounded-full border-2 border-card bg-primary ring-1 ring-primary/30"/><span className="min-w-0"><span className="block truncate text-[13.5px] font-semibold" title={selected.destination}>{selected.destination}</span><span className="block text-[11.5px] text-muted-foreground">Delivery · {when(selected.scheduled_arrival)}</span></span></li>
     </ol>
     <div className="mt-3.5 flex flex-wrap gap-2 border-t border-border pt-3 text-[12px]">
      {loading?<Skeleton className="h-6 w-40"/>:current?.route?<><span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700"><Route className="size-3.5"/>{current.route.distanceKm.toLocaleString("en-ZA")} km by road</span><span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-medium"><Clock className="size-3.5"/>≈ {hours(current.route.durationMinutes)} driving</span></>
      :approximate?<span className="inline-flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-800"><Info className="mt-px size-3.5 shrink-0"/>Road route unavailable · ≈ {approximate.km.toLocaleString("en-ZA")} km straight line</span>
      :<span className="text-muted-foreground">No distance estimate available</span>}
     </div>
    </div>
    <Button nativeButton={false} size="sm" variant="outline" className="absolute right-3 top-3 z-[1000] h-9 bg-card/95 px-3 shadow-sm backdrop-blur" render={<a href={directions} target="_blank" rel="noopener noreferrer"/>}>Directions <ArrowUpRight className="size-3.5"/></Button>
   </section>
   <section className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-[0_1px_2px_rgba(17,26,21,.03),0_4px_16px_rgba(17,26,21,.025)] md:grid-cols-[1.2fr_1fr_1.3fr]">
    <div className="flex items-center gap-4 bg-card p-4"><VehicleThumbnail type={guessVehicleType(selected.make_model)} className="h-20 w-32 shrink-0 rounded-lg border-0"/><div className="min-w-0"><p className="text-[11.5px] text-muted-foreground">Vehicle</p><p className="mt-0.5 truncate text-[16px] font-semibold tracking-tight">{selected.vehicle_registration}</p><p className="truncate text-[12px] text-muted-foreground">{selected.make_model??"Model not recorded"}</p></div></div>
    <div className="space-y-3 bg-card p-4"><div><p className="text-[11.5px] text-muted-foreground">Driver</p><p className="mt-0.5 flex items-center gap-1.5 text-[14px] font-semibold"><UserRound className="size-3.5"/>{selected.driver_name}</p></div><div><p className="text-[11.5px] text-muted-foreground">Customer · cargo</p><p className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] font-medium"><Package className="size-3.5 shrink-0"/><span className="truncate">{selected.customer}{selected.weight_kg?" · "+Number(selected.weight_kg).toLocaleString("en-ZA")+" kg":""}</span></p></div></div>
    <div className="flex flex-col justify-between gap-3 bg-card p-4">
     <div><div className="flex items-center justify-between text-[11.5px] text-muted-foreground"><span className="flex items-center gap-1"><CalendarClock className="size-3.5"/>Scheduled window</span><span className="font-semibold tabular-nums text-foreground">{elapsed}% elapsed</span></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={elapsed} aria-valuemin={0} aria-valuemax={100} aria-label="Share of the scheduled trip window elapsed"><div className={"h-full rounded-full "+(stage==="EXCEPTION"?"bg-red-400":"bg-primary")} style={{width:elapsed+"%"}}/></div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">Based on scheduled times, not live GPS.</p></div>
     <div className="flex gap-2"><Button nativeButton={false} size="sm" variant="outline" className="h-8 flex-1" render={<Link href={"/dashboard/bookings/"+selected.booking_id}/>}>Booking <ExternalLink className="size-3.5"/></Button>{selected.shipment_id&&<Button nativeButton={false} size="sm" className="h-8 flex-1" render={<Link href={"/dashboard/shipments/"+selected.shipment_id}/>}>Shipment <ExternalLink className="size-3.5"/></Button>}</div>
    </div>
   </section>
  </div>
 </div>;
}
