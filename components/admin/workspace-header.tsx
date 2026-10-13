"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {useState,type FormEvent} from "react";
import {Bell,ChevronRight,PanelLeft,Plus,RefreshCw,Search,SlidersHorizontal} from "lucide-react";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
const names:Record<string,string>={quotes:"Quotations",bookings:"Bookings & dispatch",shipments:"Shipments",routes:"Route planning",fleet:"Fleet & drivers",customers:"Customers",new:"New customer"};
export function WorkspaceHeader(){
 const pathname=usePathname(),router=useRouter(),[search,setSearch]=useState("");
 const parts=pathname.split("/").filter(Boolean).slice(1);
 const current=parts.length?(names[parts[0]]||"Workspace"):"Dashboard";
 function submit(e:FormEvent){e.preventDefault();if(search.trim())router.push("/dashboard/quotes?q="+encodeURIComponent(search.trim()));}
 return <header className="sticky top-0 z-30 flex min-h-17 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:px-6 lg:px-8">
  <div className="flex min-w-0 items-center gap-3">
   <SidebarTrigger aria-label="Toggle navigation" className="text-muted-foreground"><PanelLeft className="size-4"/></SidebarTrigger>
   <Separator orientation="vertical" className="h-5"/>
   <nav className="flex min-w-0 items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
    <Link href="/dashboard" className="hidden text-muted-foreground hover:text-foreground sm:inline">Workspace</Link><ChevronRight className="hidden size-3 text-muted-foreground sm:block"/>
    <span className="truncate font-semibold">{current}</span>
    {parts.length>1&&<><ChevronRight className="size-3 text-muted-foreground"/><span className="max-w-28 truncate text-muted-foreground">{parts[parts.length-1]==="new"?"New record":"Details"}</span></>}
   </nav>
  </div>
  <div className="ml-auto flex items-center gap-2">
   <form onSubmit={submit} className="relative hidden lg:block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input aria-label="Search quotation records" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search quotations..." className="h-9 w-55 border-border bg-muted/60 pl-9 xl:w-64"/></form>
   <Button variant="ghost" size="icon" aria-label="Refresh workspace data" onClick={()=>router.refresh()}><RefreshCw className="size-4"/></Button>
   <Button variant="ghost" size="icon" aria-label="View shipment exceptions" render={<Link href="/dashboard/shipments?status=EXCEPTION"/>}><Bell className="size-4"/></Button>
   <Button variant="outline" size="sm" className="hidden sm:inline-flex" render={<Link href="/dashboard/quotes"/>}><SlidersHorizontal className="size-4"/> Pipeline</Button>
   <Button size="sm" render={<Link href="/quote"/>}><Plus className="size-4"/> <span className="hidden sm:inline">New enquiry</span><span className="sm:hidden">New</span></Button>
   <span className="ml-1 flex size-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[11px] font-bold text-blue-700" title="Operations administrator">OP</span>
  </div>
 </header>;
}
