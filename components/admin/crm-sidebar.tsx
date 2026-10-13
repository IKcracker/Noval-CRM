"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Boxes,ClipboardList,ContactRound,LayoutGrid,MapPinned,PackageCheck,Truck,Users,ChevronRight} from "lucide-react";
import {LogoutButton} from "@/components/admin/logout-button";
import {Sidebar,SidebarContent,SidebarFooter,SidebarGroup,SidebarGroupLabel,SidebarHeader,SidebarMenu,SidebarMenuItem,SidebarMenuButton,SidebarSeparator} from "@/components/ui/sidebar";
const groups=[
 {title:"GENERAL",links:[{name:"Dashboard",href:"/dashboard",icon:LayoutGrid}]},
 {title:"FREIGHT OPERATIONS",links:[
  {name:"Shipments",href:"/dashboard/shipments",icon:PackageCheck},
  {name:"Quotations",href:"/dashboard/quotes",icon:ClipboardList},
  {name:"Bookings & dispatch",href:"/dashboard/bookings",icon:Boxes},
  {name:"Route planning",href:"/dashboard/routes",icon:MapPinned}
 ]},
 {title:"MANAGEMENT",links:[
  {name:"Customers",href:"/dashboard/customers",icon:ContactRound},
  {name:"Fleet & drivers",href:"/dashboard/fleet",icon:Truck}
 ]}
];
export function CrmSidebar(){
 const pathname=usePathname();
 return <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border bg-sidebar">
 <SidebarHeader className="px-3 pb-4 pt-5">
  <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sidebar-foreground">
   <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-white shadow-sm shadow-blue-400/25"><Truck className="size-5"/></span>
   <span className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden"><span className="block text-[15px] font-extrabold tracking-tight text-foreground">Noval<span className="text-primary">Flow</span></span><span className="block pt-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">LOGISTICS OPERATIONS</span></span>
  </Link>
 </SidebarHeader>
 <SidebarSeparator className="mx-3"/>
 <SidebarContent className="gap-3 px-2 pt-3">
 {groups.map(group=><SidebarGroup key={group.title} className="gap-1"><SidebarGroupLabel className="px-3 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground group-data-[collapsible=icon]:hidden">{group.title}</SidebarGroupLabel><SidebarMenu className="gap-1">{group.links.map(link=>{
 const active=link.href==="/dashboard"?pathname===link.href:pathname.startsWith(link.href);
 return <SidebarMenuItem key={link.href}><SidebarMenuButton tooltip={link.name} isActive={active} render={<Link href={link.href}/>} className="h-10 rounded-lg px-3 text-[13px] font-medium text-sidebar-foreground/80 data-[active=true]:bg-sidebar-accent data-[active=true]:text-primary hover:bg-sidebar-accent/75 hover:text-foreground"><link.icon className="size-[17px] shrink-0"/><span>{link.name}</span>{active&&<ChevronRight className="ml-auto size-3.5 text-primary group-data-[collapsible=icon]:hidden"/>}</SidebarMenuButton></SidebarMenuItem>
 })}</SidebarMenu></SidebarGroup>)}
 </SidebarContent>
 <SidebarFooter className="gap-2 border-t border-sidebar-border p-3">
  <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-3 group-data-[collapsible=icon]:hidden">
   <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#dceaff] text-xs font-bold text-[#2863bd]">OP</span>
   <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-foreground">Operations team</span><span className="block text-[11px] text-muted-foreground">Administrator</span></span>
   <Users className="size-4 text-muted-foreground"/>
  </div>
  <LogoutButton/>
 </SidebarFooter>
 </Sidebar>;
}
