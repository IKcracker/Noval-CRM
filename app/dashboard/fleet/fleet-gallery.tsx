"use client";
import {useMemo,useState} from "react";
import {Search,Truck,CalendarClock,ChevronRight} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {VehicleThumbnail} from "@/components/admin/vehicle-thumbnail";
export type VehicleRecord={id:string;registration:string;make_model:string;capacity_kg:string;roadworthy_expiry:string;status:string};
export function FleetGallery({vehicles,onUpdate,busy}:{vehicles:VehicleRecord[];onUpdate:(kind:string,id:string,status:string)=>void;busy:boolean}){
 const [query,setQuery]=useState(""),[status,setStatus]=useState("ALL");
 const filtered=useMemo(()=>vehicles.filter(v=>(status==="ALL"||v.status===status)&&(!query||[v.registration,v.make_model].some(x=>x.toLowerCase().includes(query.toLowerCase().trim())))),[vehicles,query,status]);
 return <div className="space-y-4">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <div><h2 className="text-[16px] font-semibold">Vehicle directory</h2><p className="mt-0.5 text-xs text-muted-foreground">Search and review registered fleet resources</p></div>
   <div className="flex flex-wrap items-center gap-2"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="h-9 w-48 bg-card pl-9" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Truck or model..." aria-label="Search vehicles"/></div>
   <div className="flex gap-1 rounded-lg border bg-card p-1">{[{key:"ALL",name:"All"},{key:"VERIFIED",name:"Verified"},{key:"PENDING",name:"Pending"},{key:"OUT_OF_SERVICE",name:"Inactive"}].map(x=><Button key={x.key} onClick={()=>setStatus(x.key)} size="xs" variant={status===x.key?"default":"ghost"}>{x.name}</Button>)}</div>
   </div>
  </div>
  {filtered.length?<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{filtered.map(v=><article className="group min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_10px_rgba(20,48,92,.03)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg" key={v.id}>
    <div className="relative"><VehicleThumbnail className="h-40 rounded-none border-0"/><Badge className="absolute left-3 top-3 bg-white/95 text-[10px] shadow-sm" variant={v.status==="OUT_OF_SERVICE"?"destructive":"secondary"}>{v.status.replaceAll("_"," ")}</Badge></div>
    <div className="space-y-3 p-4"><div><p className="flex items-center justify-between text-[16px] font-bold tracking-tight">{v.registration}<ChevronRight className="size-4 text-muted-foreground"/></p><p className="mt-1 truncate text-xs text-muted-foreground">{v.make_model}</p></div>
    <div className="grid grid-cols-2 gap-3 border-t pt-3 text-[11px]"><div><p className="text-muted-foreground">Maximum payload</p><p className="mt-1 font-semibold">{Number(v.capacity_kg).toLocaleString("en-ZA")} kg</p></div><div><p className="flex items-center gap-1 text-muted-foreground"><CalendarClock className="size-3"/> Roadworthy until</p><p className="mt-1 font-semibold">{v.roadworthy_expiry}</p></div></div>
    <div className="flex gap-2">{v.status!=="VERIFIED"&&<Button size="sm" className="flex-1" disabled={busy} onClick={()=>onUpdate("vehicle",v.id,"VERIFIED")}>Verify</Button>}{v.status!=="OUT_OF_SERVICE"&&<Button size="sm" variant="outline" className="flex-1" disabled={busy} onClick={()=>onUpdate("vehicle",v.id,"OUT_OF_SERVICE")}>Mark inactive</Button>}{v.status==="OUT_OF_SERVICE"&&<span className="w-full rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">Vehicle not dispatchable</span>}</div>
    </div>
   </article>)}</div>:<div className="grid min-h-44 place-items-center rounded-xl border border-dashed border-border bg-card px-5 text-center"><div><Truck className="mx-auto size-8 text-blue-300"/><p className="mt-2 text-sm font-semibold">No matching vehicles</p><p className="mt-1 text-xs text-muted-foreground">Adjust the filters or register a new vehicle.</p></div></div>}
 </div>;
}
