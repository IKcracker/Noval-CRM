"use client";
import {useRouter} from "next/navigation";
import {useState} from "react";
export function LogoutButton(){
 const router=useRouter();const [busy,setBusy]=useState(false);
 async function logout(){setBusy(true);try{const res=await fetch("/api/auth/logout",{method:"POST"});if(!res.ok)throw new Error("Sign-out failed");router.replace("/admin/login");router.refresh();}catch{setBusy(false);}}
 return <button type="button" disabled={busy} onClick={logout} className="w-full rounded-xl border border-white/15 px-4 py-3 text-left text-sm font-semibold text-white/75 transition hover:border-[#fb5b32] hover:text-white">{busy?"Signing out…":"Sign out →"}</button>;
}
