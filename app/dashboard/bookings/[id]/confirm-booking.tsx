"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {CheckCircle2,Truck,CalendarClock} from "lucide-react";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {Field,FieldLabel,FieldDescription} from "@/components/ui/field";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter,DialogClose} from "@/components/ui/dialog";
export function ConfirmBooking({id,drivers,vehicles}:{id:string;drivers:{id:string;full_name:string}[];vehicles:{id:string;registration:string}[]}){
 const router=useRouter(),[error,setError]=useState(""),[busy,setBusy]=useState(false),[tracking,setTracking]=useState("");
 const [form,setForm]=useState({driverId:"",vehicleId:"",departure:"",arrival:""});
 const [open,setOpen]=useState(false);
 async function submit(){
  setError("");setBusy(true);
  try{
   const result=await fetch("/api/admin/bookings/"+id+"/confirm",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,departure:new Date(form.departure).toISOString(),arrival:new Date(form.arrival).toISOString()})});
   const response=await result.json();if(!result.ok)throw new Error(response.error||"Unable to confirm trip");
   setTracking(response.trackingNumber);toast.success("Trip and shipment created");setOpen(false);router.refresh();
  }catch(e){const msg=e instanceof Error?e.message:"Invalid schedule";setError(msg);toast.error(msg);}
  finally{setBusy(false);}
 }
 function showDialog(e:FormEvent){e.preventDefault();setOpen(true);}
 const fields:[keyof typeof form,string,string][]=[["departure","Scheduled departure","datetime-local"],["arrival","Scheduled arrival","datetime-local"]];
 return <Card className="gap-0 rounded-2xl py-0"><CardHeader className="px-5 pb-4 pt-5"><CardTitle className="flex items-center gap-2 text-[15px] font-semibold"><Truck className="size-4 text-primary"/> Confirm dispatch</CardTitle><CardDescription className="text-[12px]">Assign a verified driver and vehicle and set the trip schedule.</CardDescription></CardHeader>
 <CardContent className="space-y-4 px-5 pb-5">
  {tracking&&<div role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mb-2 size-5"/>Confirmed · Tracking reference <strong>{tracking}</strong></div>}
  <form onSubmit={showDialog} className="space-y-4"><Field><FieldLabel>Verified driver</FieldLabel><Select items={Object.fromEntries(drivers.map(d=>[d.id,d.full_name]))} value={form.driverId} onValueChange={v=>setForm({...form,driverId:v??""})}><SelectTrigger className="w-full"><SelectValue placeholder="Select a verified driver"/></SelectTrigger><SelectContent>{!drivers.length&&<p className="px-2 py-1.5 text-xs text-muted-foreground">No verified drivers with a valid licence.</p>}{drivers.map(d=><SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}</SelectContent></Select></Field><Field><FieldLabel>Verified vehicle</FieldLabel><Select items={Object.fromEntries(vehicles.map(v=>[v.id,v.registration]))} value={form.vehicleId} onValueChange={v=>setForm({...form,vehicleId:v??""})}><SelectTrigger className="w-full"><SelectValue placeholder="Select a verified vehicle"/></SelectTrigger><SelectContent>{!vehicles.length&&<p className="px-2 py-1.5 text-xs text-muted-foreground">No verified vehicles with a valid roadworthy.</p>}{vehicles.map(v=><SelectItem key={v.id} value={v.id}>{v.registration}</SelectItem>)}</SelectContent></Select></Field>
   {fields.map(([key,label,type])=><Field key={key}><FieldLabel htmlFor={key}>{label}</FieldLabel><Input id={key} type={type} required maxLength={type==="text"?150:undefined} className="h-10" value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></Field>)}
   <FieldDescription>Only verified resources with current compliance dates can be assigned.</FieldDescription>
   {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
   <Button className="w-full" disabled={busy||!form.driverId||!form.vehicleId} type="submit"><CalendarClock className="size-4"/> Review trip confirmation</Button>
  </form>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Confirm this transport booking?</DialogTitle><DialogDescription>A confirmed trip and shipment tracking number will be generated. Verify the driver, vehicle and schedule are correct.</DialogDescription></DialogHeader><div className="space-y-2 rounded-lg bg-muted p-3 text-sm"><p><strong>Driver:</strong> {drivers.find(d=>d.id===form.driverId)?.full_name}</p><p><strong>Vehicle:</strong> {vehicles.find(v=>v.id===form.vehicleId)?.registration}</p><p><strong>Departure:</strong> {form.departure.replace("T"," ")}</p><p><strong>Arrival:</strong> {form.arrival.replace("T"," ")}</p></div><DialogFooter><DialogClose render={<Button variant="outline"/>}>Cancel</DialogClose><Button disabled={busy} onClick={submit}>Confirm trip and create shipment</Button></DialogFooter></DialogContent></Dialog>
 </CardContent></Card>;
}
