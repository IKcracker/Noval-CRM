"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
export default function AdminLogin(){
 const router=useRouter();const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 async function login(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");
 const f=new FormData(e.currentTarget);
 try{const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:f.get("email"),password:f.get("password")})});
 if(!res.ok)throw new Error((await res.json()).error||"Login failed");
 router.replace("/dashboard/quotes");router.refresh();
 }catch(e){setError(e instanceof Error?e.message:"Login failed");}finally{setBusy(false);}}
 return <main className="grid min-h-screen place-items-center bg-[#f5f7fa] p-6"><Card className="w-full max-w-md p-9"><h1 className="text-3xl font-bold text-[#173b56]">Noval operations</h1><p className="mt-2 text-sm text-slate-500">Sign in to review shipping quote requests</p><form onSubmit={login} className="mt-8 space-y-4"><label className="block text-sm">Email<input type="email" name="email" required autoComplete="username" className="mt-2 w-full rounded-xl border border-slate-200 p-3"/></label><label className="block text-sm">Password<input name="password" type="password" required autoComplete="current-password" className="mt-2 w-full rounded-xl border border-slate-200 p-3"/></label>{error&&<p role="alert" className="text-sm text-red-700">{error}</p>}<Button disabled={busy} className="w-full">{busy?"Signing in…":"Sign in"}</Button></form></Card></main>;
}
