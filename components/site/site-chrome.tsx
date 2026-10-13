import Link from "next/link";
import {Brand} from "@/components/site/brand";
/** Shared header, footer and arrow glyph for the public website (landing, quote, tracking). */
export function Arrow({diagonal=false}:{diagonal?:boolean}){return <span aria-hidden="true" className="text-xl font-light">{diagonal?"↗":"→"}</span>}
const links=[{href:"/#solutions",label:"Solutions"},{href:"/#advantage",label:"Why Noval"},{href:"/#process",label:"How it works"},{href:"/track",label:"Track a shipment"}];
export function SiteHeader({current}:{current?:"/track"|"/quote"}){
 return <header className="relative z-20 border-b border-[#e7e5dc] bg-[#f5f4ef]">
  <div className="mx-auto flex h-[72px] max-w-[1536px] items-center justify-between px-5 sm:px-9 xl:px-16">
   <Brand/>
   <nav aria-label="Main navigation" className="hidden items-center gap-9 lg:flex">
    {links.map(l=><Link key={l.href} href={l.href} aria-current={current===l.href?"page":undefined} className={"text-[13px] font-semibold hover:text-[#e74f2d] "+(current===l.href?"text-[#e74f2d]":"")}>{l.label}</Link>)}
   </nav>
   <Link href="/quote" aria-current={current==="/quote"?"page":undefined} className={"hidden items-center gap-4 px-5 "+(current==="/quote"?"bg-[#fb5b32] ":"bg-[#18251f] ")+" py-3 text-[11px] font-extrabold uppercase tracking-[.13em] text-white transition hover:bg-[#fb5b32] sm:inline-flex"}>Get a freight quote <Arrow diagonal/></Link>
   <details className="group relative sm:hidden">
    <summary className="cursor-pointer list-none border border-[#cccfc6] px-3.5 py-2.5 text-xs font-bold uppercase tracking-widest">Menu +</summary>
    <nav aria-label="Mobile navigation" className="absolute right-0 top-12 z-50 grid w-60 gap-1 border border-[#e7e5dc] bg-[#f5f4ef] p-3 shadow-2xl">
     {links.map(l=><Link key={l.href} href={l.href} className="p-3 text-sm">{l.label}</Link>)}<Link href="/quote" className="bg-[#fb5b32] p-3 text-sm font-bold text-white">Get a quote ↗</Link>
    </nav>
   </details>
  </div>
 </header>;
}
export function SiteFooter(){
 return <footer className="bg-[#14231d] px-6 py-12 text-white sm:px-9 xl:px-16"><div className="mx-auto max-w-[1408px]">
  <div className="grid gap-10 border-b border-white/15 pb-12 lg:grid-cols-[1.4fr_1fr_1fr]">
   <div><Brand light/><p className="mt-7 max-w-xs text-sm leading-7 text-white/55">Practical freight solutions, clear communication, and better connected shipping.</p></div>
   <div><p className="mb-6 text-xs font-bold uppercase tracking-[.19em] text-[#fb7757]">Explore</p><div className="grid gap-4 text-sm text-white/70"><Link href="/#solutions">Our solutions</Link><Link href="/#advantage">Why Noval</Link><Link href="/#process">How it works</Link></div></div>
   <div><p className="mb-6 text-xs font-bold uppercase tracking-[.19em] text-[#fb7757]">Your shipment</p><div className="grid gap-4 text-sm text-white/70"><Link href="/quote">Request a quote</Link><Link href="/track">Track shipment</Link></div></div>
  </div>
  <div className="flex flex-wrap justify-between gap-5 pt-7 text-xs text-white/45"><span>© 2026 Noval Logistics. All rights reserved.</span><span>Freight and delivery coordination · South Africa</span><Link href="/dashboard" className="hover:text-white">Staff dashboard ↗</Link></div>
 </div></footer>;
}
