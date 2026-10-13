import {redirect} from "next/navigation";
import {db} from "@/lib/db";
import {isAdmin} from "@/lib/admin-auth";
import {Card} from "@/components/ui/card";
import {QuoteStatus} from "./quote-status";
export const dynamic="force-dynamic";
type Item={id:string;reference:string;contact_name:string;company:string|null;email:string;phone:string;origin:string;destination:string;status:string;service_type:string;created_at:Date};
export default async function QuotesPage(){
 if(!await isAdmin())redirect("/admin/login");
 let rows:Item[]=[];let error="";
 try {rows=await db()`SELECT id,reference,contact_name,company,email,phone,origin,destination,status,service_type,created_at FROM quote_requests ORDER BY created_at DESC LIMIT 100` as Item[];}
 catch{error="Database unavailable. Apply the quote migration and verify DATABASE_URL.";}
 return <main className="min-h-screen bg-[#f5f7fa] px-5 py-10 text-slate-900 md:px-10"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Operations / Sales</p><h1 className="mt-2 text-4xl font-bold">Quote requests</h1><p className="mt-3 text-sm text-slate-500">Manage incoming requests and qualify them for pricing.</p><Card className="mt-8 overflow-hidden"><div className="flex justify-between border-b p-6"><h2 className="font-bold">Incoming inquiries</h2><span className="text-sm text-slate-500">{rows.length} shown</span></div>{error?<p role="alert" className="p-6 text-red-700">{error}</p>:rows.length===0?<p className="p-12 text-center text-slate-500">No quote requests yet.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{["Reference","Customer","Route","Service","Received","Status"].map(h=><th className="px-5 py-4" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-t"><td className="whitespace-nowrap px-5 py-4 font-semibold">{row.reference}</td><td className="px-5 py-4"><p className="font-semibold">{row.contact_name}</p><p className="text-xs text-slate-500">{row.company||row.email}</p></td><td className="px-5 py-4">{row.origin} → {row.destination}</td><td className="px-5 py-4">{row.service_type}</td><td className="whitespace-nowrap px-5 py-4">{new Date(row.created_at).toLocaleDateString("en-ZA")}</td><td className="px-5 py-4"><QuoteStatus id={row.id} initial={row.status}/></td></tr>)}</tbody></table></div>}</Card></div></main>;
}
