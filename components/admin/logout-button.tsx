"use client";
import {useRouter} from "next/navigation";
import {useState} from "react";
export function LogoutButton(){
 const router=useRouter();const [busy,setBusy]=useState(false);
 async function logout(){setBusy(true);try{const res=await fetch("/api/auth/logout",{method:"POST"});if(!res.ok)throw new Error("Sign-out failed");router.replace("/admin/login");router.refresh();}catch{setBusy(false);}}
 return <button type="button" disabled={busy} onClick={logout} className="w-full rounded-xl border border-border px-3 py-2 text-left text-[13px] font-medium text-muted-foreground transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">{busy?"Signing out…":"Sign out →"}</button>;
}
