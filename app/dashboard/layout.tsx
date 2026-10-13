import {Suspense} from "react";
import {redirect} from "next/navigation";
import {isAdmin} from "@/lib/admin-auth";
import {CrmSidebar} from "@/components/admin/crm-sidebar";
import {SidebarProvider,SidebarInset} from "@/components/ui/sidebar";
import WorkspaceLoading from "./loading";
import {WorkspaceHeader} from "@/components/admin/workspace-header";
// The session is request data, so it is read behind Suspense; the navigation shell prerenders.
// Every dashboard page also performs its own isAdmin() check before loading records.
async function AdminGate({children}:{children:React.ReactNode}){
 if(!await isAdmin())redirect("/admin/login");
 return children;
}
export default function DashboardLayout({children}:{children:React.ReactNode}){
 return <div className="noval-enterprise"><SidebarProvider className="noval-enterprise"><CrmSidebar/><SidebarInset className="min-w-0 bg-background">
  <WorkspaceHeader/>
  <div className="min-w-0 flex-1"><Suspense fallback={<WorkspaceLoading/>}><AdminGate>{children}</AdminGate></Suspense></div>
 </SidebarInset></SidebarProvider></div>;
}
