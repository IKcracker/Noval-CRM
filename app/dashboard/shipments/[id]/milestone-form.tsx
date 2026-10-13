"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
const options:Record<string,string[]>={SCHEDULED:["PICKED_UP","EXCEPTION","CANCELLED"],PICKED_UP:["IN_TRANSIT","EXCEPTION"],IN_TRANSIT:["OUT_FOR_DELIVERY","EXCEPTION"],OUT_FOR_DELIVERY:["DELIVERED","EXCEPTION"],EXCEPTION:["IN_TRANSIT","OUT_FOR_DELIVERY","RETURNED","CANCELLED"]};
const label=(x:string)=>x.charAt(0)+x.slice(1).toLowerCase().replaceAll("_"," ");
export function MilestoneForm({id,status}:{id:string;status:string}){
 const router=useRouter(),[next,setNext]=useState(options[status]?.[0]??""),[note,setNote]=useState(""),[location,setLocation]=useState(""),[visible,setVisible]=useState(true),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);
 try{const res=await fetch("/api/admin/shipments/"+id+"/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next,note,location,visibleToCustomer:visible})});const data=await res.json();if(!res.ok)throw new Error(data.error??"Update failed");toast.success("Shipment milestone saved");router.refresh();}
 catch(e){toast.error(e instanceof Error?e.message:"Unable to update shipment");}finally{setBusy(false);}}
 if(!options[status]?.length)return <p className="rounded-lg bg-muted p-4 text-[12.5px] text-muted-foreground">This shipment is closed ({label(status)}). No further milestones can be recorded.</p>;
 return <form className="space-y-4" onSubmit={submit}>
 <div className="space-y-2"><Label>Next status</Label><Select items={Object.fromEntries(options[status].map(x=>[x,label(x)]))} value={next} onValueChange={v=>setNext(v??"")}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent>{options[status].map(x=><SelectItem key={x} value={x}>{label(x)}</SelectItem>)}</SelectContent></Select></div>
 <div className="space-y-2"><Label htmlFor="location-label">Location or facility (optional)</Label><Input id="location-label" maxLength={180} value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Pretoria distribution centre"/></div>
 <div className="space-y-2"><Label htmlFor="milestone-note">Milestone notes</Label><Textarea id="milestone-note" rows={4} maxLength={1000} required={["EXCEPTION","CANCELLED"].includes(next)} value={note} onChange={e=>setNote(e.target.value)} placeholder="Describe the event or reason for exception"/></div>
 <div className="flex items-center gap-3"><Checkbox id="visible" checked={visible} onCheckedChange={v=>setVisible(Boolean(v))}/><Label htmlFor="visible">Show milestone to customer</Label></div>
 <Button disabled={busy} type="submit" className="w-full">{busy?"Saving...":"Record milestone"}</Button>
 </form>;
}
