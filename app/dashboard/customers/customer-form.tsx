"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/components/ui/select";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import {Field,FieldLabel} from "@/components/ui/field";
export type CustomerEditable={id:string;contact_name:string;company_name:string|null;email:string;phone:string|null;billing_address:string|null;status:string};
export function CustomerForm({initial}:{initial?:CustomerEditable}){
 const router=useRouter(),[busy,setBusy]=useState(false),[status,setStatus]=useState(initial?.status||"PROSPECT");
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const form=new FormData(event.currentTarget);
  const body={id:initial?.id,contactName:String(form.get("contactName")||""),companyName:String(form.get("companyName")||""),
   email:String(form.get("email")||""),phone:String(form.get("phone")||""),billingAddress:String(form.get("billingAddress")||""),status};
  setBusy(true);
  try{const res=await fetch("/api/admin/customers",{method:initial?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Unable to save contact");
   toast.success(initial?"Customer updated":"Customer created");
   if(initial)router.refresh();else router.push("/dashboard/customers/"+data.id);
  }catch(e){toast.error(e instanceof Error?e.message:"Unable to save contact");}
  finally{setBusy(false);}
 }
 return <Card><CardHeader><CardTitle>{initial?"Edit customer record":"Create a customer"}</CardTitle><CardDescription>Maintain verified contact and company details used by your operations team.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
 <Field><FieldLabel htmlFor="contactName">Contact name</FieldLabel><Input id="contactName" required name="contactName" maxLength={160} defaultValue={initial?.contact_name}/></Field>
 <Field><FieldLabel htmlFor="companyName">Company</FieldLabel><Input id="companyName" name="companyName" maxLength={180} defaultValue={initial?.company_name||""}/></Field>
 <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" required type="email" name="email" maxLength={255} defaultValue={initial?.email}/></Field>
 <Field><FieldLabel htmlFor="phone">Telephone</FieldLabel><Input id="phone" type="tel" name="phone" maxLength={45} defaultValue={initial?.phone||""}/></Field>
 <Field><FieldLabel>Status</FieldLabel><Select value={status} onValueChange={v=>setStatus(v??"PROSPECT")}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="PROSPECT">Prospect</SelectItem><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem></SelectContent></Select></Field>
 <Field className="sm:col-span-2"><FieldLabel htmlFor="billingAddress">Billing address</FieldLabel><Textarea id="billingAddress" name="billingAddress" rows={3} maxLength={1500} defaultValue={initial?.billing_address||""}/></Field>
 <div className="sm:col-span-2"><Button disabled={busy} type="submit">{busy?"Saving...":initial?"Save changes":"Create customer"}</Button></div>
 </form></CardContent></Card>;
}
