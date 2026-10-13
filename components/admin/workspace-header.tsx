"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {Suspense,useTransition} from "react";
import {Bell,Boxes,ChevronDown,ChevronRight,ClipboardList,ContactRound,Filter,LayoutDashboard,LogOut,MapPinned,PackageCheck,Plus,RefreshCw,Truck,Warehouse,type LucideIcon} from "lucide-react";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Button} from "@/components/ui/button";
import {DropdownMenu,DropdownMenuContent,DropdownMenuGroup,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
const pages:Record<string,{name:string;icon:LucideIcon}>={
 quotes:{name:"Quotations",icon:ClipboardList},bookings:{name:"Bookings & dispatch",icon:Boxes},
 shipments:{name:"Shipments & deliveries",icon:PackageCheck},routes:{name:"Route planning",icon:MapPinned},
 fleet:{name:"Fleet management",icon:Truck},customers:{name:"Customers",icon:ContactRound},
 warehouse:{name:"Warehouse operations",icon:Warehouse}
};
const filters=[
 {name:"Shipment exceptions",href:"/dashboard/shipments?status=EXCEPTION"},
 {name:"In transit",href:"/dashboard/shipments?status=IN_TRANSIT"},
 {name:"Pending bookings",href:"/dashboard/bookings?status=PENDING"},
 {name:"Quotations to review",href:"/dashboard/quotes?status=REVIEWING"},
 {name:"Accepted quotations",href:"/dashboard/quotes?status=ACCEPTED"}
];
export function WorkspaceHeader(){
 const router=useRouter(),[refreshing,startRefresh]=useTransition();
 return <header className="sticky top-0 z-30 flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur md:px-6">
  <div className="flex min-w-0 items-center gap-2.5">
   <SidebarTrigger aria-label="Open navigation" className="text-muted-foreground md:hidden"/>
   <Suspense fallback={<span className="h-5 w-40 rounded-md bg-muted"/>}><PageTitle/></Suspense>
  </div>
  <div className="ml-auto flex items-center gap-2">
   <Button variant="outline" size="sm" className="hidden h-9 px-3 sm:inline-flex" disabled={refreshing} onClick={()=>startRefresh(()=>router.refresh())}><RefreshCw className={"size-3.5 "+(refreshing?"animate-spin":"")}/> Refresh</Button>
   <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-9 px-3"/>}><Filter className="size-3.5"/> <span className="hidden sm:inline">Filter</span> <ChevronDown className="size-3.5 text-muted-foreground"/></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56"><DropdownMenuGroup><DropdownMenuLabel>Quick filters</DropdownMenuLabel>{filters.map(f=><DropdownMenuItem key={f.href} render={<Link href={f.href}/>}>{f.name}</DropdownMenuItem>)}</DropdownMenuGroup></DropdownMenuContent>
   </DropdownMenu>
   <Button nativeButton={false} variant="ghost" size="icon" className="relative" aria-label="View shipment exceptions" render={<Link href="/dashboard/shipments?status=EXCEPTION"/>}><Bell className="size-4.5"/><span aria-hidden className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-card"/></Button>
   <DropdownMenu><DropdownMenuTrigger render={<button type="button" className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-left transition hover:bg-muted"/>}>
    <span className="flex size-8 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground/80 ring-1 ring-border">OP</span>
    <span className="hidden text-[13px] font-medium md:inline">Operations</span><ChevronDown className="hidden size-3.5 text-muted-foreground md:block"/>
   </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-52"><DropdownMenuGroup><DropdownMenuLabel>Operations administrator</DropdownMenuLabel></DropdownMenuGroup><DropdownMenuSeparator/>
     <DropdownMenuItem render={<Link href="/dashboard/customers"/>}>Customer directory</DropdownMenuItem>
     <DropdownMenuItem render={<Link href="/dashboard/fleet"/>}>Drivers & fleet</DropdownMenuItem>
     <DropdownMenuSeparator/>
     <DropdownMenuItem onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});router.replace("/admin/login");router.refresh();}}>Sign out <LogOut className="ml-auto size-4"/></DropdownMenuItem>
    </DropdownMenuContent>
   </DropdownMenu>
   <Button nativeButton={false} size="sm" className="h-9 px-3.5 shadow-sm shadow-emerald-700/20" render={<Link href="/quote"/>}><Plus className="size-4"/> <span className="hidden sm:inline">Quick shipment</span><span className="sm:hidden">New</span></Button>
  </div>
 </header>;
}
// usePathname() is request data on dynamic routes, so the title streams in behind Suspense.
function PageTitle(){
 const parts=usePathname().split("/").filter(Boolean).slice(1);
 const page=parts.length?(pages[parts[0]]??{name:"Workspace",icon:LayoutDashboard}):{name:"Dashboard",icon:LayoutDashboard};
 const Icon=page.icon;
 return <>
   <Icon className="hidden size-4.75 shrink-0 text-foreground/80 sm:block"/>
   <nav className="flex min-w-0 items-center gap-1.5" aria-label="Breadcrumb">
    {parts.length>1?<Link href={"/dashboard/"+parts[0]} className="truncate text-[15px] font-semibold text-muted-foreground hover:text-foreground">{page.name}</Link>:<h2 className="truncate text-[15px] font-semibold tracking-tight">{page.name}</h2>}
    {parts.length>1&&<><ChevronRight className="size-3.5 text-muted-foreground"/><span className="max-w-32 truncate text-[15px] font-semibold">{parts[parts.length-1]==="new"?"New record":"Details"}</span></>}
   </nav>
 </>;
}
