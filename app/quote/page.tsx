"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function QuotePage() {
  const [sent,setSent] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/quotes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if(!res.ok) throw new Error((await res.json()).error ?? "Unable to send your request");
      setSent(true);
    } catch(e) { setError(e instanceof Error?e.message:"Something went wrong"); } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-[#f5f7fa] text-slate-900">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6"><Link href="/" className="text-xl font-black tracking-tight text-[#173b56]">NOVAL <span className="font-normal">LOGISTICS</span></Link><Link href="/track" className="text-sm font-semibold text-slate-600">Track shipment →</Link></header>
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="pt-9"><span className="text-xs font-bold uppercase tracking-[0.22em] text-[#1688a2]">Shipping inquiry</span><h1 className="mt-5 text-5xl font-bold tracking-tight">Tell us what you need to move.</h1><p className="mt-6 text-lg leading-8 text-slate-600">Request road freight or dedicated delivery services. Our operations team will review your shipment and provide a tailored quote.</p><div className="mt-10 space-y-4 text-sm text-slate-600"><p>✓ Freight and courier solutions</p><p>✓ Transparent review and confirmation</p><p>✓ Shipment milestones and tracking after booking</p></div></div>
      <Card className="p-7 md:p-9">{sent ? <div className="py-16 text-center"><div className="text-5xl">✓</div><h2 className="mt-5 text-2xl font-bold">Request received</h2><p className="mt-3 text-slate-600">Your request has been submitted for review. Our team will contact you using the details provided.</p><Link href="/" className="mt-8 inline-block font-semibold text-[#1688a2]">Back to home</Link></div> :
      <form onSubmit={submit} className="space-y-5"><h2 className="text-xl font-bold">Get your shipping quote</h2><div className="grid gap-4 sm:grid-cols-2">{[
        ["contactName","Full name","text"],["company","Company (optional)","text"],["email","Email address","email"],["phone","Phone number","tel"],["origin","Collection address / city","text"],["destination","Delivery address / city","text"],["pickupDate","Preferred collection date","date"],["weightKg","Approx. weight (kg)","number"]
      ].map(([name,label,type])=><label key={name} className="block text-sm font-medium text-slate-700">{label}<input name={name} type={type} required={!["company","weightKg","pickupDate"].includes(name)} min={type==="number"?"0":undefined} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#1688a2] focus:ring-2 focus:ring-[#1688a2]/15" /></label>)}</div><label className="block text-sm font-medium">Service type<select name="serviceType" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><option>Road freight</option><option>Courier delivery</option><option>Dedicated truck</option><option>Express shipment</option></select></label><label className="block text-sm font-medium">Cargo details<textarea name="cargoDetails" required rows={4} placeholder="Describe the goods, dimensions, quantity, and any handling requirements" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#1688a2]"/></label><p className="text-xs text-slate-500">By submitting, you agree to be contacted about your shipping request. Please do not include sensitive personal documents here.</p>{error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<Button type="submit" disabled={busy} className="w-full">{busy?"Submitting…":"Request my quote →"}</Button></form>}</Card>
    </div></main>;
}
