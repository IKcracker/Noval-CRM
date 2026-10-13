"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState,type FormEvent} from "react";
import {toast} from "sonner";
import {ArrowRight,CheckCircle2,Info,Send,ShieldCheck} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import {Field,FieldLabel,FieldDescription} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Dialog,DialogTrigger,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter,DialogClose} from "@/components/ui/dialog";
export function QuoteWorkbench({id,status}:{id:string;status:string}){
 const router=useRouter();
 const [amount,setAmount]=useState("");
 const [note,setNote]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [booking,setBooking]=useState("");
 const [dialogOpen,setDialogOpen]=useState(false);
 const base="/api/admin/quotes/"+id;
 async function request(url:string,body:object,method="POST"){
  setBusy(true);setError("");
  try{
   const res=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   const result=await res.json();
   if(!res.ok)throw new Error(result.error||"Unable to save quotation");
   if(result.bookingId)setBooking(result.bookingId);
   toast.success("Quotation updated");setNote("");setDialogOpen(false);router.refresh();
  }catch(e){const text=e instanceof Error?e.message:"Unable to save";setError(text);toast.error(text);}
  finally{setBusy(false);}
 }
 const update=(next:string)=>request(base,{status:next,note},"PATCH");
 const price=(e:FormEvent)=>{e.preventDefault();void request(base+"/pricing",{amount,note});};
 return <Card className="gap-0 rounded-2xl py-0">
  <CardHeader className="px-5 pb-4 pt-5"><CardTitle className="text-[15px] font-semibold">Next step</CardTitle><CardDescription className="text-[12px]">Progress through review, pricing and customer approval.</CardDescription></CardHeader>
  <CardContent className="space-y-4 px-5 pb-5">
   <div className="flex gap-3 rounded-lg bg-secondary/70 p-3 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0"/>Quote sending and acceptance are recorded manually. Automatic emails are not yet enabled.</div>
   {error&&<p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
   {booking&&<Button nativeButton={false} variant="outline" className="w-full" render={<Link href={"/dashboard/bookings/"+booking}/>}>Open created booking <ArrowRight/></Button>}
   {status==="NEW"&&<Button className="w-full" disabled={busy} onClick={()=>update("REVIEWING")}>Start review <ArrowRight className="size-4"/></Button>}
   {status==="REVIEWING"&&<form onSubmit={price} className="space-y-4">
    <Field><FieldLabel htmlFor="quote-amount">Quoted total (ZAR)</FieldLabel><Input className="h-10" id="quote-amount" type="number" min=".01" max="999999999" step=".01" required placeholder="4500.00" value={amount} onChange={e=>setAmount(e.target.value)}/></Field>
    <Field><FieldLabel htmlFor="quote-notes">Pricing notes</FieldLabel><Textarea id="quote-notes" rows={3} maxLength={1000} value={note} onChange={e=>setNote(e.target.value)}/><FieldDescription>Specify assumptions and freight details for internal records.</FieldDescription></Field>
    <Button type="submit" disabled={busy} className="w-full">Save quoted price <CheckCircle2 className="size-4"/></Button>
   </form>}
   {status==="PRICED"&&<div className="space-y-4">
    <Field><FieldLabel htmlFor="sent-evidence">Quotation delivery evidence</FieldLabel><Textarea id="sent-evidence" value={note} onChange={e=>setNote(e.target.value)} rows={3} minLength={10} maxLength={1000} placeholder="How and when you sent the approved price..."/></Field>
    <Button className="w-full" disabled={busy||note.trim().length<10} onClick={()=>update("SENT")}>Record as sent <Send className="size-4"/></Button>
   </div>}
   {status==="SENT"&&<div className="space-y-4">
    <Field><FieldLabel htmlFor="accept-evidence">Customer approval evidence</FieldLabel><Textarea id="accept-evidence" value={note} onChange={e=>setNote(e.target.value)} rows={4} minLength={10} maxLength={1000} placeholder="Record written customer acceptance and the date it was received..."/></Field>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
     <DialogTrigger render={<Button className="w-full" disabled={busy||note.trim().length<10}/>}>Accept quote and create booking <ArrowRight className="size-4"/></DialogTrigger>
     <DialogContent><DialogHeader><DialogTitle>Confirm customer acceptance</DialogTitle><DialogDescription>This will mark the quotation as accepted and create a new pending booking. Ensure you have verified the customer&apos;s written approval.</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button variant="outline"/>}>Cancel</DialogClose><Button disabled={busy} onClick={()=>request(base+"/accept",{evidence:note})}><ShieldCheck className="size-4"/> Confirm and create booking</Button></DialogFooter></DialogContent>
    </Dialog>
    <Button className="w-full" variant="outline" disabled={busy||note.trim().length<10} onClick={()=>update("EXPIRED")}>Record as expired</Button>
   </div>}
   {["NEW","REVIEWING","PRICED"].includes(status)&&<div className="space-y-3 border-t pt-4">
    <Field><FieldLabel htmlFor="decline-reason">Decline reason</FieldLabel><Textarea id="decline-reason" value={note} onChange={e=>setNote(e.target.value)} rows={2} maxLength={1000} placeholder="Reason for declining..."/></Field>
    <Button className="w-full" variant="destructive" disabled={busy||note.trim().length<10} onClick={()=>update("DECLINED")}>Decline quotation</Button>
   </div>}
   {["ACCEPTED","DECLINED","EXPIRED"].includes(status)&&<div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">This quotation is closed. {status==="ACCEPTED"?"Its booking is available from the booking list.":"No more changes are permitted."}</div>}
  </CardContent>
 </Card>;
}
