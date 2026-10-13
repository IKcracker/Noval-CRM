import Link from "next/link";
import {redirect} from "next/navigation";
import {db} from "@/lib/db";
import {isAdmin} from "@/lib/admin-auth";
import {Card} from "@/components/ui/card";
import {QuoteTable} from "./quote-table";
type Item={id:string;reference:string;contact_name:string;company:string|null;email:string;origin:string;destination:string;status:string;service_type:string;created_at:Date};
export default async function QuotesPage(){
 if(!await isAdmin())redirect("/admin/login");
 let rows:Item[]=[],error="";
 try{rows=await db()`SELECT id,reference,contact_name,company,email,origin,destination,status,service_type,created_at FROM quote_requests ORDER BY created_at DESC LIMIT 250` as Item[];}
 catch{error="Unable to load quotations. Apply the database migrations and configure DATABASE_URL.";}
 return <main className="min-h-screen bg-[#f5f7fa] px-5 py-10 text-slate-900 md:px-10"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Operations / Sales</p><h1 className="mt-2 text-4xl font-extrabold">Quote requests</h1><p className="mt-3 text-sm text-slate-500">Review new enquiries, create prices and manage customer decisions.</p></div><div className="flex gap-4 text-sm font-bold"><Link href="/dashboard" className="text-slate-600">Overview</Link><Link href="/dashboard/bookings" className="text-[#1688a2]">Bookings →</Link></div></div><Card className="mt-8 overflow-hidden">{error?<p role="alert" className="p-8 text-red-700">{error}</p>:<QuoteTable rows={rows.map(r=>({...r,created_at:new Date(r.created_at).toISOString()}))}/>}</Card></div></main>;
}
