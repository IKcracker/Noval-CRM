import Link from "next/link";
import {redirect} from "next/navigation";
import {ArrowLeft} from "lucide-react";
import {isAdmin} from "@/lib/admin-auth";
import {CustomerForm} from "../customer-form";
export default async function NewCustomer(){
 if(!await isAdmin())redirect("/admin/login");
 return <main className="mx-auto max-w-4xl space-y-6 p-4 md:p-7 lg:p-8">
  <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/dashboard/customers"><ArrowLeft className="size-4"/> Customer directory</Link>
  <div><h1 className="text-3xl font-semibold tracking-tight">New customer</h1><p className="mt-2 text-sm text-muted-foreground">Create a persistent customer record, then manage activity and quotation history.</p></div>
  <CustomerForm/>
 </main>;
}
