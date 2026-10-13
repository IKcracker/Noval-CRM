import {redirect} from "next/navigation";
import {isAdmin} from "@/lib/admin-auth";
import {CrmSidebar} from "@/components/admin/crm-sidebar";
import {SidebarProvider,SidebarInset,SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
export default async function DashboardLayout({children}:{children:React.ReactNode}){
 if(!await isAdmin())redirect("/admin/login");
 return <SidebarProvider><CrmSidebar/><SidebarInset className="min-w-0">
  <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-5 backdrop-blur md:px-8">
   <SidebarTrigger/><Separator orientation="vertical" className="mr-1 h-5"/>
   <span className="text-sm font-semibold">Noval Operations</span><span className="ml-auto rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">Internal workspace</span>
  </header>
  <div className="min-w-0 flex-1">{children}</div>
 </SidebarInset></SidebarProvider>;
}
