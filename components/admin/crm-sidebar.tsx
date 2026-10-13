"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {Suspense,useEffect,useRef,useState,type FormEvent} from "react";
import {Boxes,ChevronsLeft,ChevronsRight,ClipboardList,ContactRound,LayoutDashboard,MapPinned,PackageCheck,Plus,Search,Truck,Warehouse,Zap} from "lucide-react";
import {LogoutButton} from "@/components/admin/logout-button";
import {Sidebar,SidebarContent,SidebarFooter,SidebarGroup,SidebarGroupLabel,SidebarHeader,SidebarMenu,SidebarMenuItem,SidebarMenuButton,SidebarSeparator,useSidebar} from "@/components/ui/sidebar";
const groups=[
 {title:"Main menu",links:[
  {name:"Dashboard",href:"/dashboard",icon:LayoutDashboard},
  {name:"Fleet management",href:"/dashboard/fleet",icon:Truck},
  {name:"Shipments & deliveries",href:"/dashboard/shipments",icon:PackageCheck},
  {name:"Warehouse operations",href:"/dashboard/warehouse",icon:Warehouse},
  {name:"Route planning",href:"/dashboard/routes",icon:MapPinned}
 ]},
 {title:"Sales & customers",links:[
  {name:"Quotations",href:"/dashboard/quotes",icon:ClipboardList},
  {name:"Bookings & dispatch",href:"/dashboard/bookings",icon:Boxes},
  {name:"Customers",href:"/dashboard/customers",icon:ContactRound}
 ]}
];
export function CrmSidebar(){
 const router=useRouter(),{toggleSidebar,state,setOpen}=useSidebar();
 const [query,setQuery]=useState(""),input=useRef<HTMLInputElement>(null);
 useEffect(()=>{
  function shortcut(e:KeyboardEvent){if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setOpen(true);setTimeout(()=>input.current?.focus(),220);}}
  window.addEventListener("keydown",shortcut);return ()=>window.removeEventListener("keydown",shortcut);
 },[setOpen]);
 function submit(e:FormEvent){e.preventDefault();if(query.trim())router.push("/dashboard/shipments?q="+encodeURIComponent(query.trim()));}
 return <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border bg-sidebar">
 <SidebarHeader className="gap-4 px-3 pb-3 pt-5">
  <div className="flex items-center justify-between gap-2 px-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:px-0">
   <Link href="/dashboard" aria-label="Noval Logistics dashboard" className="flex min-w-0 items-center gap-2.5 text-sidebar-foreground">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-500 to-green-700 text-[17px] font-black text-white shadow-sm shadow-emerald-700/30">N</span>
    <span className="truncate text-[16px] font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">Noval Logistics</span>
   </Link>
   <button type="button" onClick={toggleSidebar} aria-label={state==="collapsed"?"Expand navigation":"Collapse navigation"} title={state==="collapsed"?"Expand navigation (Ctrl+B)":"Collapse navigation (Ctrl+B)"} className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground group-data-[collapsible=icon]:mt-3 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:rounded-lg">{state==="collapsed"?<ChevronsRight className="size-4"/>:<ChevronsLeft className="size-3.5"/>}</button>
  </div>
  <button type="button" aria-label="Search shipments" title="Search (Ctrl+K)" onClick={()=>{setOpen(true);setTimeout(()=>input.current?.focus(),220);}} className="mx-auto hidden size-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground group-data-[collapsible=icon]:flex"><Search className="size-4.25"/></button>
  <form onSubmit={submit} className="relative group-data-[collapsible=icon]:hidden" role="search">
   <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
   <input ref={input} value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search shipments" placeholder="Search..." className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-12 text-[13px] outline-none transition placeholder:text-muted-foreground focus:border-emerald-300 focus:ring-3 focus:ring-emerald-100"/>
   <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground">Ctrl K</kbd>
  </form>
 </SidebarHeader>
 <SidebarContent className="gap-2 px-2">
 <Suspense fallback={<NavGroups pathname=""/>}><ActiveNavGroups/></Suspense>
 </SidebarContent>
 <SidebarFooter className="gap-3 p-3">
  <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70 p-4 group-data-[collapsible=icon]:hidden">
   <span aria-hidden className="absolute -right-6 -top-6 size-24 rounded-full bg-emerald-200/40 blur-xl"/>
   <span className="relative flex size-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-emerald-700/25"><Zap className="size-4"/></span>
   <p className="relative mt-3 text-[13px] font-semibold">New freight enquiry</p>
   <p className="relative mt-1 text-[11.5px] leading-snug text-muted-foreground">Capture a customer request and price it in the quotation pipeline.</p>
   <Link href="/quote" className="relative mt-3 flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-[12.5px] font-semibold shadow-xs transition hover:border-emerald-200 hover:text-emerald-700"><Plus className="size-3.5"/> Create enquiry</Link>
  </div>
  <div className="flex items-center gap-2.5 rounded-xl px-1 group-data-[collapsible=icon]:hidden">
   <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">OP</span>
   <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-semibold text-foreground">Operations team</span><span className="block text-[11px] text-muted-foreground">Administrator</span></span>
  </div>
  <div className="group-data-[collapsible=icon]:hidden"><LogoutButton/></div>
  <div className="hidden flex-col items-center gap-2 group-data-[collapsible=icon]:flex">
   <Link href="/quote" aria-label="Create enquiry" title="Create enquiry" className="flex size-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-emerald-700/25 transition hover:bg-emerald-700"><Plus className="size-4.5"/></Link>
   <span title="Operations team · Administrator" className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">OP</span>
  </div>
 </SidebarFooter>
 </Sidebar>;
}
// usePathname() is request data on dynamic routes, so the active state streams in behind Suspense.
function ActiveNavGroups(){return <NavGroups pathname={usePathname()}/>;}
function NavGroups({pathname}:{pathname:string}){
 return <>
 {groups.map((group,i)=><div key={group.title}>{i>0&&<SidebarSeparator className="mx-3 mb-2 group-data-[collapsible=icon]:mx-4"/>}<SidebarGroup className="gap-1"><SidebarGroupLabel className="px-3 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground group-data-[collapsible=icon]:hidden">{group.title}</SidebarGroupLabel><SidebarMenu className="gap-0.5">{group.links.map(link=>{
 const active=Boolean(pathname)&&(link.href==="/dashboard"?pathname===link.href:pathname.startsWith(link.href));
 return <SidebarMenuItem key={link.href} className="relative">{active&&<span aria-hidden className="absolute -left-2 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary group-data-[collapsible=icon]:hidden"/>}<SidebarMenuButton tooltip={link.name} isActive={active} render={<Link href={link.href}/>} className="h-10 rounded-lg px-3 text-[13px] font-medium group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! text-sidebar-foreground/85 hover:bg-muted hover:text-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"><link.icon className="size-4.25 shrink-0"/><span className="group-data-[collapsible=icon]:hidden">{link.name}</span></SidebarMenuButton></SidebarMenuItem>
 })}</SidebarMenu></SidebarGroup></div>)}
 </>;
}
