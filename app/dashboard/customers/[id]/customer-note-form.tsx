"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
export function CustomerNoteForm({customerId}:{customerId:string}){
 const router=useRouter(),[value,setValue]=useState(""),[busy,setBusy]=useState(false);
 async function submit(event:FormEvent){
  event.preventDefault();setBusy(true);
  try{const response=await fetch("/api/admin/customers/"+customerId+"/notes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({body:value})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||"Unable to save note");
   setValue("");toast.success("Customer note recorded");router.refresh();
  }catch(e){toast.error(e instanceof Error?e.message:"Unable to save note");}finally{setBusy(false);}
 }
 return <form onSubmit={submit} className="space-y-3"><label htmlFor="customer-note" className="text-sm font-medium">Record customer activity</label><Textarea id="customer-note" value={value} onChange={e=>setValue(e.target.value)} maxLength={5000} placeholder="Log a call, customer request, meeting outcome or follow-up..." rows={4} required/><div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{value.length}/5000 characters</span><Button type="submit" size="sm" disabled={busy||!value.trim()}>{busy?"Saving...":"Add note"}</Button></div></form>;
}
