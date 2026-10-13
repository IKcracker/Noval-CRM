"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
export function ConfirmBooking({id}:{id:string}){
 const router=useRouter();const [error,setError]=useState(""),[busy,setBusy]=useState(false),[tracking,setTracking]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");setBusy(true);
 const data=new FormData(e.currentTarget);
 try{
 const res=await fetch("/api/admin/bookings/"+id+"/confirm",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({driverName:data.get("driverName"),vehicleRegistration:data.get("vehicleRegistration"),departure:new Date(String(data.get("departure"))).toISOString(),arrival:new Date(String(data.get("arrival"))).toISOString()})});
 const result=await res.json();if(!res.ok)throw new Error(result.error||"Unable to confirm");setTracking(result.trackingNumber);router.refresh();
 }catch(e){setError(e instanceof Error?e.message:"Invalid schedule");}finally{setBusy(false);}}
 return <Card className="p-7"><h2 className="text-xl font-bold">Confirm trip</h2><p className="mt-2 text-sm leading-7 text-slate-500">Record the assigned driver, vehicle and timetable to confirm dispatch and issue a tracking reference. Fleet verification is not yet connected.</p>{tracking&&<p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Trip confirmed. Tracking reference: {tracking}</p>}<form onSubmit={submit} className="mt-7 space-y-4">{[["driverName","Assigned driver","text"],["vehicleRegistration","Vehicle registration","text"],["departure","Scheduled departure","datetime-local"],["arrival","Scheduled arrival","datetime-local"]].map(([key,label,type])=><label key={key} className="block text-sm font-semibold">{label}<input type={type} name={key} required maxLength={type==="text"?150:undefined} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-cyan-700"/></label>)}{error&&<p role="alert" className="text-sm text-red-700">{error}</p>}<Button disabled={busy} type="submit" className="w-full">{busy?"Confirming…":"Confirm trip and create shipment →"}</Button></form></Card>;
}
