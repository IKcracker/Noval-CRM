"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {LockKeyhole,ArrowRight,ShieldCheck} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Field,FieldLabel} from "@/components/ui/field";
export default function AdminLogin(){
 const router=useRouter(),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function login(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");
  const f=new FormData(e.currentTarget);
  try{
   const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:f.get("email"),password:f.get("password")})});
   if(!res.ok)throw new Error((await res.json()).error||"Login failed");
   toast.success("Signed in");router.replace("/dashboard");router.refresh();
  }catch(e){const msg=e instanceof Error?e.message:"Login failed";setError(msg);toast.error(msg);}
  finally{setBusy(false);}
 }
 return <main className="grid min-h-screen place-items-center bg-background px-6 py-12"><div className="w-full max-w-md"><div className="mb-9 text-center"><div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><LockKeyhole className="size-6"/></div><h1 className="text-3xl font-bold tracking-tight">Noval operations</h1><p className="mt-2 text-sm text-muted-foreground">Secure access to your freight operations workspace.</p></div><Card className="shadow-lg"><CardHeader className="border-b"><CardTitle>Welcome back</CardTitle><CardDescription>Sign in with your authorized operator credentials.</CardDescription></CardHeader><CardContent><form onSubmit={login} className="space-y-5"><Field><FieldLabel htmlFor="login-email">Email address</FieldLabel><Input id="login-email" name="email" type="email" required autoComplete="username" className="h-11"/></Field><Field><FieldLabel htmlFor="login-password">Password</FieldLabel><Input id="login-password" name="password" type="password" required autoComplete="current-password" className="h-11"/></Field>{error&&<p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<Button type="submit" disabled={busy} className="h-11 w-full">{busy?"Signing in...":"Sign in to CRM"} <ArrowRight className="size-4"/></Button></form></CardContent></Card><p className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><ShieldCheck className="size-4"/> Internal access only. Activity is auditable.</p></div></main>;
}
