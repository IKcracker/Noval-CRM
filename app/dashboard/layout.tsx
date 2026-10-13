import {redirect} from "next/navigation";
import {isAdmin} from "@/lib/admin-auth";
import {CrmSidebar} from "@/components/admin/crm-sidebar";
import {SidebarProvider,SidebarInset} from "@/components/ui/sidebar";
import {WorkspaceHeader} from "@/components/admin/workspace-header";
export default async function DashboardLayout({children}:{children:React.ReactNode}){
 if(!await isAdmin())redirect("/admin/login");
 return <div className="noval-enterprise"><SidebarProvider className="noval-enterprise"><CrmSidebar/><SidebarInset className="min-w-0 bg-background">
  <WorkspaceHeader/>
  <div className="min-w-0 flex-1">{children}</div>
 </SidebarInset></SidebarProvider></div>;
}
