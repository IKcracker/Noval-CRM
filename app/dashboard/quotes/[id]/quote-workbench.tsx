"use client";
import {useRouter} from "next/navigation";
import {useState,type FormEvent} from "react";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
export function QuoteWorkbench({id,status}:{id:string;status:string}){
 const router=useRouter();const [amount,setAmount]=useState(""),[note,setNote]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[booking,setBooking]=useState("");
 async function request(url:string,body:object,method="POST"){setBusy(true);setError("");try{
  const res=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const result=await res.json();if(!res.ok)throw new Error(result.error||"Unable to complete action");
  if(result.bookingId)setBooking(result.bookingId);
  setNote("");router.refresh();
 }catch(e){setError(e instanceof Error?e.message:"Unable to save");}finally{setBusy(false);}}
 const base="/api/admin/quotes/"+id;
 function update(next:string){request(base,{status:next,note}, "PATCH");}
 function price(e:FormEvent){e.preventDefault();request(base+"/pricing",{amount,note});}
 function accept(e:FormEvent){e.preventDefault();request(base+"/accept",{evidence:note});}
 return <Card className="p-7"><h2 className="text-lg font-bold">Next action</h2>
  <p className="mt-2 text-sm leading-6 text-slate-500">Complete each step in order. Quote sending and acceptance are recorded manually until customer approval and email integrations are enabled.</p>
  {error&&<p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  {booking&&<a href={"/dashboard/bookings/"+booking} className="mt-5 block rounded-lg bg-emerald-50 p-4 text-sm font-bold text-emerald-800">Booking created successfully. Open booking →</a>}
  {status==="NEW"&&<Button disabled={busy} onClick={()=>update("REVIEWING")} className="mt-6 w-full">Start reviewing quote →</Button>}
  {status==="REVIEWING"&&<form onSubmit={price} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Total quoted amount (ZAR)<input value={amount} onChange={e=>setAmount(e.target.value)} required type="number" min=".01" max="999999999" step=".01" placeholder="e.g. 4500.00" className="mt-2 w-full rounded-xl border border-slate-200 p-3"/></label><label className="block text-sm font-semibold">Pricing notes (internal)<textarea rows={3} maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3"/></label><Button disabled={busy} type="submit" className="w-full">Save quotation price →</Button></form>}
  {status==="PRICED"&&<div className="mt-6 space-y-4"><p className="text-sm text-slate-600">Send the quotation to the customer using your approved communication channel, then record evidence below.</p><label className="block text-sm font-semibold">Communication evidence<textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} minLength={10} maxLength={1000} placeholder="Example: Quotation emailed to customer on..." className="mt-2 w-full rounded-xl border border-slate-200 p-3"/></label><Button disabled={busy||note.trim().length<10} onClick={()=>update("SENT")} className="w-full">Record quotation as sent →</Button></div>}
  {status==="SENT"&&<form onSubmit={accept} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Customer acceptance evidence<textarea value={note} onChange={e=>setNote(e.target.value)} required rows={3} minLength={10} maxLength={1000} placeholder="Reference the customer's written approval and date" className="mt-2 w-full rounded-xl border border-slate-200 p-3"/></label><Button type="submit" disabled={busy||note.trim().length<10} className="w-full">Accept quote & create booking →</Button><button type="button" disabled={busy||note.trim().length<10} onClick={()=>update("EXPIRED")} className="text-xs font-semibold text-slate-600 underline">Mark expired (reason required)</button></form>}
  {["NEW","REVIEWING","PRICED"].includes(status)&&<div className="mt-6 border-t border-slate-100 pt-5"><label className="block text-sm font-semibold">Decline reason<textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} maxLength={1000} placeholder="Required when declining" className="mt-2 w-full rounded-xl border border-slate-200 p-3"/></label><button disabled={busy||note.trim().length<10} onClick={()=>update("DECLINED")} className="mt-3 text-sm font-semibold text-red-700 underline">Decline quotation</button></div>}
  {["ACCEPTED","DECLINED","EXPIRED"].includes(status)&&<div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">This quotation is closed. View the booking in the bookings module if accepted.</div>}
 </Card>;
}
