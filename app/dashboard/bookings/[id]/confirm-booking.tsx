"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {CheckCircle2,Truck,CalendarClock} from "lucide-react";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Field,FieldLabel,FieldDescription} from "@/components/ui/field";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter,DialogClose} from "@/components/ui/dialog";
export function ConfirmBooking({id}:{id:string}){
 const router=useRouter(),[error,setError]=useState(""),[busy,setBusy]=useState(false),[tracking,setTracking]=useState("");
 const [form,setForm]=useState({driverName:"",vehicleRegistration:"",departure:"",arrival:""});
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
 const fields:[keyof typeof form,string,string][]=[["driverName","Assigned driver","text"],["vehicleRegistration","Vehicle registration","text"],["departure","Scheduled departure","datetime-local"],["arrival","Scheduled arrival","datetime-local"]];
 return <Card className="shadow-sm"><CardHeader className="border-b pb-4"><CardTitle className="flex items-center gap-2 text-lg"><Truck className="size-5 text-primary"/> Confirm dispatch</CardTitle><CardDescription>Assign a driver and vehicle and set the trip schedule.</CardDescription></CardHeader>
 <CardContent className="space-y-4">
  <Badge variant="secondary">Pending booking</Badge>
  {tracking&&<div role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mb-2 size-5"/>Confirmed · Tracking reference <strong>{tracking}</strong></div>}
  <form onSubmit={showDialog} className="space-y-4">
   {fields.map(([key,label,type])=><Field key={key}><FieldLabel htmlFor={key}>{label}</FieldLabel><Input id={key} type={type} required maxLength={type==="text"?150:undefined} className="h-10" value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></Field>)}
   <FieldDescription>Driver and vehicle eligibility checks are not yet connected. Verify these details before confirming.</FieldDescription>
   {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
   <Button className="w-full" disabled={busy} type="submit"><CalendarClock className="size-4"/> Review trip confirmation</Button>
  </form>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Confirm this transport booking?</DialogTitle><DialogDescription>A confirmed trip and shipment tracking number will be generated. Verify the driver, vehicle and schedule are correct.</DialogDescription></DialogHeader><div className="space-y-2 rounded-lg bg-muted p-3 text-sm"><p><strong>Driver:</strong> {form.driverName}</p><p><strong>Vehicle:</strong> {form.vehicleRegistration}</p><p><strong>Departure:</strong> {form.departure.replace("T"," ")}</p><p><strong>Arrival:</strong> {form.arrival.replace("T"," ")}</p></div><DialogFooter><DialogClose render={<Button variant="outline"/>}>Cancel</DialogClose><Button disabled={busy} onClick={submit}>Confirm trip and create shipment</Button></DialogFooter></DialogContent></Dialog>
 </CardContent></Card>;
}
