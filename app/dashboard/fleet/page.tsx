import {redirect} from "next/navigation";
import {isAdmin} from "@/lib/admin-auth";
import {db} from "@/lib/db";
import {Badge} from "@/components/ui/badge";
import {FleetWorkspace} from "./workspace";
export default async function Fleet(){
 if(!await isAdmin())redirect("/admin/login");
 let drivers:Record<string,unknown>[]=[],vehicles:Record<string,unknown>[]=[],error="";
 try{const sql=db();drivers=await sql`SELECT id,full_name,phone,license_number,license_expiry::text AS license_expiry,status FROM drivers ORDER BY created_at DESC LIMIT 200`;vehicles=await sql`SELECT id,registration,make_model,capacity_kg::text AS capacity_kg,roadworthy_expiry::text AS roadworthy_expiry,status FROM vehicles ORDER BY created_at DESC LIMIT 200`;}
 catch{error="Fleet unavailable. Run npm run data:migrate to apply migration 004.";}
 return <main className="space-y-6 p-5 md:p-8"><div><Badge variant="secondary" className="mb-3">Operations / Resources</Badge><h1 className="text-3xl font-bold tracking-tight">Drivers & fleet</h1><p className="mt-2 text-sm text-muted-foreground">Maintain transport resources and verify their eligibility before dispatch.</p></div>{error?<p className="rounded-xl border p-5 text-destructive">{error}</p>:<FleetWorkspace drivers={drivers as never} vehicles={vehicles as never}/>}</main>;
}
