"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
export default function Track() {
 const [ref,setRef]=useState("");const [message,setMessage]=useState("");
 function submit(e:FormEvent){e.preventDefault();setMessage("Tracking is being configured. Live shipment details will become available once the tracking service is connected.");}
 return <main className="min-h-screen bg-[#f5f7fa] text-slate-900"><header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6"><Link href="/" className="text-xl font-black tracking-tight text-[#173b56]">NOVAL <span className="font-normal">LOGISTICS</span></Link><Link href="/quote" className="text-sm font-semibold">Request quote →</Link></header><div className="mx-auto max-w-3xl px-6 py-24"><div className="text-center"><span className="text-xs font-bold uppercase tracking-[.2em] text-[#1688a2]">Shipment visibility</span><h1 className="mt-5 text-5xl font-bold tracking-tight">Track your shipment.</h1><p className="mt-5 text-slate-600">A tracking number is issued once a shipment has been confirmed.</p></div><Card className="mt-10 p-7"><form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row"><input aria-label="Tracking number" required value={ref} onChange={e=>{setRef(e.target.value);setMessage("");}} placeholder="Enter your tracking number" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#1688a2]"/><Button type="submit">Track shipment</Button></form>{message&&<p role="status" className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{message}</p>}</Card></div></main>;
}
