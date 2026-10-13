"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
import {toast} from "sonner";
import {ArrowRight,MapPin,PackageSearch,Clock3,CheckCircle2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Field,FieldLabel} from "@/components/ui/field";
import {Separator} from "@/components/ui/separator";
type Event={status:string;note:string|null;created_at:string};
type Result={trackingNumber:string;status:string;origin:string;destination:string;scheduledDeparture:string|null;scheduledArrival:string|null;events:Event[]};
export default function Track(){
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<Result|null>(null);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setResult(null);setError("");
  const f=new FormData(e.currentTarget);
  try{
   const res=await fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:f.get("reference"),email:f.get("email")})});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Tracking temporarily unavailable");
   setResult(data);toast.success("Shipment located");
  }catch(e){const message=e instanceof Error?e.message:"Tracking is unavailable";setError(message);toast.error(message);}
  finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-background">
  <header className="border-b bg-card"><div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-6"><Link href="/" className="text-xl font-black tracking-tight">NOVAL<span className="text-[#e96843]">.</span> <span className="font-normal text-muted-foreground">LOGISTICS</span></Link><Button variant="outline" render={<Link href="/quote"/>}>Get a quote <ArrowRight className="size-4"/></Button></div></header>
  <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
   <div className="text-center"><Badge variant="outline" className="mb-4"><PackageSearch className="size-3.5"/> Shipment tracking</Badge><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Track your shipment</h1><p className="mx-auto mt-4 max-w-xl text-muted-foreground">View confirmed dispatch information and recorded milestones by entering your tracking reference and customer email.</p></div>
   <Card className="mx-auto max-w-4xl shadow-sm"><CardHeader><CardTitle>Find your consignment</CardTitle><CardDescription>A reference is issued when a trip is confirmed.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="tracking">Tracking reference</FieldLabel><Input id="tracking" name="reference" placeholder="NVL-XXXXXXXXXXXXXXXX" required className="h-11"/></Field><Field><FieldLabel htmlFor="tracking-email">Customer email</FieldLabel><Input id="tracking-email" name="email" type="email" placeholder="you@business.co.za" required className="h-11"/></Field><div className="sm:col-span-2"><Button className="h-11 w-full" disabled={busy} type="submit">{busy?"Checking shipment...":"Track shipment"} <ArrowRight className="size-4"/></Button></div></form>{error&&<p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}</CardContent></Card>
   {result&&<div className="grid gap-5 lg:grid-cols-[1.4fr_.8fr]"><Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-4"><div><CardDescription>Shipment reference</CardDescription><CardTitle className="mt-2 text-2xl">{result.trackingNumber}</CardTitle></div><Badge>{result.status.replaceAll("_"," ")}</Badge></div></CardHeader><CardContent className="space-y-7"><div className="grid gap-5 rounded-xl bg-muted/50 p-5 sm:grid-cols-2"><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Collection</p><p className="mt-2 flex items-start gap-2 text-sm font-semibold"><MapPin className="size-4 shrink-0 text-[#e96843]"/>{result.origin}</p></div><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Destination</p><p className="mt-2 flex items-start gap-2 text-sm font-semibold"><MapPin className="size-4 shrink-0 text-[#e96843]"/>{result.destination}</p></div></div><div><h2 className="mb-5 text-base font-semibold">Shipping milestones</h2><div className="space-y-0">{result.events.map((evt,i)=><div key={i} className="flex gap-4"><div className="flex flex-col items-center"><CheckCircle2 className="size-5 text-emerald-600"/>{i<result.events.length-1&&<div className="my-1 min-h-12 w-px bg-border"/>}</div><div className="pb-6"><p className="font-medium">{evt.status.replaceAll("_"," ")}</p><p className="mt-1 text-sm text-muted-foreground">{evt.note||"Shipment event recorded"}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(evt.created_at).toLocaleString("en-ZA")}</p></div></div>)}</div></div></CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock3 className="size-5"/> Scheduled journey</CardTitle><CardDescription>Shipment plan, not live GPS data</CardDescription></CardHeader><CardContent className="space-y-5 text-sm"><div><p className="text-muted-foreground">Scheduled departure</p><p className="mt-1 font-semibold">{result.scheduledDeparture?new Date(result.scheduledDeparture).toLocaleString("en-ZA"):"Pending"}</p></div><Separator/><div><p className="text-muted-foreground">Scheduled arrival</p><p className="mt-1 font-semibold">{result.scheduledArrival?new Date(result.scheduledArrival).toLocaleString("en-ZA"):"Pending"}</p></div><p className="rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">A live map will be available only after GPS positioning and a routing provider are connected.</p></CardContent></Card></div>}
  </div>
 </main>;
}
