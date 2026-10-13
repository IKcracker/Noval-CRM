import Link from "next/link";
import {redirect} from "next/navigation";
import {db} from "@/lib/db";
import {isAdmin} from "@/lib/admin-auth";
import {Card,CardHeader,CardDescription,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ArrowUpRight,FileText,ClipboardCheck,Clock3} from "lucide-react";
import {QuoteTable} from "./quote-table";
type Item={id:string;reference:string;contact_name:string;company:string|null;email:string;origin:string;destination:string;status:string;service_type:string;created_at:Date};
export default async function QuotesPage(){
 if(!await isAdmin())redirect("/admin/login");
 let rows:Item[]=[],error="";
 try{rows=await db()`SELECT id,reference,contact_name,company,email,origin,destination,status,service_type,created_at FROM quote_requests ORDER BY created_at DESC LIMIT 250` as Item[];}
 catch{error="Unable to load quotations. Apply the database migrations and configure DATABASE_URL.";}
 const total=rows.length,awaiting=rows.filter(r=>["NEW","REVIEWING"].includes(r.status)).length,priced=rows.filter(r=>["PRICED","SENT"].includes(r.status)).length,accepted=rows.filter(r=>r.status==="ACCEPTED").length;
 return <main className="space-y-6 p-4 md:p-7 xl:p-9"><div className="flex flex-wrap items-end justify-between gap-4"><div><Badge variant="secondary" className="mb-3">Sales / Quotation pipeline</Badge><h1 className="text-3xl font-semibold tracking-tight">Quote requests</h1><p className="mt-2 text-sm text-muted-foreground">Review, qualify and price freight enquiries from your live pipeline.</p></div><Button variant="outline" render={<Link href="/dashboard/bookings"/>}>Dispatch bookings <ArrowUpRight className="size-4"/></Button></div>
 <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{label:"All enquiries",value:total,icon:FileText},{label:"Needs attention",value:awaiting,icon:Clock3},{label:"Pricing & sent",value:priced,icon:ClipboardCheck},{label:"Accepted",value:accepted,icon:ArrowUpRight}].map(({label,value,icon:Icon})=><Card key={label}><CardHeader className="flex flex-row items-start justify-between gap-3 pb-2"><CardDescription>{label}</CardDescription><Icon className="size-4 text-muted-foreground"/></CardHeader><CardContent><p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p></CardContent></Card>)}</div>
 <Card className="min-w-0 overflow-hidden"><CardHeader className="border-b"><CardTitle>Quotation pipeline</CardTitle><CardDescription>Filter, sort, select and review customer requests</CardDescription></CardHeader><CardContent className="p-0">{error?<p role="alert" className="p-8 text-destructive">{error}</p>:<QuoteTable rows={rows.map(r=>({...r,created_at:new Date(r.created_at).toISOString()}))}/>}</CardContent></Card></main>;
}
