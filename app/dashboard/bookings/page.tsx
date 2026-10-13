import Link from "next/link";
import {redirect} from "next/navigation";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Card} from "@/components/ui/card";
type Booking={id:string;reference:string;status:string;quote_reference:string;contact_name:string;origin:string;destination:string;created_at:Date};
export default async function Bookings(){
 if(!await isAdmin())redirect("/admin/login");
 let bookings:Booking[]=[],error="";
 try{bookings=await db()`SELECT b.id,b.reference,b.status,q.reference AS quote_reference,q.contact_name,q.origin,q.destination,b.created_at FROM bookings b JOIN quote_requests q ON q.id=b.quote_id ORDER BY b.created_at DESC LIMIT 100` as Booking[];}
 catch{error="Booking information is unavailable. Apply db/002_booking_pipeline.sql.";}
 return <main className="min-h-screen bg-[#f5f7fa] p-5 md:p-10"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-center justify-between gap-5"><div><p className="text-xs font-extrabold uppercase tracking-wider text-[#1688a2]">Operations / Dispatch</p><h1 className="mt-2 text-4xl font-extrabold">Bookings & dispatch</h1><p className="mt-3 text-sm text-slate-500">Review accepted quotes and confirm trips.</p></div><Link href="/dashboard/quotes" className="rounded-xl bg-[#173b56] px-5 py-3 text-sm font-semibold text-white">Quotation inbox →</Link></div><Card className="mt-8 overflow-hidden"><div className="flex justify-between border-b p-6"><h2 className="font-bold">Booking pipeline</h2><span className="text-sm text-slate-500">{bookings.length} shown</span></div>{error?<p className="p-6 text-red-700">{error}</p>:bookings.length===0?<p className="p-10 text-sm text-slate-500">No accepted quotes have generated bookings yet.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{["Booking","Customer","Route","Quote","Status","Action"].map(t=><th key={t} className="px-6 py-4">{t}</th>)}</tr></thead><tbody>{bookings.map(b=><tr key={b.id} className="border-t"><td className="px-6 py-4 font-semibold">{b.reference}</td><td className="px-6 py-4">{b.contact_name}</td><td className="px-6 py-4">{b.origin} → {b.destination}</td><td className="px-6 py-4">{b.quote_reference}</td><td className="px-6 py-4"><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-900">{b.status}</span></td><td className="px-6 py-4"><Link href={"/dashboard/bookings/"+b.id} className="font-bold text-[#1688a2]">Open →</Link></td></tr>)}</tbody></table></div>}</Card></div></main>;
}
