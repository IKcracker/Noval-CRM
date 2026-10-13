"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ArrowRight,ArrowUpRight,Clock3,MapPin,Navigation2,PackageCheck,Search,Truck,AlertTriangle,Route} from "lucide-react";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {RouteRoadMap} from "@/components/admin/route-road-map";
import {VehicleThumbnail} from "@/components/admin/vehicle-thumbnail";
type Shipment={id:string;tracking_number:string;status:string;contact_name:string;origin:string;destination:string;booking_reference:string;driver_name:string|null;vehicle_registration:string|null;weight_kg:string|null};
type RoadRoute={origin:{lat:number;lon:number;label:string};destination:{lat:number;lon:number;label:string};distanceKm:number;durationMinutes:number;geometry:number[][]};
type Filter="ALL"|"MOVING"|"EXCEPTION";
function pretty(status:string){return status.replaceAll("_"," ").toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());}
export function PremiumDeliveryBoard({shipments}:{shipments:Shipment[]}){
 const [activeId,setActiveId]=useState(shipments[0]?.id||"");
 const [query,setQuery]=useState(""),[filter,setFilter]=useState<Filter>("ALL");
 const [route,setRoute]=useState<RoadRoute|null>(null),[loading,setLoading]=useState(false),[routeError,setRouteError]=useState("");
 const active=shipments.find(s=>s.id===activeId)??shipments[0];
 const filtered=useMemo(()=>shipments.filter(s=>{
  const matches=(!query.trim()||[s.tracking_number,s.contact_name,s.origin,s.destination,s.vehicle_registration||""].some(v=>v.toLowerCase().includes(query.toLowerCase().trim())));
  return matches&&(filter==="ALL"||(filter==="EXCEPTION"?s.status==="EXCEPTION":["PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY"].includes(s.status)));
 }),[shipments,query,filter]);
 useEffect(()=>{
  if(!active)return;
  const ac=new AbortController();let alive=true;
  async function load(){
   setLoading(true);setRoute(null);setRouteError("");
   try{
    const response=await fetch("/api/admin/routing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin:active.origin,destination:active.destination}),signal:ac.signal});
    const json=await response.json();
    if(!response.ok)throw new Error(json.error||"Routing service unavailable");
    if(alive)setRoute(json as RoadRoute);
   }catch(e){if(alive&&!ac.signal.aborted)setRouteError(e instanceof Error?e.message:"Unable to calculate route");}
   finally{if(alive)setLoading(false);}
  }
  void load();
  return ()=>{alive=false;ac.abort();};
 },[active?.id,active?.origin,active?.destination]);
 const osm=route?"https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route="+encodeURIComponent(route.origin.lat+","+route.origin.lon+";"+route.destination.lat+","+route.destination.lon):null;
 return <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl">
  <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
   <div><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Truck className="size-4"/></span><CardTitle className="text-[15px] font-semibold">Ongoing deliveries</CardTitle><Badge variant="secondary">{shipments.length}</Badge></div><CardDescription className="mt-1.5">Select a consignment to inspect the planned road route</CardDescription></div>
   <Button nativeButton={false} variant="outline" size="sm" render={<Link href="/dashboard/shipments"/>}>All shipments <ArrowUpRight className="size-3.5"/></Button>
  </CardHeader>
  <div className="grid min-h-132 lg:grid-cols-[minmax(305px,0.91fr)_minmax(0,1.38fr)]">
   <div className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
    <div className="space-y-3 border-b border-border p-4">
     <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input aria-label="Search ongoing deliveries" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find shipment or customer..." className="h-9 bg-muted/40 pl-9"/></div>
     <div className="flex gap-1.5" role="group" aria-label="Filter delivery status">{([{id:"ALL",label:"All"},{id:"MOVING",label:"On the way"},{id:"EXCEPTION",label:"Exceptions"}] as const).map(x=><Button size="sm" key={x.id} variant={filter===x.id?"default":"ghost"} className={filter===x.id?"shadow-sm":""} onClick={()=>setFilter(x.id)}>{x.label}</Button>)}</div>
    </div>
    <div className="max-h-110 min-h-72 flex-1 space-y-2 overflow-y-auto p-3">
    {!filtered.length?<div className="grid h-44 place-items-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">No shipments match these filters.</div>:filtered.map(s=><button type="button" key={s.id} onClick={()=>setActiveId(s.id)} className={"group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-emerald-200 hover:bg-emerald-50/30 "+(active?.id===s.id?"border-emerald-400 bg-emerald-50/65 shadow-[0_0_0_1px_rgba(59,130,246,.13)]":"border-border bg-card")}>
     <VehicleThumbnail className="h-19 w-25 shrink-0"/>
     <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-[13px] font-semibold">{s.tracking_number}</p>{s.status==="EXCEPTION"?<AlertTriangle className="size-4 shrink-0 text-red-500"/>:<span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500"/>}</div><p className="mt-1 truncate text-[11px] text-muted-foreground">{s.origin} <ArrowRight className="inline size-3"/> {s.destination}</p><p className="mt-1.5 truncate text-[11px] text-muted-foreground">{s.contact_name}</p><p className="mt-1.5 text-[10px] font-semibold text-emerald-700">{pretty(s.status)}</p></div>
    </button>)}
    </div>
   </div>
   <div className="flex min-w-0 flex-col bg-card">
    {active?<><div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 md:px-5"><div><p className="text-[11px] font-medium text-muted-foreground">Selected shipment</p><p className="mt-0.5 text-sm font-semibold">{active.tracking_number} <span className="ml-1 text-xs font-normal text-muted-foreground">· {pretty(active.status)}</span></p></div><Button nativeButton={false} size="sm" variant="outline" render={<Link href={"/dashboard/shipments/"+active.id}/>}>Open details <ArrowUpRight className="size-3.5"/></Button></div>
    <div className="relative mx-4 min-h-72 flex-1 overflow-hidden rounded-xl border border-border bg-[#f3f7f4] md:mx-5">
     {route?.geometry?.length?<RouteRoadMap geometry={route.geometry} origin={route.origin} destination={route.destination}/>:<div className="premium-grid flex h-full min-h-72 flex-col items-center justify-center gap-3 px-5 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">{loading?<Navigation2 className="size-6 animate-pulse"/>:<MapPin className="size-6"/>}</span>
      <p className="text-sm font-semibold">{loading?"Preparing road map":"Route preview unavailable"}</p><p className="max-w-73 text-xs leading-relaxed text-muted-foreground">{loading?"Calculating road distance and driving time...":routeError||"Configure routing to view road directions here."}</p>
      <a href={"https://www.openstreetmap.org/search?query="+encodeURIComponent(active.origin+", South Africa")} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary underline-offset-2 hover:underline">Explore origin on OpenStreetMap</a>
     </div>}
    </div>
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 md:p-5">
     {[
      {label:"Distance",value:route?route.distanceKm.toLocaleString("en-ZA")+" km":"—",icon:Route},
      {label:"Drive estimate",value:route?Math.round(route.durationMinutes)+" min":"—",icon:Clock3},
      {label:"Cargo weight",value:active.weight_kg?Number(active.weight_kg).toLocaleString("en-ZA")+" kg":"Not set",icon:PackageCheck},
      {label:"Vehicle",value:active.vehicle_registration||"Not assigned",icon:Truck}
     ].map(x=><div key={x.label} className="min-w-0 border-r border-border last:border-r-0"><p className="flex items-center gap-1 text-[10px] text-muted-foreground"><x.icon className="size-3"/>{x.label}</p><p className="mt-1 truncate text-xs font-semibold" title={x.value}>{x.value}</p></div>)}
    </div>
    {osm&&<div className="border-t px-5 py-2.5 text-right"><a href={osm} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">Open full road directions <ArrowUpRight className="size-3"/></a></div>}
    </>:<div className="grid min-h-110 place-items-center px-8 text-center"><div><PackageCheck className="mx-auto size-9 text-muted-foreground"/><p className="mt-3 font-medium">No active consignments</p><p className="mt-1 text-sm text-muted-foreground">Confirmed shipments will appear here as they progress.</p><Button nativeButton={false} className="mt-4" size="sm" variant="outline" render={<Link href="/dashboard/shipments"/>}>View shipment register</Button></div></div>}
   </div>
  </div>
 </Card>;
}
