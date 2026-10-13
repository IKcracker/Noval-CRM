"use client";
import {useRef,useState,type FormEvent} from "react";
import Link from "next/link";
import {AlertTriangle,Check,Copy,Loader2,XCircle} from "lucide-react";
import {Arrow,SiteFooter,SiteHeader} from "@/components/site/site-chrome";
type Event={status:string;note:string|null;location_label:string|null;created_at:string};
type Result={trackingNumber:string;status:string;origin:string;destination:string;scheduledDeparture:string|null;scheduledArrival:string|null;events:Event[]};
const freightImage="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2200&q=85";
const steps=[{status:"SCHEDULED",label:"Booked"},{status:"PICKED_UP",label:"Collected"},{status:"IN_TRANSIT",label:"In transit"},{status:"OUT_FOR_DELIVERY",label:"Out for delivery"},{status:"DELIVERED",label:"Delivered"}];
// Two-line uppercase headlines; the second line is highlighted in orange, as on the landing page.
const headline:Record<string,[string,string]>={
 SCHEDULED:["BOOKED AND","SCHEDULED."],PICKED_UP:["COLLECTED.","ON THE MOVE."],IN_TRANSIT:["ON ITS","WAY."],OUT_FOR_DELIVERY:["OUT FOR","DELIVERY."],
 DELIVERED:["DELIVERED.","JOB DONE."],EXCEPTION:["DELAYED.","WE'RE ON IT."],RETURNED:["RETURNED TO","SENDER."],CANCELLED:["SHIPMENT","CANCELLED."]
};
const label=(s:string)=>s==="EXCEPTION"?"Delayed":steps.find(x=>x.status===s)?.label??s.charAt(0)+s.slice(1).toLowerCase().replaceAll("_"," ");
const when=(iso:string)=>new Date(iso).toLocaleString("en-ZA",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Africa/Johannesburg"});
const dayOnly=(iso:string)=>new Date(iso).toLocaleDateString("en-ZA",{weekday:"long",day:"numeric",month:"long",timeZone:"Africa/Johannesburg"});
function Eyebrow({children,light=false}:{children:React.ReactNode;light?:boolean}){
 return <div className={"flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.2em] "+(light?"text-white/80":"text-[#ed5938]")}><span className={"h-[2px] w-10 "+(light?"bg-[#fb5b32]":"bg-[#ed5938]")}/>{children}</div>;
}
const field="h-12 w-full border border-[#d6dbd2] bg-[#f5f4ef] px-4 text-[15px] outline-none transition placeholder:text-[#18251f]/35 focus:border-[#fb5b32] focus:bg-white";
export default function Track(){
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<Result|null>(null),[copied,setCopied]=useState(false);
 const resultRef=useRef<HTMLDivElement>(null);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");
  const f=new FormData(e.currentTarget);
  try{
   const res=await fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:String(f.get("reference")??"").trim().toUpperCase(),email:f.get("email")})});
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(data.error||"Tracking is temporarily unavailable");
   setResult(data);
   requestAnimationFrame(()=>resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}));
  }catch(e){setResult(null);setError(e instanceof Error?e.message:"Tracking is temporarily unavailable");}
  finally{setBusy(false);}
 }
 async function copy(){if(!result)return;await navigator.clipboard.writeText(result.trackingNumber);setCopied(true);setTimeout(()=>setCopied(false),1600);}
 // Halted shipments keep the furthest milestone they reached and are flagged on the next step.
 const halted=result&&["EXCEPTION","RETURNED","CANCELLED"].includes(result.status);
 const reached=result?Math.max(0,halted?Math.max(0,...result.events.map(e=>steps.findIndex(s=>s.status===e.status))):steps.findIndex(s=>s.status===result.status)):0;
 const delivered=result?.status==="DELIVERED";
 const failAt=halted?Math.min(reached+1,steps.length-1):-1;
 const [lineOne,lineTwo]=result?headline[result.status]??[label(result.status).toUpperCase(),""]:["",""];
 const deliveredAt=result?.events.find(e=>e.status==="DELIVERED")?.created_at??result?.events[0]?.created_at;
 return <main className="min-h-screen bg-[#f5f4ef] font-sans text-[#18251f] selection:bg-[#fb5b32] selection:text-white">
  <SiteHeader current="/track"/>

  <section className="relative isolate overflow-hidden bg-[#18251f]">
   <div className="absolute inset-0 bg-cover bg-[center_45%] lg:left-[31%]" style={{backgroundImage:`url("${freightImage}")`}}/>
   <div className="absolute inset-0 bg-gradient-to-r from-[#15251f] via-[#15251f]/90 to-[#15251f]/30 lg:via-[#15251f]/85"/>
   <div className="absolute inset-0 bg-gradient-to-t from-[#14251f]/95 via-transparent to-transparent"/>
   <div className="relative mx-auto max-w-[1536px] px-6 pb-36 pt-14 sm:px-9 lg:pb-40 lg:pt-16 xl:px-16">
    <div className="mb-9"><Eyebrow light>Shipment tracking</Eyebrow></div>
    <h1 className="text-[clamp(2.6rem,5vw,5rem)] font-black leading-[.95] tracking-[-.045em] text-white">TRACK YOUR<br/><span className="text-[#fb5b32]">SHIPMENT.</span></h1>
    <div className="mt-8 max-w-[600px] border-l-[3px] border-[#fb5b32] pl-6"><p className="text-base leading-7 text-white/80 md:text-lg">Enter the tracking number from your booking confirmation and the email you booked with to follow every milestone.</p></div>
   </div>
  </section>

  <div className="relative mx-auto -mt-28 max-w-[1536px] px-6 pb-24 sm:px-9 xl:px-16">
   <form onSubmit={submit} className="bg-white p-5 shadow-[0_40px_90px_-40px_rgba(20,35,29,.45)] sm:p-7">
    <div className="flex flex-wrap items-center justify-between gap-4"><span className="text-xs font-extrabold uppercase tracking-[.2em] text-[#ed5938]">Find your consignment — 01 / 02</span><span className="text-xs text-[#68736d]">Tracking numbers start with NVL-</span></div>
    <div className="mt-5 grid gap-3 lg:grid-cols-[1.15fr_1fr_auto] lg:items-end">
     <label className="block"><span className="text-xs font-bold uppercase tracking-[.16em]">Tracking number</span><input name="reference" required autoComplete="off" spellCheck={false} pattern="[Nn][Vv][Ll]-[A-Fa-f0-9]{16}" title="Format: NVL- followed by 16 letters/numbers" placeholder="NVL-XXXXXXXXXXXXXXXX" className={field+" mt-2 font-mono uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"}/></label>
     <label className="block"><span className="text-xs font-bold uppercase tracking-[.16em]">Booking email</span><input name="email" type="email" required autoComplete="email" placeholder="you@business.co.za" className={field+" mt-2"}/></label>
     <button type="submit" disabled={busy} className="inline-flex h-12 items-center justify-between gap-6 bg-[#fb5b32] px-5 text-sm font-extrabold uppercase tracking-[.1em] text-white transition hover:bg-[#f47a58] disabled:opacity-60">{busy?<>Searching <Loader2 className="size-5 animate-spin"/></>:<>Track shipment <Arrow diagonal/></>}</button>
    </div>
    <p className="mt-5 text-sm leading-6 text-[#68736d]">Your email only confirms the shipment is yours. Milestones are shared by our operations team; they are not live GPS.</p>
    {error&&<div role="alert" className="mt-6 flex items-start gap-3 border-l-[3px] border-[#d64545] bg-[#fdf1ef] px-5 py-4 text-[#8f2a20]"><XCircle className="mt-0.5 size-5 shrink-0"/><div><p className="font-bold">{error}</p><p className="mt-1 text-sm text-[#8f2a20]/80">Check both details match your booking confirmation exactly.</p></div></div>}
   </form>

   {result?<div ref={resultRef} className="mt-4 scroll-mt-6 space-y-4">
    <section className="grid bg-[#18251f] text-white lg:grid-cols-[1.4fr_1fr]">
     <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4"><Eyebrow light>Status — 02 / 02</Eyebrow><button type="button" onClick={copy} className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-white/60 hover:text-white" aria-label="Copy tracking number">{result.trackingNumber}{copied?<Check className="size-3.5 text-[#fb7757]"/>:<Copy className="size-3.5"/>}</button></div>
      <h2 className="mt-8 text-[clamp(2rem,3.4vw,3.25rem)] font-black leading-[.95] tracking-[-.045em]">{lineOne}<br/><span className={halted?"text-[#ff8a70]":"text-[#fb5b32]"}>{lineTwo}</span></h2>
      <p className="mt-8 flex flex-wrap items-center gap-3 text-sm font-bold uppercase tracking-[.12em] text-white/80">{result.origin} <Arrow/> {result.destination}</p>
     </div>
     <div className={"flex flex-col justify-between p-6 sm:p-8 "+(halted?"bg-[#c84a33]":"bg-[#fb5b32]")}>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-white/85">{delivered?"Delivered on":halted?"Current status":"Scheduled delivery"}</p>
      <div className="mt-6"><p className="text-3xl font-black leading-[1.05] tracking-[-.035em]">{delivered?(deliveredAt?dayOnly(deliveredAt):"Delivered"):halted?label(result.status):result.scheduledArrival?dayOnly(result.scheduledArrival):"To be confirmed"}</p>
       {!delivered&&!halted&&result.scheduledArrival&&<p className="mt-3 text-sm text-white/80">Planned schedule, not a guaranteed time.</p>}</div>
     </div>
    </section>

    <section className="bg-white p-6 sm:p-8">
     <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#ed5938]">Delivery progress</p>
     <ol className="mt-8 grid grid-cols-5 gap-2 sm:gap-3">{steps.map((s,i)=>{const failed=i===failAt,done=i<=reached&&!failed,current=!halted&&!delivered&&i===reached;return <li key={s.status} className="min-w-0">
      <div className={"h-2 "+(failed?"bg-[#d64545]":done?"bg-[#fb5b32]":"bg-[#e3e6dd]")+(current?" animate-pulse":"")}/>
      <p className={"mt-4 text-sm font-black "+(failed?"text-[#d64545]":done?"text-[#ed5938]":"text-[#18251f]/30")}>0{i+1}</p>
      <p className={"mt-1 hidden text-base font-extrabold leading-tight tracking-[-.02em] sm:block "+(done||failed?"":"text-[#18251f]/40")}>{failed?"Delayed":s.label}</p>
     </li>;})}</ol>
     <p className="mt-4 text-sm font-extrabold sm:hidden">Step {(halted?failAt:reached)+1} of {steps.length} · <span className={halted?"text-[#d64545]":"text-[#ed5938]"}>{halted?"Delayed":steps[reached].label}</span></p>
     {halted&&<div className="mt-8 flex items-start gap-3 border-l-[3px] border-[#d64545] bg-[#fdf1ef] px-5 py-4 text-[#8f2a20]"><AlertTriangle className="mt-0.5 size-5 shrink-0"/><p>{(result.events[0]?.status===result.status&&result.events[0]?.note)||(result.status==="EXCEPTION"?"Your shipment has been delayed. Our operations team is resolving it and will be in touch.":"Please contact our operations team for details about this shipment.")}</p></div>}
    </section>

    <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
     <section className="bg-white p-6 sm:p-8">
      <h3 className="text-[clamp(1.5rem,2.2vw,2rem)] font-black leading-[.95] tracking-[-.045em]">SHIPMENT <span className="text-[#ed5938]">HISTORY.</span></h3>
      {result.events.length?<div className="mt-6 divide-y divide-[#d6dbd2] border-t border-[#d6dbd2]">{result.events.map((e,i)=><div key={i} className="grid gap-1.5 py-5 sm:grid-cols-[140px_1fr] sm:gap-6">
       <p className="text-sm font-bold text-[#ed5938]">{when(e.created_at)}</p>
       <div><p className="text-lg font-black tracking-[-.03em]">{label(e.status)}</p>{e.note&&<p className="mt-1.5 text-sm leading-7 text-[#68736d]">{e.note}</p>}{e.location_label&&<p className="mt-1 text-xs font-bold uppercase tracking-[.14em] text-[#18251f]/50">{e.location_label}</p>}</div>
      </div>)}</div>:<p className="mt-8 border-t border-[#d6dbd2] pt-6 text-sm leading-7 text-[#68736d]">No milestones have been shared yet. Check back once your shipment is collected.</p>}
     </section>
     <aside className="space-y-4">
      <section className="bg-[#e3e6dd] p-6 sm:p-8">
       <p className="text-xs font-bold uppercase tracking-[.16em]">Route</p>
       <div className="mt-6 space-y-5">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#ed5938]">01 / Collection</p><p className="mt-2 text-xl font-black tracking-[-.03em]">{result.origin}</p>{result.scheduledDeparture&&<p className="mt-1 text-sm text-[#68736d]">Planned {when(result.scheduledDeparture)}</p>}</div>
        <div className="border-t border-[#18251f]/15 pt-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#ed5938]">02 / Delivery</p><p className="mt-2 text-xl font-black tracking-[-.03em]">{result.destination}</p>{result.scheduledArrival&&<p className="mt-1 text-sm text-[#68736d]">Planned {when(result.scheduledArrival)}</p>}</div>
       </div>
      </section>
      <section className="bg-[#fb5b32] p-6 text-white sm:p-8">
       <p className="text-xs font-bold uppercase tracking-[.2em] text-white/80">Need help?</p>
       <h3 className="mt-5 text-3xl font-black leading-[1] tracking-[-.045em]">QUESTIONS?<br/>LET&apos;S <span className="text-[#18251f]">TALK.</span></h3>
       <p className="mt-5 text-sm leading-7 text-white/85">Reply to your booking confirmation email with your tracking number and our operations team will assist.</p>
       <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={()=>{setResult(null);setError("");window.scrollTo({top:0,behavior:"smooth"});}} className="inline-flex h-11 items-center gap-5 border border-white/60 px-5 text-sm font-bold transition hover:bg-white/10">Track another <Arrow/></button><Link href="/quote" className="inline-flex h-11 items-center gap-5 bg-[#18251f] px-5 text-sm font-extrabold transition hover:bg-[#314840]">New quote <Arrow diagonal/></Link></div>
      </section>
     </aside>
    </div>
   </div>
   :<section className="mt-16 grid gap-14 lg:grid-cols-[.75fr_1.25fr]">
    <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#ed5938]">How tracking works</p><h2 className="mt-6 text-[clamp(2rem,3.4vw,3.25rem)] font-black leading-[.98] tracking-[-.045em]">EVERY<br/>MILESTONE.<br/><span className="text-[#ed5938]">ONE PLACE.</span></h2></div>
    <div className="divide-y divide-[#d6dbd2] border-t border-[#d6dbd2]">{[["01","Find your number","It's in the booking confirmation we send once your trip is scheduled, starting with NVL-."],["02","Enter your booking email","Use the same email address you gave when requesting the quote, so only you can see the shipment."],["03","Follow each milestone","Collection, transit and delivery updates appear here as our team records them."],["04","Planned, not live GPS","Times shown are the scheduled plan. We'll contact you if anything changes."]].map(([n,title,desc])=><div key={n} className="grid gap-3 py-5 sm:grid-cols-[56px_1fr_1.15fr] sm:items-start"><span className="text-base font-black text-[#ed5938]">{n}</span><h3 className="text-lg font-black tracking-[-.03em]">{title}</h3><p className="text-sm leading-7 text-[#68736d]">{desc}</p></div>)}</div>
   </section>}
  </div>

  <SiteFooter/>
 </main>;
}
