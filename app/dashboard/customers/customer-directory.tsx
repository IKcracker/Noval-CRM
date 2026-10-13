"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
import {useRouter,usePathname} from "next/navigation";
import {toast} from "sonner";
import {Search,ChevronLeft,ChevronRight,Import,ArrowUpRight,Mail} from "lucide-react";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/components/ui/select";
import {Table,TableHeader,TableHead,TableBody,TableRow,TableCell} from "@/components/ui/table";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter,DialogClose} from "@/components/ui/dialog";
export type CustomerRow={id:string;company_name:string|null;contact_name:string;email:string;phone:string|null;status:string;quote_count:number;created_at:string};
const statuses=[{value:"ALL",label:"All customers"},{value:"PROSPECT",label:"Prospects"},{value:"ACTIVE",label:"Active"},{value:"INACTIVE",label:"Inactive"}];
export function CustomerDirectory({rows,total,page,pages,query,status,sort}:{rows:CustomerRow[];total:number;page:number;pages:number;query:string;status:string;sort:string}){
 const router=useRouter(),path=usePathname(),[search,setSearch]=useState(query),[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 function navigate(q:string,s:string,o:string,p:number){
  const params=new URLSearchParams();if(q.trim())params.set("q",q.trim());if(s!=="ALL")params.set("status",s);if(o!=="newest")params.set("sort",o);if(p>1)params.set("page",String(p));
  router.push(path+(params.size?"?"+params.toString():""));
 }
 function submit(e:FormEvent){e.preventDefault();navigate(search,status,sort,1);}
 async function importContacts(){setBusy(true);try{
  const response=await fetch("/api/admin/customers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"import-quotes"})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||"Import failed");
  toast.success(data.imported+" new customer contacts imported");setOpen(false);router.refresh();
 }catch(e){toast.error(e instanceof Error?e.message:"Import failed");}finally{setBusy(false);}}
 return <Card className="min-w-0 overflow-hidden"><CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b"><div><CardTitle>Customer directory</CardTitle><CardDescription>Accounts, contacts, relationships and recent engagement</CardDescription></div><Button variant="outline" size="sm" onClick={()=>setOpen(true)}><Import className="size-4"/> Import quote contacts</Button></CardHeader>
 <CardContent className="p-0">
 <div className="flex flex-wrap gap-2 border-b p-4"><form onSubmit={submit} className="flex min-w-44 flex-1 gap-2 sm:max-w-sm"><div className="relative flex-1"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/><Input aria-label="Search customer directory" className="h-9 pl-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, company..."/></div><Button type="submit" size="sm" variant="secondary">Search</Button></form>
 <Select value={status} onValueChange={s=>navigate(search,s??"ALL",sort,1)}><SelectTrigger className="h-9 min-w-40" aria-label="Customer status"><SelectValue/></SelectTrigger><SelectContent>{statuses.map(x=><SelectItem value={x.value} key={x.value}>{x.label}</SelectItem>)}</SelectContent></Select>
 <Select value={sort} onValueChange={s=>navigate(search,status,s??"newest",1)}><SelectTrigger className="h-9 min-w-40" aria-label="Customer sorting"><SelectValue/></SelectTrigger><SelectContent>{[{value:"newest",label:"Newest first"},{value:"oldest",label:"Oldest first"},{value:"customer",label:"Contact A–Z"},{value:"status",label:"Status"}].map(x=><SelectItem value={x.value} key={x.value}>{x.label}</SelectItem>)}</SelectContent></Select>
 </div>
 <div className="overflow-x-auto"><Table><TableHeader><TableRow>{["Customer","Contact","Email","Status","Quotations",""].map(x=><TableHead className="px-4" key={x}>{x}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.length?rows.map(c=><TableRow key={c.id}><TableCell className="px-4 font-semibold">{c.company_name||c.contact_name}</TableCell><TableCell>{c.contact_name}</TableCell><TableCell><a href={"mailto:"+c.email} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><Mail className="size-3.5"/>{c.email}</a></TableCell><TableCell><Badge variant={c.status==="ACTIVE"?"default":"secondary"}>{c.status}</Badge></TableCell><TableCell>{c.quote_count}</TableCell><TableCell className="px-4 text-right"><Button size="sm" variant="ghost" render={<Link href={"/dashboard/customers/"+c.id}/>}>View profile <ArrowUpRight className="size-4"/></Button></TableCell></TableRow>):<TableRow><TableCell colSpan={6} className="h-40 text-center"><p className="font-medium">No customer records found</p><p className="mt-1 text-sm text-muted-foreground">Create a customer or import actual quotation contacts.</p></TableCell></TableRow>}</TableBody></Table></div>
 <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground"><span>{total} matching customers</span><div className="flex items-center gap-2"><span>Page {page} of {pages}</span><Button size="icon-sm" variant="outline" aria-label="Previous page" disabled={page<=1} onClick={()=>navigate(query,status,sort,page-1)}><ChevronLeft className="size-4"/></Button><Button size="icon-sm" variant="outline" aria-label="Next page" disabled={page>=pages} onClick={()=>navigate(query,status,sort,page+1)}><ChevronRight className="size-4"/></Button></div></div>
 </CardContent>
 <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Import existing quote contacts?</DialogTitle><DialogDescription>Creates customer records from real quotation requests. Existing email addresses are skipped, and DEMO-Q test data is excluded. No original quotation or customer records are changed.</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button variant="outline"/>}>Cancel</DialogClose><Button disabled={busy} onClick={importContacts}>{busy?"Importing...":"Import contacts"}</Button></DialogFooter></DialogContent></Dialog>
 </Card>;
}
