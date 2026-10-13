"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
const states=["NEW","REVIEWING","PRICED","SENT","ACCEPTED","DECLINED","EXPIRED"];
export function QuoteStatus({id,initial}:{id:string;initial:string}){
 const router=useRouter();const [status,setStatus]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function update(value:string){setBusy(true);setError("");try{
 const res=await fetch("/api/admin/quotes/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:value})});
 if(!res.ok)throw new Error((await res.json()).error||"Update failed");setStatus(value);router.refresh();
 }catch(e){setError(e instanceof Error?e.message:"Update failed");}finally{setBusy(false);}}
 return <div><select aria-label="Quote status" disabled={busy} value={status} onChange={e=>update(e.target.value)} className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold text-[#173b56]">{states.map(s=><option value={s} key={s}>{s.replace("_"," ")}</option>)}</select>{error&&<p role="alert" className="mt-2 max-w-48 text-xs text-red-700">{error}</p>}</div>;
}
