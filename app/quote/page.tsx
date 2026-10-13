"use client";
import Link from "next/link";
import {useState,type FormEvent} from "react";
import {toast} from "sonner";
import {ArrowLeft,ArrowUpRight,CheckCircle2,MapPin,Package,Truck} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import {Field,FieldLabel,FieldDescription} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/components/ui/select";
const services=["Road freight","Courier delivery","Dedicated truck","Express shipment"];
export default function QuotePage(){
 const [service,setService]=useState("Road freight");
 const [sent,setSent]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setBusy(true);
  const fields=Object.fromEntries(new FormData(e.currentTarget).entries());
  try{
   const response=await fetch("/api/quotes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...fields,serviceType:service})});
   const data=await response.json();if(!response.ok)throw new Error(data.error??"Unable to submit this enquiry");
   setSent(data.reference);toast.success("Quote request received");
  }catch(error){const message=error instanceof Error?error.message:"Something went wrong";setError(message);toast.error(message);}
  finally{setBusy(false);}
 }
 const controls:[string,string,string,boolean][]=[
 ["contactName","Contact name","text",true],["company","Company / trading name","text",false],
 ["email","Business email","email",true],["phone","Contact number","tel",true],
 ["origin","Collection address / city","text",true],["destination","Delivery address / city","text",true],
 ["pickupDate","Preferred collection date","date",false],["weightKg","Estimated weight (kg)","number",false]
 ];
 return <main className="min-h-screen bg-background">
  <header className="border-b bg-white"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"><Link href="/" className="text-xl font-black tracking-tight">NOVAL<span className="text-[#e96843]">.</span> <span className="font-normal text-muted-foreground">LOGISTICS</span></Link><div className="flex gap-3"><Button variant="ghost" render={<Link href="/" />}><ArrowLeft className="size-4"/> Home</Button><Button variant="outline" render={<Link href="/track"/>}>Track shipment <ArrowUpRight className="size-4"/></Button></div></div></header>
  <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[0.72fr_1fr] lg:py-20">
   <div className="lg:pt-9">
    <Badge variant="outline" className="border-[#e96843]/30 text-[#ca5635]">Freight enquiries</Badge>
    <h1 className="mt-6 max-w-lg text-5xl font-bold leading-tight tracking-[-.06em] sm:text-6xl">Your next shipment starts here.</h1>
    <p className="mt-6 max-w-md text-lg leading-8 text-muted-foreground">Tell our team where your cargo is going, what you are moving and when you need it collected. We will assess the request and prepare a quotation.</p>
    <div className="mt-12 grid gap-6">
     {[[MapPin,"Tell us the route","Collection and destination details"],[Package,"Describe your goods","Type, estimated weight and handling"],[Truck,"Let us plan the movement","Our team reviews transport requirements"]].map(([Icon,title,description])=><div className="flex gap-4" key={title as string}><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary"><Icon className="size-5 text-primary"/></div><div><h2 className="text-sm font-semibold">{title as string}</h2><p className="mt-1 text-sm text-muted-foreground">{description as string}</p></div></div>)}
    </div>
   </div>
   <Card className="border-border bg-card shadow-lg">
    {sent?<CardContent className="flex flex-col items-center px-6 py-16 text-center"><CheckCircle2 className="size-14 text-emerald-600"/><h2 className="mt-6 text-3xl font-semibold tracking-tight">Your request is in.</h2><p className="mt-3 text-muted-foreground">Your quotation enquiry has been saved for review.</p><Badge variant="secondary" className="mt-5 px-4 py-2">Reference: {sent}</Badge><Button className="mt-8" render={<Link href="/"/>}>Back to website <ArrowUpRight className="size-4"/></Button></CardContent>:
     <>
      <CardHeader className="border-b pb-5"><CardTitle className="text-2xl font-semibold">Request a freight quotation</CardTitle><CardDescription>Complete the details below. Fields marked * are required.</CardDescription></CardHeader>
      <CardContent>
       <form onSubmit={submit} className="space-y-7">
        <div><h3 className="mb-4 text-sm font-semibold">01 — Contact details</h3><div className="grid gap-4 sm:grid-cols-2">{controls.slice(0,4).map(([name,label,type,required])=><Field key={name}><FieldLabel htmlFor={name}>{label}{required?" *":""}</FieldLabel><Input id={name} name={name} type={type} required={required} maxLength={name==="email"?254:150} className="h-11"/></Field>)}</div></div>
        <div className="border-t pt-6"><h3 className="mb-4 text-sm font-semibold">02 — Shipment information</h3><div className="grid gap-4 sm:grid-cols-2">{controls.slice(4).map(([name,label,type,required])=><Field key={name}><FieldLabel htmlFor={name}>{label}{required?" *":""}</FieldLabel><Input id={name} name={name} type={type} required={required} step={type==="number"?"0.01":undefined} min={type==="number"?"0.01":undefined} className="h-11"/></Field>)}</div></div>
        <Field><FieldLabel>Transport service</FieldLabel><Select value={service} onValueChange={v=>setService(v??"Road freight")}><SelectTrigger className="h-11 w-full"><SelectValue/></SelectTrigger><SelectContent>{services.map(item=><SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>
        <Field><FieldLabel htmlFor="cargoDetails">Cargo description *</FieldLabel><Textarea id="cargoDetails" name="cargoDetails" required rows={4} maxLength={1500} placeholder="Number of pallets, dimensions, cargo type or any special handling requirements..."/><FieldDescription>Please do not include sensitive personal documents.</FieldDescription></Field>
        {error&&<p role="alert" className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy} size="lg" className="h-12 w-full">{busy?"Submitting your request...":"Submit quote request"} <ArrowUpRight className="ml-2 size-4"/></Button>
        <p className="text-center text-xs text-muted-foreground">Our operations team reviews quotation requests before pricing and confirming transport.</p>
       </form>
      </CardContent>
     </>}
   </Card>
  </div>
 </main>;
}
