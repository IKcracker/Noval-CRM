"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {BarChart3,ClipboardList,Truck,Users,MapPinned,Receipt,Settings2,LayoutDashboard,PackageCheck} from "lucide-react";
import {LogoutButton} from "@/components/admin/logout-button";
import {Badge} from "@/components/ui/badge";
import {Sidebar,SidebarContent,SidebarFooter,SidebarGroup,SidebarGroupLabel,SidebarHeader,SidebarMenu,SidebarMenuItem,SidebarMenuButton,SidebarSeparator} from "@/components/ui/sidebar";
const sections=[
 {title:"Workspace",links:[{name:"Overview",href:"/dashboard",icon:LayoutDashboard},{name:"Quote requests",href:"/dashboard/quotes",icon:ClipboardList},{name:"Bookings & dispatch",href:"/dashboard/bookings",icon:Truck},{name:"Shipments",href:"/dashboard/shipments",icon:PackageCheck}]}
];
const future=[{name:"Customers",icon:Users},{name:"Routes & live tracking",icon:MapPinned},{name:"Finance",icon:Receipt},{name:"Advanced analytics",icon:BarChart3},{name:"Settings",icon:Settings2}];
export function CrmSidebar(){
 const path=usePathname();
 return <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
  <SidebarHeader className="px-3 py-5"><Link href="/" className="flex items-center gap-3 rounded-lg px-2 py-1 text-sidebar-foreground"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#e96843] text-xl font-black text-white">N</span><span className="whitespace-nowrap text-base font-bold tracking-tight group-data-[collapsible=icon]:hidden">NOVAL <span className="text-white/50">CRM</span></span></Link><p className="px-2 text-xs text-sidebar-foreground/45 group-data-[collapsible=icon]:hidden">Freight operations platform</p></SidebarHeader>
  <SidebarSeparator/>
  <SidebarContent>
   {sections.map(group=><SidebarGroup key={group.title}><SidebarGroupLabel>{group.title}</SidebarGroupLabel><SidebarMenu>{group.links.map(link=><SidebarMenuItem key={link.href}><SidebarMenuButton tooltip={link.name} isActive={link.href==="/dashboard"?path===link.href:path.startsWith(link.href)} render={<Link href={link.href}/>}><link.icon className="size-4"/><span>{link.name}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroup>)}
   <SidebarSeparator/>
   <SidebarGroup><SidebarGroupLabel>Coming next</SidebarGroupLabel><SidebarMenu>{future.map(item=><SidebarMenuItem key={item.name}><SidebarMenuButton disabled tooltip={item.name}><item.icon className="size-4"/><span>{item.name}</span><Badge variant="outline" className="ml-auto text-[9px] group-data-[collapsible=icon]:hidden">Soon</Badge></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroup>
  </SidebarContent>
  <SidebarFooter className="gap-3 border-t border-sidebar-border p-3"><div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2 group-data-[collapsible=icon]:hidden"><div className="grid size-8 place-items-center rounded-full bg-[#e96843] text-xs font-bold text-white">OP</div><div className="min-w-0"><p className="truncate text-xs font-semibold">Operations</p><p className="truncate text-[11px] text-sidebar-foreground/55">Administrator</p></div></div><LogoutButton/></SidebarFooter>
 </Sidebar>;
}
