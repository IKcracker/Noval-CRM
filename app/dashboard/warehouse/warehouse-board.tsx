"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useMemo,useState,type FormEvent} from "react";
import {ChevronDown,CircleCheck,ExternalLink,Filter,LayoutGrid,List,MapPin,MoreHorizontal,PackageSearch,Search,Send,SquareParking,UserRound,Weight} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Dialog,DialogClose,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from "@/components/ui/dialog";
import {DropdownMenu,DropdownMenuContent,DropdownMenuGroup,DropdownMenuItem,DropdownMenuLabel,DropdownMenuRadioGroup,DropdownMenuRadioItem,DropdownMenuSeparator,DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {VehicleThumbnail} from "@/components/admin/vehicle-thumbnail";
import {guessVehicleType} from "@/lib/vehicle-type";
import {place} from "@/lib/places";
import type {LoadingStatus} from "@/lib/warehouse";
export type WarehouseVehicle={id:string;reference:string;driver_name:string;registration:string;make_model:string|null;capacity_kg:string|null;loading_dock:number|null;loaded_kg:string;loading_status:LoadingStatus;scheduled_departure:string;shipment_id:string;tracking_number:string;shipment_status:string;booking_id:string;origin:string;destination:string;booked_kg:string|null};
type Stage=LoadingStatus|"DISPATCHED";
const stages:Record<Stage,{label:string;dot:string}>={
 NOT_STARTED:{label:"Not started",dot:"bg-zinc-400"},LOADING:{label:"Loading",dot:"bg-amber-400"},
 READY:{label:"Ready",dot:"bg-emerald-500"},DISPATCHED:{label:"Dispatched",dot:"bg-emerald-600"}
};
const kg=(n:number)=>n.toLocaleString("en-ZA",{maximumFractionDigits:0})+" kg";
const stageOf=(v:WarehouseVehicle):Stage=>v.shipment_status==="SCHEDULED"?v.loading_status:"DISPATCHED";
function load(v:WarehouseVehicle){
 const loaded=Number(v.loaded_kg)||0,booked=Number(v.booked_kg)||0,capacity=Number(v.capacity_kg)||0;
 const target=booked||capacity,percent=target?Math.min(100,Math.round(loaded/target*100)):0;
 return {loaded,target,percent,basis:booked?"booked cargo":capacity?"vehicle capacity":"",capacity};
}
export function WarehouseBoard({vehicles,docks}:{vehicles:WarehouseVehicle[];docks:number}){
 const router=useRouter();
 const [query,setQuery]=useState(""),[stage,setStage]=useState<"ALL"|Stage>("ALL"),[view,setView]=useState<"grid"|"list">("grid");
 const [editing,setEditing]=useState<WarehouseVehicle|null>(null),[busy,setBusy]=useState(false);
 const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return vehicles.filter(v=>(stage==="ALL"||stageOf(v)===stage)&&(!q||[v.registration,v.driver_name,v.origin,v.destination,v.tracking_number,v.reference].some(x=>x?.toLowerCase().includes(q))));},[vehicles,query,stage]);
 const occupied=useMemo(()=>new Map(vehicles.filter(v=>v.shipment_status==="SCHEDULED"&&v.loading_dock!==null).map(v=>[v.loading_dock as number,v])),[vehicles]);
 async function save(v:WarehouseVehicle,change:{dock:number|null;loadedKg:number;loadingStatus:LoadingStatus}){
  setBusy(true);
  try{const res=await fetch("/api/admin/warehouse/"+v.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(change)});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||"Unable to update loading");toast.success(v.registration+" updated");setEditing(null);router.refresh();}
  catch(e){toast.error(e instanceof Error?e.message:"Unable to update loading");}finally{setBusy(false);}
 }
 async function dispatch(v:WarehouseVehicle){
  setBusy(true);
  try{const res=await fetch("/api/admin/shipments/"+v.shipment_id+"/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"PICKED_UP",note:"Dispatched from warehouse dock "+v.loading_dock,location:"Warehouse dock "+v.loading_dock,visibleToCustomer:true})});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||"Unable to dispatch vehicle");toast.success(v.registration+" dispatched");router.refresh();}
  catch(e){toast.error(e instanceof Error?e.message:"Unable to dispatch vehicle");}finally{setBusy(false);}
 }
 function actions(v:WarehouseVehicle){
  const queued=v.shipment_status==="SCHEDULED",l=load(v);
  return <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="text-foreground/70" aria-label={"Actions for "+v.registration}/>}><MoreHorizontal className="size-4"/></DropdownMenuTrigger>
   <DropdownMenuContent align="end" className="w-52"><DropdownMenuGroup><DropdownMenuLabel>{v.registration}</DropdownMenuLabel>
    {queued&&<DropdownMenuItem onClick={()=>setEditing(v)}>Update loading <Weight className="ml-auto size-4"/></DropdownMenuItem>}
    {queued&&v.loading_status!=="READY"&&l.loaded>0&&v.loading_dock!==null&&<DropdownMenuItem disabled={busy} onClick={()=>save(v,{dock:v.loading_dock,loadedKg:l.loaded,loadingStatus:"READY"})}>Mark ready <CircleCheck className="ml-auto size-4"/></DropdownMenuItem>}
    {queued&&v.loading_status==="READY"&&<DropdownMenuItem disabled={busy} onClick={()=>dispatch(v)}>Dispatch vehicle <Send className="ml-auto size-4"/></DropdownMenuItem>}
   </DropdownMenuGroup>{queued&&<DropdownMenuSeparator/>}
    <DropdownMenuItem render={<Link href={"/dashboard/shipments/"+v.shipment_id}/>}>Open shipment <ExternalLink className="ml-auto size-4"/></DropdownMenuItem>
    <DropdownMenuItem render={<Link href={"/dashboard/bookings/"+v.booking_id}/>}>Open booking <ExternalLink className="ml-auto size-4"/></DropdownMenuItem>
   </DropdownMenuContent></DropdownMenu>;
 }
 const pill=(s:Stage)=><span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[11.5px] font-medium shadow-xs"><span className={"size-1.5 rounded-full "+stages[s].dot}/>{stages[s].label}</span>;
 const bar=(percent:number)=><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{width:percent+"%"}}/></div>;
 return <section id="vehicles" className="scroll-mt-20 rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(17,26,21,.03),0_4px_16px_rgba(17,26,21,.025)] md:p-5">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h2 className="text-[18px] font-semibold tracking-tight">Vehicles currently in warehouse</h2><p className="mt-1 text-[13px] text-muted-foreground">Confirmed trips awaiting departure, loading progress and dock assignments</p></div>
   <div className="flex flex-wrap items-center gap-2">
    <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search for vehicle ID, driver or route..." aria-label="Search vehicles" className="h-10 w-64 pl-9 xl:w-72"/></div>
    <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" className="h-10 px-3.5"/>}><Filter className="size-4"/> {stage==="ALL"?"Filter":stages[stage].label} <ChevronDown className="size-3.5 text-muted-foreground"/></DropdownMenuTrigger>
     <DropdownMenuContent align="end" className="w-44"><DropdownMenuRadioGroup value={stage} onValueChange={v=>setStage(v as "ALL"|Stage)}><DropdownMenuRadioItem value="ALL">All vehicles</DropdownMenuRadioItem>{(Object.keys(stages) as Stage[]).map(s=><DropdownMenuRadioItem key={s} value={s}>{stages[s].label}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
    <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" className="h-10 px-3.5"/>}>{view==="grid"?<LayoutGrid className="size-4"/>:<List className="size-4"/>} {view==="grid"?"Grid":"List"} <ChevronDown className="size-3.5 text-muted-foreground"/></DropdownMenuTrigger>
     <DropdownMenuContent align="end" className="w-36"><DropdownMenuRadioGroup value={view} onValueChange={v=>setView(v as "grid"|"list")}><DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem><DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
   </div>
  </div>
  {!filtered.length?<div className="mt-5 grid min-h-56 place-items-center rounded-xl border border-dashed border-border text-center"><div><PackageSearch className="mx-auto size-8 text-emerald-300"/><p className="mt-2 text-sm font-semibold">{vehicles.length?"No vehicles match these filters":"No vehicles waiting in the warehouse"}</p><p className="mt-1 text-xs text-muted-foreground">{vehicles.length?"Adjust the search or status filter.":"Confirmed bookings with a scheduled shipment appear here."}</p></div></div>
  :view==="grid"?<div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{filtered.map(v=>{const l=load(v),s=stageOf(v);return <article key={v.id} className="group min-w-0 overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_10px_30px_-12px_rgba(17,26,21,.18)]">
    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50">
     <div className="absolute inset-y-3 right-3 w-[62%] [mask-image:linear-gradient(to_right,transparent,#000_28%)]"><VehicleThumbnail type={guessVehicleType(v.make_model)} className="size-full rounded-lg border-0"/></div>
     <div className="absolute left-3 top-3">{pill(s)}</div>
     <div className="absolute right-2 top-2 z-10 rounded-md bg-white/85 backdrop-blur">{actions(v)}</div>
     <div className="absolute bottom-3 left-4 min-w-0 max-w-[55%]"><p className="truncate text-[17px] font-semibold tracking-tight">{v.registration}</p><p className="mt-0.5 truncate text-[12.5px] text-muted-foreground" title={l.basis?"Loaded weight against "+l.basis:"Vehicle capacity not recorded"}>{kg(l.loaded)}{l.target?<> · {l.percent}% of {kg(l.target)}</>:null}</p></div>
    </div>
    <div className="grid grid-cols-[1.2fr_1fr_auto] items-center gap-3 border-t border-border/70 px-4 pt-3.5 text-[12.5px]">
     <span className="flex min-w-0 items-center gap-1.5 font-medium" title={v.origin+" → "+v.destination}><MapPin className="size-3.5 shrink-0"/><span className="truncate">{place(v.origin)} → {place(v.destination)}</span></span>
     <span className="flex min-w-0 items-center gap-1.5 text-foreground/80"><UserRound className="size-3.5 shrink-0"/><span className="truncate">{v.driver_name}</span></span>
     <span className="flex items-center gap-1.5 text-foreground/80"><SquareParking className="size-3.5 shrink-0"/>{v.loading_dock?"Dock #"+v.loading_dock:"No dock"}</span>
    </div>
    <div className="px-4 pb-4 pt-3"><div className="flex items-center justify-between text-[12px] text-muted-foreground"><span>Load progress{l.basis?" · "+l.basis:""}</span></div><div className="mt-2 flex items-center gap-3">{bar(s==="DISPATCHED"?100:l.percent)}<span className="w-10 text-right text-[13px] font-semibold tabular-nums">{s==="DISPATCHED"?100:l.percent}%</span></div></div>
   </article>;})}</div>
  :<div className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border">{filtered.map(v=>{const l=load(v),s=stageOf(v);return <div key={v.id} className="flex flex-wrap items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40">
    <VehicleThumbnail type={guessVehicleType(v.make_model)} className="h-12 w-20 shrink-0 rounded-md border-0"/>
    <div className="w-36 min-w-0"><p className="truncate text-[14px] font-semibold">{v.registration}</p><p className="truncate text-[11.5px] text-muted-foreground">{v.tracking_number}</p></div>
    <div className="w-28">{pill(s)}</div>
    <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[12.5px]" title={v.origin+" → "+v.destination}><MapPin className="size-3.5 shrink-0"/><span className="truncate">{place(v.origin)} → {place(v.destination)}</span></span>
    <span className="hidden w-32 truncate text-[12.5px] text-foreground/80 lg:block">{v.driver_name}</span>
    <span className="w-20 text-[12.5px] text-foreground/80">{v.loading_dock?"Dock #"+v.loading_dock:"No dock"}</span>
    <div className="flex w-44 items-center gap-2">{bar(s==="DISPATCHED"?100:l.percent)}<span className="w-9 text-right text-[12.5px] font-semibold tabular-nums">{s==="DISPATCHED"?100:l.percent}%</span></div>
    {actions(v)}
   </div>;})}</div>}
  <p className="mt-4 text-[11px] text-muted-foreground">Loaded weights and dock assignments are recorded manually by warehouse staff. Vehicle photos are representative, not photos of the registered vehicle.</p>
  {editing&&<LoadingDialog vehicle={editing} docks={docks} occupied={occupied} busy={busy} onClose={()=>setEditing(null)} onSave={change=>save(editing,change)}/>}
 </section>;
}
function LoadingDialog({vehicle,docks,occupied,busy,onClose,onSave}:{vehicle:WarehouseVehicle;docks:number;occupied:Map<number,WarehouseVehicle>;busy:boolean;onClose:()=>void;onSave:(c:{dock:number|null;loadedKg:number;loadingStatus:LoadingStatus})=>void}){
 const [dock,setDock]=useState(vehicle.loading_dock?String(vehicle.loading_dock):"NONE"),[loaded,setLoaded]=useState(String(Number(vehicle.loaded_kg)||0)),[status,setStatus]=useState<LoadingStatus>(vehicle.loading_status);
 const capacity=Number(vehicle.capacity_kg)||0,booked=Number(vehicle.booked_kg)||0;
 const dockItems={NONE:"No dock assigned",...Object.fromEntries(Array.from({length:docks},(_,i)=>[String(i+1),"Dock #"+(i+1)]))};
 const statusItems={NOT_STARTED:"Not started",LOADING:"Loading",READY:"Ready for dispatch"};
 function submit(e:FormEvent){e.preventDefault();onSave({dock:dock==="NONE"?null:Number(dock),loadedKg:Number(loaded),loadingStatus:status});}
 return <Dialog open onOpenChange={open=>{if(!open)onClose();}}><DialogContent><form onSubmit={submit} className="space-y-4">
  <DialogHeader><DialogTitle>Update loading · {vehicle.registration}</DialogTitle><DialogDescription>{vehicle.tracking_number} · {booked?"Booked cargo "+kg(booked):"Booked weight not recorded"}{capacity?" · Capacity "+kg(capacity):""}</DialogDescription></DialogHeader>
  <div className="space-y-2"><Label>Loading dock</Label><Select items={dockItems} value={dock} onValueChange={v=>setDock(v??"NONE")}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="NONE">No dock assigned</SelectItem>{Array.from({length:docks},(_,i)=>i+1).map(d=>{const other=occupied.get(d);const taken=Boolean(other&&other.id!==vehicle.id);return <SelectItem key={d} value={String(d)} disabled={taken}>Dock #{d}{taken?" · "+other!.registration:""}</SelectItem>;})}</SelectContent></Select></div>
  <div className="space-y-2"><Label htmlFor="loaded-kg">Loaded weight (kg)</Label><Input id="loaded-kg" type="number" min={0} max={capacity||100000} step="1" required value={loaded} onChange={e=>setLoaded(e.target.value)}/></div>
  <div className="space-y-2"><Label>Loading status</Label><Select items={statusItems} value={status} onValueChange={v=>setStatus((v??"NOT_STARTED") as LoadingStatus)}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="NOT_STARTED">Not started</SelectItem><SelectItem value="LOADING">Loading</SelectItem><SelectItem value="READY">Ready for dispatch</SelectItem></SelectContent></Select></div>
  <DialogFooter><DialogClose render={<Button type="button" variant="outline"/>}>Cancel</DialogClose><Button type="submit" disabled={busy}>{busy?"Saving…":"Save loading"}</Button></DialogFooter>
 </form></DialogContent></Dialog>;
}
