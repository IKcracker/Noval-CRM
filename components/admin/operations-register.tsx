"use client";
import {useState, type FormEvent} from "react";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {ArrowDown,ArrowUp,ArrowUpDown,ChevronLeft,ChevronRight,Download,ExternalLink,Search,MoreHorizontal,Copy,RotateCcw} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Checkbox} from "@/components/ui/checkbox";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/components/ui/select";
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {Table,TableHeader,TableHead,TableBody,TableRow,TableCell} from "@/components/ui/table";

export type OperationsRow={
 id:string;reference:string;customer:string;company:string|null;
 origin:string;destination:string;related_reference:string;
 status:string;created_at:string;
};
type Props={kind:"bookings"|"shipments";records:OperationsRow[];page:number;pages:number;total:number;query:string;status:string;sort:string;pageSize:number};
function csvEscape(value:string){return '"'+value.replaceAll('"','""')+'"';}
const statusOptions={
 bookings:[{value:"ALL",label:"All bookings"},{value:"PENDING",label:"Pending"},{value:"CONFIRMED",label:"Confirmed"},{value:"CANCELLED",label:"Cancelled"}],
 shipments:[{value:"ALL",label:"All shipments"},{value:"SCHEDULED",label:"Scheduled"},{value:"PICKED_UP",label:"Picked up"},{value:"IN_TRANSIT",label:"In transit"},{value:"OUT_FOR_DELIVERY",label:"Out for delivery"},{value:"EXCEPTION",label:"Exception"},{value:"DELIVERED",label:"Delivered"},{value:"RETURNED",label:"Returned"},{value:"CANCELLED",label:"Cancelled"}]
};
const sorts=[{value:"newest",label:"Newest first"},{value:"oldest",label:"Oldest first"},{value:"customer",label:"Customer A-Z"},{value:"status",label:"By status"}];
export function OperationsRegister({kind,records,page,pages,total,query,status,sort,pageSize}:Props){
 const router=useRouter(),pathname=usePathname(),[search,setSearch]=useState(query);
 const [checked,setChecked]=useState<string[]>([]);
 const selected=records.filter(r=>checked.includes(r.id));
 const allSelected=records.length>0&&selected.length===records.length;
 function url(q:string,s:string,o:string,p:number){
  const params=new URLSearchParams();
  if(q.trim())params.set("q",q.trim());
  if(s!=="ALL")params.set("status",s);
  if(o!=="newest")params.set("sort",o);
  if(p>1)params.set("page",String(p));
  return pathname+(params.toString()?"?"+params.toString():"");
 }
 function navigate(q:string,s:string,o:string,p:number){setChecked([]);router.push(url(q,s,o,p));}
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();navigate(search,status,sort,1);}
 function exportSelected(){
  if(!selected.length)return;
  const columns=["Reference","Customer","Company","Origin","Destination","Related reference","Status","Created"];
  const values=selected.map(r=>[r.reference,r.customer,r.company||"",r.origin,r.destination,r.related_reference,r.status,r.created_at]);
  // Prefix potentially executable spreadsheet values to avoid CSV formula injection.
  const safe=(x:string)=>csvEscape(/^[\s]*[=+@\-]/.test(x)?"'"+x:x);
  const csv="\uFEFF"+[columns,...values].map(row=>row.map(safe).join(",")).join("\r\n");
  const file=new Blob([csv],{type:"text/csv;charset=utf-8"}),href=URL.createObjectURL(file),link=document.createElement("a");
  link.href=href;link.download="noval-"+kind+"-selected.csv";document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(href);
  toast.success("Exported "+selected.length+" selected records");
 }
 const selectedStatus=statusOptions[kind].find(x=>x.value===status)?.label||"All";
 return <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 md:px-5">
  <form onSubmit={submit} className="flex min-w-[220px] flex-1 items-center gap-2 sm:max-w-md">
   <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/><Input aria-label={"Search "+kind} className="h-9 pl-9" placeholder="Search reference, customer, route..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
   <Button size="sm" type="submit" variant="secondary">Search</Button>
  </form>
  <Select value={status} onValueChange={value=>navigate(search,value??"ALL",sort,1)}>
   <SelectTrigger aria-label="Status filter" className="h-9 min-w-40"><SelectValue>{selectedStatus}</SelectValue></SelectTrigger>
   <SelectContent>{statusOptions[kind].map(x=><SelectItem value={x.value} key={x.value}>{x.label}</SelectItem>)}</SelectContent>
  </Select>
  <Select value={sort} onValueChange={value=>navigate(search,status,value??"newest",1)}>
   <SelectTrigger aria-label="Sort by" className="h-9 min-w-40"><ArrowUpDown className="size-3.5"/><SelectValue>{sorts.find(x=>x.value===sort)?.label}</SelectValue></SelectTrigger>
   <SelectContent>{sorts.map(x=><SelectItem value={x.value} key={x.value}>{x.label}</SelectItem>)}</SelectContent>
  </Select>
  {(query||status!=="ALL"||sort!=="newest")&&<Button size="sm" variant="ghost" onClick={()=>{setSearch("");navigate("","ALL","newest",1);}}><RotateCcw className="size-4"/> Reset</Button>}
  <Button size="sm" variant="outline" disabled={!selected.length} onClick={exportSelected}><Download className="size-4"/> Export {selected.length?selected.length:"selected"}</Button>
 </div>
 <div className="overflow-x-auto"><Table><TableHeader><TableRow>
  <TableHead className="w-10 px-4"><Checkbox aria-label="Select current page" checked={allSelected} onCheckedChange={yes=>setChecked(yes?records.map(x=>x.id):[])}/></TableHead>
  <TableHead className="px-4">Reference</TableHead><TableHead className="px-4">Customer</TableHead><TableHead className="px-4">Journey</TableHead><TableHead className="px-4">{kind==="bookings"?"Quotation":"Booking"}</TableHead><TableHead className="px-4">Status</TableHead><TableHead className="px-4">Created</TableHead><TableHead className="w-24 px-4 text-right">Actions</TableHead>
 </TableRow></TableHeader><TableBody>{records.length?records.map(r=><TableRow key={r.id} data-state={checked.includes(r.id)?"selected":undefined}>
 <TableCell className="px-4"><Checkbox aria-label={"Select "+r.reference} checked={checked.includes(r.id)} onCheckedChange={yes=>setChecked(prev=>yes?[...prev,r.id]:prev.filter(x=>x!==r.id))}/></TableCell>
 <TableCell className="px-4"><Link className="font-semibold text-foreground hover:text-primary hover:underline" href={"/dashboard/"+kind+"/"+r.id}>{r.reference}</Link></TableCell>
 <TableCell className="px-4"><div className="min-w-32"><p className="font-medium">{r.customer}</p><p className="max-w-44 truncate text-xs text-muted-foreground">{r.company||"Individual account"}</p></div></TableCell>
 <TableCell className="max-w-60 truncate px-4 text-muted-foreground" title={r.origin+" to "+r.destination}>{r.origin} → {r.destination}</TableCell>
 <TableCell className="px-4 text-muted-foreground">{r.related_reference}</TableCell>
 <TableCell className="px-4"><Badge variant={r.status==="EXCEPTION"||r.status==="CANCELLED"?"destructive":r.status==="CONFIRMED"||r.status==="DELIVERED"?"default":"secondary"}>{r.status.replaceAll("_"," ")}</Badge></TableCell>
 <TableCell className="whitespace-nowrap px-4 text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-ZA",{day:"2-digit",month:"short",year:"numeric"})}</TableCell>
 <TableCell className="px-4 text-right"><DropdownMenu><DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" aria-label={"Actions for "+r.reference}/> }><MoreHorizontal className="size-4"/></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem render={<Link href={"/dashboard/"+kind+"/"+r.id}/>}>Open record <ExternalLink className="ml-auto size-4"/></DropdownMenuItem><DropdownMenuItem onClick={()=>{void navigator.clipboard.writeText(r.reference);toast.success("Reference copied");}}>Copy reference <Copy className="ml-auto size-4"/></DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
 </TableRow>):<TableRow><TableCell colSpan={8} className="h-48 text-center"><div className="space-y-2"><p className="font-medium">No matching records</p><p className="text-sm text-muted-foreground">Try another search or clear the filters.</p><Button size="sm" variant="outline" onClick={()=>{setSearch("");navigate("","ALL","newest",1);}}>Clear filters</Button></div></TableCell></TableRow>}</TableBody></Table></div>
 <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground md:px-5">
 <div><span className="font-medium text-foreground">{total.toLocaleString("en-ZA")}</span> matching records · {selected.length} selected on this page · {pageSize} per page</div>
 <div className="flex items-center gap-2"><span className="mr-2">Page {page} of {pages}</span><Button size="icon-sm" variant="outline" disabled={page<=1} onClick={()=>navigate(query,status,sort,page-1)} aria-label="Previous page"><ChevronLeft className="size-4"/></Button><Button size="icon-sm" variant="outline" disabled={page>=pages} onClick={()=>navigate(query,status,sort,page+1)} aria-label="Next page"><ChevronRight className="size-4"/></Button></div>
 </div>
 </div>;
}
