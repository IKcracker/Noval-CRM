"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useMemo,useState,type FormEvent} from "react";
import {toast} from "sonner";
import {Ban,CircleCheck,ExternalLink,Filter,MapPin,MoreHorizontal,Pencil,Phone,Plus,RotateCcw,Search,ShieldAlert,Truck,UserRound,Users,Weight,type LucideIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Sheet,SheetContent,SheetDescription,SheetFooter,SheetHeader,SheetTitle} from "@/components/ui/sheet";
import {Dialog,DialogClose,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from "@/components/ui/dialog";
import {DropdownMenu,DropdownMenuContent,DropdownMenuGroup,DropdownMenuItem,DropdownMenuLabel,DropdownMenuRadioGroup,DropdownMenuRadioItem,DropdownMenuSeparator,DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {VehicleThumbnail} from "@/components/admin/vehicle-thumbnail";
import {StatusPill} from "@/components/admin/record-detail";
import {guessVehicleType} from "@/lib/vehicle-type";
import {place} from "@/lib/places";
type Assignment={trip_reference:string|null;shipment_id:string|null;origin:string|null;destination:string|null};
export type DriverRecord=Assignment&{id:string;full_name:string;phone:string;license_number:string;license_expiry:string;status:string;days_left:number;trips:number;created_at:string};
export type VehicleRecord=Assignment&{id:string;registration:string;make_model:string;capacity_kg:string;roadworthy_expiry:string;status:string;days_left:number;trips:number;driver_name:string|null;created_at:string};
type Kind="vehicle"|"driver";
type View="ALL"|"AVAILABLE"|"ON_TRIP"|"ATTENTION"|"PENDING"|"INACTIVE";
const views:{key:View;name:string}[]=[{key:"ALL",name:"All records"},{key:"AVAILABLE",name:"Available"},{key:"ON_TRIP",name:"On a trip"},{key:"ATTENTION",name:"Compliance due"},{key:"PENDING",name:"Awaiting verification"},{key:"INACTIVE",name:"Suspended / out of service"}];
const inactive=(status:string)=>status==="SUSPENDED"||status==="OUT_OF_SERVICE";
function matches(view:View,r:{status:string;days_left:number;trip_reference:string|null}){
 switch(view){
  case "AVAILABLE":return r.status==="VERIFIED"&&r.days_left>=0&&!r.trip_reference;
  case "ON_TRIP":return Boolean(r.trip_reference);
  case "ATTENTION":return r.days_left<=30;
  case "PENDING":return r.status==="PENDING";
  case "INACTIVE":return inactive(r.status);
  default:return true;
 }
}
const day=(iso:string)=>new Date(iso+"T00:00:00").toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric"});
function Expiry({date,days}:{date:string;days:number}){
 const tone=days<0?"bg-red-50 text-red-700":days<=30?"bg-amber-50 text-amber-700":"bg-muted text-muted-foreground";
 return <span className="inline-flex flex-wrap items-center gap-1.5"><span className="font-medium">{day(date)}</span><span className={"rounded px-1.5 py-0.5 text-[10.5px] font-medium "+tone}>{days<0?"Expired "+-days+"d ago":days===0?"Expires today":days<=30?"In "+days+"d":"Valid"}</span></span>;
}
/** Why a resource can or can't be dispatched right now. */
function Readiness({r,kind}:{r:Assignment&{status:string;days_left:number};kind:Kind}){
 if(r.trip_reference)return <Link href={r.shipment_id?"/dashboard/shipments/"+r.shipment_id:"/dashboard/routes"} className="flex min-w-0 items-center gap-1.5 text-amber-700 hover:underline"><Truck className="size-3.5 shrink-0"/><span className="truncate">On trip {r.trip_reference} · {place(r.origin??"")} → {place(r.destination??"")}</span></Link>;
 const reason=inactive(r.status)?(kind==="driver"?"Suspended":"Out of service"):r.days_left<0?(kind==="driver"?"Licence expired":"Roadworthy expired"):r.status==="PENDING"?"Awaiting verification":null;
 return reason?<span className="flex items-center gap-1.5 text-muted-foreground"><Ban className="size-3.5"/>{reason} · not dispatchable</span>:<span className="flex items-center gap-1.5 font-medium text-emerald-700"><CircleCheck className="size-3.5"/>Available for dispatch</span>;
}
type Pending={kind:Kind;id:string;status:string;name:string;onTrip:boolean};
export function FleetWorkspace({drivers,vehicles}:{drivers:DriverRecord[];vehicles:VehicleRecord[]}){
 const router=useRouter();
 const [tab,setTab]=useState<Kind>("vehicle"),[query,setQuery]=useState(""),[view,setView]=useState<View>("ALL");
 const [editing,setEditing]=useState<{kind:Kind;record?:DriverRecord|VehicleRecord}|null>(null);
 const [confirming,setConfirming]=useState<Pending|null>(null),[busy,setBusy]=useState(false);
 const q=query.trim().toLowerCase();
 const shownVehicles=useMemo(()=>vehicles.filter(v=>matches(view,v)&&(!q||[v.registration,v.make_model,v.driver_name??""].some(x=>x.toLowerCase().includes(q)))),[vehicles,view,q]);
 const shownDrivers=useMemo(()=>drivers.filter(d=>matches(view,d)&&(!q||[d.full_name,d.phone,d.license_number].some(x=>x.toLowerCase().includes(q)))),[drivers,view,q]);
 async function send(method:"POST"|"PUT"|"PATCH",body:object,success:string){
  setBusy(true);
  try{const res=await fetch("/api/admin/fleet",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||"Request failed");toast.success(success);router.refresh();return true;}
  catch(e){toast.error(e instanceof Error?e.message:"Request failed");return false;}finally{setBusy(false);}
 }
 function setStatus(p:Pending){
  if((p.status==="SUSPENDED"||p.status==="OUT_OF_SERVICE")&&!confirming){setConfirming(p);return;}
  void send("PATCH",{kind:p.kind,id:p.id,status:p.status},p.name+(p.status==="VERIFIED"?" verified":p.status==="PENDING"?" reinstated for verification":p.status==="SUSPENDED"?" suspended":" marked out of service")).then(()=>setConfirming(null));
 }
 function actions(kind:Kind,r:DriverRecord|VehicleRecord){
  const name=kind==="driver"?(r as DriverRecord).full_name:(r as VehicleRecord).registration,off=kind==="driver"?"SUSPENDED":"OUT_OF_SERVICE";
  return <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="text-foreground/70" aria-label={"Actions for "+name}/>}><MoreHorizontal className="size-4"/></DropdownMenuTrigger>
   <DropdownMenuContent align="end" className="w-56"><DropdownMenuGroup><DropdownMenuLabel>{name}</DropdownMenuLabel>
    <DropdownMenuItem onClick={()=>setEditing({kind,record:r})}>Edit details <Pencil className="ml-auto size-4"/></DropdownMenuItem>
    {r.status!=="VERIFIED"&&!inactive(r.status)&&<DropdownMenuItem disabled={busy||r.days_left<0} onClick={()=>setStatus({kind,id:r.id,status:"VERIFIED",name,onTrip:Boolean(r.trip_reference)})}>{r.days_left<0?(kind==="driver"?"Renew licence to verify":"Renew roadworthy to verify"):"Verify documents"} <CircleCheck className="ml-auto size-4"/></DropdownMenuItem>}
    {inactive(r.status)&&<DropdownMenuItem disabled={busy} onClick={()=>setStatus({kind,id:r.id,status:"PENDING",name,onTrip:false})}>Reinstate for review <RotateCcw className="ml-auto size-4"/></DropdownMenuItem>}
    {r.shipment_id&&<DropdownMenuItem render={<Link href={"/dashboard/shipments/"+r.shipment_id}/>}>Open current shipment <ExternalLink className="ml-auto size-4"/></DropdownMenuItem>}
   </DropdownMenuGroup>
   {!inactive(r.status)&&<><DropdownMenuSeparator/><DropdownMenuItem variant="destructive" disabled={busy} onClick={()=>setStatus({kind,id:r.id,status:off,name,onTrip:Boolean(r.trip_reference)})}>{kind==="driver"?"Suspend driver":"Take out of service"} <Ban className="ml-auto size-4"/></DropdownMenuItem></>}
   </DropdownMenuContent></DropdownMenu>;
 }
 const count=(kind:Kind)=>kind==="vehicle"?vehicles.length:drivers.length;
 const shown=tab==="vehicle"?shownVehicles.length:shownDrivers.length;
 return <section id="fleet" className="scroll-mt-20 rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(17,26,21,.03),0_4px_16px_rgba(17,26,21,.025)] md:p-5">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <div className="flex items-center gap-1 rounded-lg bg-muted p-1" role="tablist">{([["vehicle","Vehicles",Truck],["driver","Drivers",Users]] as [Kind,string,LucideIcon][]).map(([k,label,Icon])=><button key={k} type="button" role="tab" aria-selected={tab===k} onClick={()=>setTab(k)} className={"flex h-8 items-center gap-2 rounded-md px-3.5 text-[13px] font-medium transition "+(tab===k?"bg-card text-foreground shadow-xs":"text-muted-foreground hover:text-foreground")}><Icon className="size-4"/>{label}<span className="text-[11px] tabular-nums text-muted-foreground">{count(k)}</span></button>)}</div>
   <div className="flex flex-wrap items-center gap-2">
    <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==="vehicle"?"Registration, model or driver...":"Name, phone or licence..."} aria-label="Search fleet" className="h-10 w-64 pl-9"/></div>
    <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" className="h-10 px-3.5"/>}><Filter className="size-4"/>{view==="ALL"?"Filter":views.find(v=>v.key===view)?.name}</DropdownMenuTrigger>
     <DropdownMenuContent align="end" className="w-56"><DropdownMenuRadioGroup value={view} onValueChange={v=>setView(v as View)}>{views.map(v=><DropdownMenuRadioItem key={v.key} value={v.key}>{v.name}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
    <Button className="h-10 px-3.5" onClick={()=>setEditing({kind:tab})}><Plus className="size-4"/> Add {tab}</Button>
   </div>
  </div>
  {shown===0?<div className="mt-5 grid min-h-56 place-items-center rounded-xl border border-dashed border-border text-center"><div>{tab==="vehicle"?<Truck className="mx-auto size-8 text-emerald-300"/>:<Users className="mx-auto size-8 text-emerald-300"/>}<p className="mt-2 text-sm font-semibold">{count(tab)?"Nothing matches this view":"No "+tab+"s registered yet"}</p><p className="mt-1 text-xs text-muted-foreground">{count(tab)?"Adjust the search or filter.":"Add your first "+tab+"; it starts as pending until documents are verified."}</p>{!count(tab)&&<Button size="sm" className="mt-4 h-8" onClick={()=>setEditing({kind:tab})}><Plus className="size-3.5"/> Add {tab}</Button>}</div></div>
  :tab==="vehicle"?<div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{shownVehicles.map(v=><article key={v.id} className="group min-w-0 overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_10px_30px_-12px_rgba(17,26,21,.18)]">
    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50">
     <div className="absolute inset-y-3 right-3 w-[62%] [mask-image:linear-gradient(to_right,transparent,#000_28%)]"><VehicleThumbnail type={guessVehicleType(v.make_model)} className="size-full rounded-lg border-0"/></div>
     <div className="absolute left-3 top-3"><StatusPill status={v.status}/></div>
     <div className="absolute right-2 top-2 z-10 rounded-md bg-white/85 backdrop-blur">{actions("vehicle",v)}</div>
     <div className="absolute bottom-3 left-4 max-w-[55%]"><p className="truncate text-[17px] font-semibold tracking-tight">{v.registration}</p><p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{v.make_model}</p></div>
    </div>
    <div className="grid grid-cols-[auto_1fr_auto] gap-4 border-t border-border/70 px-4 py-3 text-[12px]">
     <div><p className="text-muted-foreground">Payload</p><p className="mt-0.5 flex items-center gap-1 font-medium"><Weight className="size-3.5"/>{Number(v.capacity_kg).toLocaleString("en-ZA")} kg</p></div>
     <div className="min-w-0"><p className="text-muted-foreground">Roadworthy</p><div className="mt-0.5"><Expiry date={v.roadworthy_expiry} days={v.days_left}/></div></div>
     <div className="text-right"><p className="text-muted-foreground">Trips</p><p className="mt-0.5 font-medium tabular-nums">{v.trips}</p></div>
    </div>
    <div className="border-t border-border/70 bg-muted/30 px-4 py-2.5 text-[12px]"><Readiness r={v} kind="vehicle"/></div>
   </article>)}</div>
  :<div className="mt-5 overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[860px] text-left text-[12.5px]">
    <thead className="bg-muted/50 text-[11.5px] text-muted-foreground"><tr>{["Driver","Licence","Licence expiry","Status","Current assignment","Trips",""].map(h=><th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead>
    <tbody className="divide-y divide-border">{shownDrivers.map(d=><tr key={d.id} className="transition-colors hover:bg-muted/30">
     <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11.5px] font-semibold text-emerald-700 ring-1 ring-emerald-100">{d.full_name.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase()}</span><div className="min-w-0"><p className="truncate text-[13px] font-semibold">{d.full_name}</p><a href={"tel:"+d.phone} className="flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-foreground"><Phone className="size-3"/>{d.phone}</a></div></div></td>
     <td className="px-4 py-3 font-mono text-[12px]">{d.license_number}</td>
     <td className="px-4 py-3"><Expiry date={d.license_expiry} days={d.days_left}/></td>
     <td className="px-4 py-3"><StatusPill status={d.status}/></td>
     <td className="max-w-64 px-4 py-3"><Readiness r={d} kind="driver"/></td>
     <td className="px-4 py-3 tabular-nums">{d.trips}</td>
     <td className="px-2 py-3 text-right">{actions("driver",d)}</td>
    </tr>)}</tbody>
   </table></div>}
  <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground"><ShieldAlert className="size-3.5"/>Only verified records with valid licence or roadworthy dates can be assigned to trips. Vehicle photos are representative.</p>
  {editing&&<ResourceSheet kind={editing.kind} record={editing.record} busy={busy} onClose={()=>setEditing(null)} onSave={async body=>{if(await send(editing.record?"PUT":"POST",{kind:editing.kind,...(editing.record?{id:editing.record.id}:{}),...body},editing.record?"Changes saved":(editing.kind==="driver"?"Driver":"Vehicle")+" added · pending verification"))setEditing(null);}}/>}
  <Dialog open={Boolean(confirming)} onOpenChange={o=>{if(!o)setConfirming(null);}}><DialogContent>
   <DialogHeader><DialogTitle>{confirming?.kind==="driver"?"Suspend "+confirming?.name+"?":"Take "+confirming?.name+" out of service?"}</DialogTitle>
    <DialogDescription>{confirming?.onTrip?"This resource is assigned to an active trip. The trip keeps its assignment; reassign it from the booking if needed. ":""}It can&apos;t be assigned to new trips until it is reinstated and verified again.</DialogDescription></DialogHeader>
   <DialogFooter><DialogClose render={<Button variant="outline"/>}>Cancel</DialogClose><Button variant="destructive" disabled={busy} onClick={()=>confirming&&setStatus(confirming)}>{confirming?.kind==="driver"?"Suspend driver":"Take out of service"}</Button></DialogFooter>
  </DialogContent></Dialog>
 </section>;
}
function ResourceSheet({kind,record,busy,onClose,onSave}:{kind:Kind;record?:DriverRecord|VehicleRecord;busy:boolean;onClose:()=>void;onSave:(body:Record<string,string>)=>void}){
 const d=kind==="driver"?record as DriverRecord|undefined:undefined,v=kind==="vehicle"?record as VehicleRecord|undefined:undefined;
 const fields:{name:string;label:string;type:string;value?:string;hint?:string;icon:LucideIcon}[]=kind==="driver"?[
  {name:"fullName",label:"Full name",type:"text",value:d?.full_name,icon:UserRound},
  {name:"phone",label:"Mobile number",type:"tel",value:d?.phone,icon:Phone},
  {name:"licenseNumber",label:"Driving licence number",type:"text",value:d?.license_number,icon:ShieldAlert},
  {name:"licenseExpiry",label:"Licence expiry date",type:"date",value:d?.license_expiry,hint:"Drivers can't be dispatched after this date.",icon:ShieldAlert}
 ]:[
  {name:"registration",label:"Registration number",type:"text",value:v?.registration,icon:Truck},
  {name:"makeModel",label:"Make and model",type:"text",value:v?.make_model,hint:"e.g. Isuzu NPR 400, Mercedes Sprinter, Scania R500",icon:Truck},
  {name:"capacityKg",label:"Maximum payload (kg)",type:"number",value:v?.capacity_kg?String(Number(v.capacity_kg)):undefined,icon:Weight},
  {name:"roadworthyExpiry",label:"Roadworthy / licence disc expiry",type:"date",value:v?.roadworthy_expiry,hint:"Vehicles can't be dispatched after this date.",icon:MapPin}
 ];
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();onSave(Object.fromEntries([...new FormData(e.currentTarget).entries()].map(([k,val])=>[k,String(val)])));}
 return <Sheet open onOpenChange={o=>{if(!o)onClose();}}><SheetContent className="w-full gap-0 sm:max-w-md">
  <form onSubmit={submit} className="flex h-full flex-col">
   <SheetHeader className="border-b border-border p-5"><SheetTitle>{record?"Edit "+kind:"Add "+kind}</SheetTitle><SheetDescription>{record?"Changing an expiry to a past date returns a verified record to pending.":"New records start as pending until their documents are verified."}</SheetDescription></SheetHeader>
   <div className="flex-1 space-y-4 overflow-y-auto p-5">{fields.map(f=><div key={f.name} className="space-y-1.5"><Label htmlFor={f.name}>{f.label}</Label><Input id={f.name} name={f.name} type={f.type} required defaultValue={f.value} min={f.type==="number"?"1":undefined} max={f.type==="number"?"100000":undefined} step={f.type==="number"?"1":undefined} className={"h-10"+(f.name==="registration"?" uppercase":"")}/>{f.hint&&<p className="text-[11.5px] text-muted-foreground">{f.hint}</p>}</div>)}</div>
   <SheetFooter className="flex-row justify-end gap-2 border-t border-border p-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy?"Saving…":record?"Save changes":"Add "+kind}</Button></SheetFooter>
  </form>
 </SheetContent></Sheet>;
}
