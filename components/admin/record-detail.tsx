import Link from "next/link";
import {ArrowLeft,Check,type LucideIcon} from "lucide-react";
import type {ReactNode} from "react";
const tones:Record<string,string>={
 NEW:"bg-sky-500",REVIEWING:"bg-amber-400",PRICED:"bg-violet-500",SENT:"bg-indigo-500",ACCEPTED:"bg-emerald-500",DECLINED:"bg-red-500",EXPIRED:"bg-zinc-400",
 PENDING:"bg-amber-400",CONFIRMED:"bg-emerald-500",CANCELLED:"bg-zinc-400",
 SCHEDULED:"bg-zinc-400",PICKED_UP:"bg-amber-400",IN_TRANSIT:"bg-amber-400",OUT_FOR_DELIVERY:"bg-emerald-400",DELIVERED:"bg-emerald-600",EXCEPTION:"bg-red-500",RETURNED:"bg-zinc-500",
 PROSPECT:"bg-sky-500",ACTIVE:"bg-emerald-500",INACTIVE:"bg-zinc-400",COMPLETED:"bg-emerald-600"
};
export const statusLabel=(status:string)=>status.charAt(0)+status.slice(1).toLowerCase().replaceAll("_"," ");
export function StatusPill({status,className=""}:{status:string;className?:string}){
 return <span className={"inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-[11.5px] font-medium shadow-xs "+className}><span className={"size-1.5 rounded-full "+(tones[status]??"bg-zinc-400")}/>{statusLabel(status)}</span>;
}
export type Fact={label:string;value:ReactNode;sub?:ReactNode;icon:LucideIcon};
/** Record header: back link, identity, status, actions and a divided strip of key facts. */
export function RecordHeader({back,icon:Icon,eyebrow,title,status,meta,actions,facts}:{back:{href:string;label:string};icon:LucideIcon;eyebrow:string;title:string;status:string;meta?:ReactNode;actions?:ReactNode;facts:Fact[]}){
 return <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(17,26,21,.03),0_4px_16px_rgba(17,26,21,.025)]">
  <div className="flex flex-wrap items-start justify-between gap-4 px-5 pb-5 pt-4 md:px-6">
   <div className="min-w-0">
    <Link href={back.href} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-3.5"/>{back.label}</Link>
    <div className="mt-3 flex items-center gap-3.5">
     <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 ring-1 ring-emerald-200/70"><Icon className="size-5.5"/></span>
     <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-[.1em] text-muted-foreground">{eyebrow}</p><div className="mt-0.5 flex flex-wrap items-center gap-2.5"><h1 className="truncate text-[22px] font-semibold tracking-tight">{title}</h1><StatusPill status={status}/></div></div>
    </div>
    {meta&&<div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground">{meta}</div>}
   </div>
   {actions&&<div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
  <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 xl:grid-cols-4">{facts.map(f=><div key={f.label} className="min-w-0 bg-card px-5 py-4 md:px-6">
   <p className="flex items-center gap-2 text-[12px] text-muted-foreground"><f.icon className="size-3.5"/>{f.label}</p>
   <p className="mt-1.5 truncate text-[15px] font-semibold tracking-tight">{f.value}</p>
   {f.sub&&<p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{f.sub}</p>}
  </div>)}</div>
 </section>;
}
export function Panel({title,description,action,children,className="",bodyClassName="px-5 pb-5"}:{title:string;description?:string;action?:ReactNode;children:ReactNode;className?:string;bodyClassName?:string}){
 return <section className={"min-w-0 rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(17,26,21,.03),0_4px_16px_rgba(17,26,21,.025)] "+className}>
  <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5"><div><h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>{description&&<p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>}</div>{action}</div>
  <div className={bodyClassName}>{children}</div>
 </section>;
}
/** Label/value rows separated by hairlines. */
export function InfoList({items}:{items:{label:string;value:ReactNode;icon?:LucideIcon}[]}){
 return <dl className="divide-y divide-border">{items.map(i=><div key={i.label} className="flex items-start justify-between gap-4 py-2.5 text-[13px] first:pt-0 last:pb-0">
  <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">{i.icon&&<i.icon className="size-3.5"/>}{i.label}</dt><dd className="min-w-0 text-right font-medium [overflow-wrap:anywhere]">{i.value}</dd>
 </div>)}</dl>;
}
/** Collection → delivery with optional scheduled times. */
export function JourneyLine({origin,destination,departure,arrival}:{origin:string;destination:string;departure?:string|null;arrival?:string|null}){
 return <ol className="relative space-y-4 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:border-l-2 before:border-dashed before:border-border">
  <li className="relative flex gap-3.5"><span className="mt-1 size-3 shrink-0 rounded-full border-2 border-card bg-foreground ring-1 ring-foreground/25"/><span className="min-w-0"><span className="block text-[11.5px] text-muted-foreground">Collection{departure?" · "+departure:""}</span><span className="mt-0.5 block text-[14px] font-semibold [overflow-wrap:anywhere]">{origin}</span></span></li>
  <li className="relative flex gap-3.5"><span className="mt-1 size-3 shrink-0 rounded-full border-2 border-card bg-primary ring-1 ring-primary/30"/><span className="min-w-0"><span className="block text-[11.5px] text-muted-foreground">Delivery{arrival?" · "+arrival:""}</span><span className="mt-0.5 block text-[14px] font-semibold [overflow-wrap:anywhere]">{destination}</span></span></li>
 </ol>;
}
/** Horizontal stage tracker. Stages before `current` are complete, `current` is in progress
 *  (red when `failed`); a `current` past the last stage means everything is complete. */
