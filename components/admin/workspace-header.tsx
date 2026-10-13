"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {PanelLeft,ChevronRight} from "lucide-react";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";
const labels:Record<string,string>={dashboard:"Overview",quotes:"Quote requests",bookings:"Bookings & dispatch",shipments:"Shipments",routes:"Route planning",fleet:"Drivers & fleet"};
export function WorkspaceHeader(){
 const pathname=usePathname();
 const parts=pathname.split("/").filter(Boolean).slice(1);
 return <header className="sticky top-0 z-30 flex h-15 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:px-7">
 <div className="flex min-w-0 items-center gap-3"><SidebarTrigger aria-label="Toggle navigation"><PanelLeft className="size-4"/></SidebarTrigger><Separator orientation="vertical" className="h-5"/><nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm"><Link href="/dashboard" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline">Workspace</Link>{parts.length===0?<span className="font-semibold">Overview</span>:parts.map((part,index)=><span className="flex min-w-0 items-center gap-1.5" key={index}><ChevronRight className="hidden size-3.5 text-muted-foreground sm:block"/><span className={index===parts.length-1?"truncate font-semibold":"hidden truncate text-muted-foreground sm:inline"}>{labels[part]??(index===parts.length-1?"Record details":part)}</span></span>)}</nav></div>
 <div className="flex items-center gap-2"><Badge variant="outline" className="hidden sm:inline-flex">Operations</Badge><span className="size-2 rounded-full bg-emerald-500" title="Workspace available"/></div>
 </header>;
}
