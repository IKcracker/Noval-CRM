"use client";
import Link from "next/link";
import {useState,type FormEvent} from "react";
import {Check,Copy,Loader2,XCircle} from "lucide-react";
import {Arrow,SiteFooter,SiteHeader} from "@/components/site/site-chrome";
// Local photo: courier loading boxed cargo into a van.
const cargoImage="/fleet/cargo-van.jpg";
const services=[
 {name:"Road freight",info:"Commercial loads by road"},
 {name:"Courier delivery",info:"Parcels and small consignments"},
 {name:"Dedicated truck",info:"A vehicle for your load only"},
 {name:"Express shipment",info:"Time-critical deliveries"}
];
const field="h-12 w-full border border-[#d6dbd2] bg-[#f5f4ef] px-4 text-[15px] outline-none transition placeholder:text-[#18251f]/35 focus:border-[#fb5b32] focus:bg-white";
const labelText="text-xs font-bold uppercase tracking-[.16em]";
function Eyebrow({children,light=false}:{children:React.ReactNode;light?:boolean}){
 return <div className={"flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.2em] "+(light?"text-white/80":"text-[#ed5938]")}><span className={"h-[2px] w-10 "+(light?"bg-[#fb5b32]":"bg-[#ed5938]")}/>{children}</div>;
}
function Input({name,label,type="text",required=false,hint,...rest}:{name:string;label:string;type?:string;required?:boolean;hint?:string}&React.InputHTMLAttributes<HTMLInputElement>){
 return <label className="block"><span className={labelText}>{label}{required&&<span className="text-[#ed5938]"> *</span>}</span><input id={name} name={name} type={type} required={required} className={field+" mt-2"} {...rest}/>{hint&&<span className="mt-2 block text-xs text-[#68736d]">{hint}</span>}</label>;
}
export default function QuotePage(){
 const [service,setService]=useState("Road freight");
 const [sent,setSent]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[copied,setCopied]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setBusy(true);
  const fields=Object.fromEntries(new FormData(e.currentTarget).entries());delete fields.serviceChoice;
  try{
   const response=await fetch("/api/quotes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...fields,serviceType:service})});
   const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error??"Unable to submit this enquiry");
   setSent(data.reference);window.scrollTo({top:0,behavior:"smooth"});
  }catch(error){setError(error instanceof Error?error.message:"Something went wrong");}
  finally{setBusy(false);}
 }
 async function copy(){await navigator.clipboard.writeText(sent);setCopied(true);setTimeout(()=>setCopied(false),1600);}
 return <main className="min-h-screen bg-[#f5f4ef] font-sans text-[#18251f] selection:bg-[#fb5b32] selection:text-white">
  <SiteHeader current="/quote"/>

  <section className="relative isolate overflow-hidden bg-[#18251f]">
   <div className="absolute inset-0 bg-cover bg-center lg:left-[31%]" style={{backgroundImage:`url("${cargoImage}")`}}/>
   <div className="absolute inset-0 bg-gradient-to-r from-[#15251f] via-[#15251f]/90 to-[#15251f]/30 lg:via-[#15251f]/85"/>
   <div className="absolute inset-0 bg-gradient-to-t from-[#14251f]/95 via-transparent to-transparent"/>
   <div className="relative mx-auto max-w-[1536px] px-6 pb-36 pt-14 sm:px-9 lg:pb-40 lg:pt-16 xl:px-16">
    <div className="mb-9"><Eyebrow light>Freight enquiries</Eyebrow></div>
    <h1 className="text-[clamp(2.6rem,5vw,5rem)] font-black leading-[.95] tracking-[-.045em] text-white">{sent?<>REQUEST<br/><span className="text-[#fb5b32]">RECEIVED.</span></>:<>GET A FREIGHT<br/><span className="text-[#fb5b32]">QUOTE.</span></>}</h1>
    <div className="mt-8 max-w-[600px] border-l-[3px] border-[#fb5b32] pl-6"><p className="text-base leading-7 text-white/80 md:text-lg">{sent?"Our operations team will review your requirements and follow up with a quotation.":"Tell us where your cargo is going, what you're moving and when it needs collecting. We'll assess it and prepare a quotation."}</p></div>
   </div>
  </section>

  <div className="relative mx-auto -mt-28 max-w-[1536px] px-6 pb-24 sm:px-9 xl:px-16">
   {sent?<section className="grid bg-white shadow-[0_40px_90px_-40px_rgba(20,35,29,.45)] lg:grid-cols-[1.3fr_1fr]">
    <div className="p-6 sm:p-8">
     <span className="grid size-11 place-items-center bg-[#fb5b32] text-white"><Check className="size-5"/></span>
     <h2 className="mt-8 text-[clamp(1.9rem,3vw,2.75rem)] font-black leading-[.95] tracking-[-.045em]">YOUR REQUEST<br/><span className="text-[#ed5938]">IS IN.</span></h2>
     <p className="mt-6 max-w-md text-base leading-8 text-[#68736d]">Keep this reference for any follow-up. Once your quote is accepted and the trip is scheduled, you&apos;ll receive a tracking number starting with NVL-.</p>
     <div className="mt-9 flex flex-wrap gap-3"><Link href="/" className="inline-flex h-12 items-center gap-6 bg-[#18251f] px-7 text-sm font-extrabold text-white transition hover:bg-[#fb5b32]">Back to website <Arrow/></Link><button type="button" onClick={()=>{setSent("");setService("Road freight");}} className="inline-flex h-12 items-center gap-6 border border-[#18251f] px-7 text-sm font-bold transition hover:bg-[#18251f] hover:text-white">New request <Arrow diagonal/></button></div>
    </div>
    <div className="flex flex-col justify-between bg-[#fb5b32] p-6 text-white sm:p-8">
     <p className="text-xs font-bold uppercase tracking-[.2em] text-white/85">Your reference</p>
     <div className="mt-10"><button type="button" onClick={copy} className="group inline-flex items-center gap-3 text-left" aria-label="Copy reference"><span className="font-mono text-2xl font-bold tracking-wider sm:text-3xl">{sent}</span>{copied?<Check className="size-5"/>:<Copy className="size-5 opacity-70 group-hover:opacity-100"/>}</button>
      <p className="mt-3 text-sm text-white/85">Quote this reference when you contact our team.</p></div>
    </div>
   </section>
   :<form onSubmit={submit} className="bg-white shadow-[0_40px_90px_-40px_rgba(20,35,29,.45)]">
    <div className="grid gap-6 border-b border-[#e7e5dc] p-5 sm:p-7 lg:grid-cols-[220px_1fr]">
     <div><span className="text-sm font-black text-[#ed5938]">01 /</span><h2 className="mt-3 text-2xl font-black leading-[1.05] tracking-[-.04em]">YOUR<br/>DETAILS.</h2><p className="mt-3 text-sm leading-6 text-[#68736d]">Who should we send the quotation to?</p></div>
     <div className="grid gap-4 sm:grid-cols-2">
      <Input name="contactName" label="Contact name" required maxLength={150} autoComplete="name"/>
      <Input name="company" label="Company / trading name" maxLength={150} autoComplete="organization"/>
      <Input name="email" label="Business email" type="email" required maxLength={254} autoComplete="email"/>
      <Input name="phone" label="Contact number" type="tel" required maxLength={150} autoComplete="tel"/>
     </div>
    </div>
    <div className="grid gap-6 border-b border-[#e7e5dc] p-5 sm:p-7 lg:grid-cols-[220px_1fr]">
     <div><span className="text-sm font-black text-[#ed5938]">02 /</span><h2 className="mt-3 text-2xl font-black leading-[1.05] tracking-[-.04em]">THE<br/>JOURNEY.</h2><p className="mt-3 text-sm leading-6 text-[#68736d]">Where it starts, where it ends and when.</p></div>
     <div className="grid gap-4 sm:grid-cols-2">
      <Input name="origin" label="Collection address / city" required maxLength={150} placeholder="e.g. Midrand, Gauteng"/>
      <Input name="destination" label="Delivery address / city" required maxLength={150} placeholder="e.g. Durban, KwaZulu-Natal"/>
      <Input name="pickupDate" label="Preferred collection date" type="date"/>
      <Input name="weightKg" label="Estimated weight (kg)" type="number" step="0.01" min="0.01" placeholder="e.g. 1200"/>
     </div>
    </div>
    <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[220px_1fr]">
     <div><span className="text-sm font-black text-[#ed5938]">03 /</span><h2 className="mt-3 text-2xl font-black leading-[1.05] tracking-[-.04em]">THE<br/>CARGO.</h2><p className="mt-3 text-sm leading-6 text-[#68736d]">Choose a service and describe what you&apos;re moving.</p></div>
     <div className="space-y-5">
      <fieldset><legend className={labelText}>Transport service</legend>
       <div className="mt-2 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{services.map(s=>{const on=service===s.name;return <label key={s.name} className={"relative cursor-pointer border p-3.5 transition "+(on?"border-[#fb5b32] bg-[#fff4f0]":"border-[#d6dbd2] bg-[#f5f4ef] hover:border-[#18251f]/40")}>
        <input type="radio" name="serviceChoice" value={s.name} checked={on} onChange={()=>setService(s.name)} className="sr-only"/>
        <span className="flex items-start justify-between gap-2"><span className="text-[15px] font-black tracking-[-.03em]">{s.name}</span><span className={"grid size-5 shrink-0 place-items-center border "+(on?"border-[#fb5b32] bg-[#fb5b32] text-white":"border-[#c5c9bf] bg-white")}>{on&&<Check className="size-3.5"/>}</span></span>
        <span className="mt-1 block text-xs text-[#68736d]">{s.info}</span>
       </label>;})}</div>
      </fieldset>
      <label className="block"><span className={labelText}>Cargo description<span className="text-[#ed5938]"> *</span></span><textarea name="cargoDetails" required rows={4} maxLength={1500} placeholder="Number of pallets, dimensions, cargo type or any special handling requirements…" className="mt-2 w-full border border-[#d6dbd2] bg-[#f5f4ef] p-3.5 text-[15px] outline-none transition placeholder:text-[#18251f]/35 focus:border-[#fb5b32] focus:bg-white"/><span className="mt-2 block text-xs text-[#68736d]">Please don&apos;t include sensitive personal documents.</span></label>
      {error&&<div role="alert" className="flex items-start gap-3 border-l-[3px] border-[#d64545] bg-[#fdf1ef] px-5 py-4 text-[#8f2a20]"><XCircle className="mt-0.5 size-5 shrink-0"/><p className="font-bold">{error}</p></div>}
      <div className="flex flex-wrap items-center justify-between gap-5 border-t border-[#e7e5dc] pt-6">
       <p className="max-w-md text-sm leading-6 text-[#68736d]">Fields marked <span className="text-[#ed5938]">*</span> are required. Our operations team reviews every request before pricing and confirming transport.</p>
       <button type="submit" disabled={busy} className="inline-flex h-12 items-center justify-between gap-8 bg-[#fb5b32] px-6 text-sm font-extrabold uppercase tracking-[.1em] text-white transition hover:bg-[#f47a58] disabled:opacity-60">{busy?<>Submitting <Loader2 className="size-5 animate-spin"/></>:<>Submit request <Arrow diagonal/></>}</button>
      </div>
     </div>
    </div>
   </form>}

   <section className="mt-16 grid gap-14 lg:grid-cols-[.75fr_1.25fr]">
    <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#ed5938]">What happens next</p><h2 className="mt-6 text-[clamp(2rem,3.4vw,3.25rem)] font-black leading-[.98] tracking-[-.045em]">FROM<br/>ENQUIRY<br/><span className="text-[#ed5938]">TO ARRIVAL.</span></h2></div>
    <div className="divide-y divide-[#d6dbd2] border-t border-[#d6dbd2]">{[["01","We review your request","Our team checks the route, cargo and timing you've shared."],["02","You receive a quotation","We follow up with pricing and any questions about handling."],["03","We plan the movement","Once you accept, the booking moves into scheduling and dispatch."],["04","Track every milestone","You'll get an NVL- tracking number to follow your shipment."]].map(([n,title,desc])=><div key={n} className="grid gap-3 py-5 sm:grid-cols-[56px_1fr_1.15fr] sm:items-start"><span className="text-base font-black text-[#ed5938]">{n}</span><h3 className="text-lg font-black tracking-[-.03em]">{title}</h3><p className="text-sm leading-7 text-[#68736d]">{desc}</p></div>)}</div>
   </section>
  </div>

  <SiteFooter/>
 </main>;
}