export function StageStepper({steps,current,failed=false}:{steps:string[];current:number;failed?:boolean}){
 return <ol className="grid gap-2" style={{gridTemplateColumns:`repeat(${steps.length},minmax(0,1fr))`}}>{steps.map((s,i)=>{const done=i<current,here=i===current;return <li key={s} className="min-w-0">
  <div className={"h-1.5 rounded-full "+(done?"bg-primary":here?(failed?"bg-red-400":"bg-primary/45"):"bg-muted")}/>
  <p className={"mt-2 flex items-center gap-1 truncate text-[11.5px] "+(done||here?"font-medium text-foreground":"text-muted-foreground")}>{done&&<Check className="size-3 shrink-0 text-primary"/>}{s}</p>
 </li>;})}</ol>;
}
export type TimelineItem={id:string;title:string;status?:string;body?:string|null;meta:string;badge?:string};
export function Timeline({items,empty}:{items:TimelineItem[];empty:string}){
 if(!items.length)return <p className="rounded-xl border border-dashed border-border py-8 text-center text-[12.5px] text-muted-foreground">{empty}</p>;
 return <ol className="relative">{items.map((e,i)=><li key={e.id} className="relative flex gap-3.5 pb-5 last:pb-0">
  {i<items.length-1&&<span aria-hidden className="absolute bottom-0 left-[7px] top-5 w-px bg-border"/>}
  <span className={"relative mt-1 size-[15px] shrink-0 rounded-full border-[3px] border-card ring-1 ring-border "+(i===0?(tones[e.status??""]??"bg-primary"):"bg-zinc-300")}/>
  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-[13.5px] font-semibold">{e.title}</p>{e.badge&&<span className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground">{e.badge}</span>}</div>
   {e.body&&<p className="mt-1 whitespace-pre-wrap text-[12.5px] leading-relaxed text-foreground/75">{e.body}</p>}
   <p className="mt-1 text-[11.5px] text-muted-foreground">{e.meta}</p></div>
 </li>)}</ol>;
}
export const dateTime=(d:Date|string)=>new Date(d).toLocaleString("en-ZA",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Africa/Johannesburg"});
export const shortDateTime=(d:Date|string)=>new Date(d).toLocaleString("en-ZA",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Africa/Johannesburg"});
export const dateOnly=(d:Date|string)=>new Date(d).toLocaleDateString("en-ZA",{day:"numeric",month:"short",year:"numeric",timeZone:"Africa/Johannesburg"});
export const rand=(cents:number|string|null)=>cents===null||cents===undefined?null:new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(Number(cents)/100);
