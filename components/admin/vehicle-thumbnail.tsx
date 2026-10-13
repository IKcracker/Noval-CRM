"use client";

import Image from "next/image";
import {useState} from "react";
import {Truck} from "lucide-react";

export type VehicleType="box-truck"|"semi-truck"|"cargo-van";

const imageSources:Record<VehicleType,{local:string;remote:string;label:string}>={
 "box-truck":{
  local:"/fleet/truck-box.jpg",
  remote:"https://images.pexels.com/photos/31049388/pexels-photo-31049388.jpeg?auto=compress&cs=tinysrgb&w=1000",
  label:"Box delivery truck"
 },
 "semi-truck":{
  local:"/fleet/truck-semi.jpg",
  remote:"https://images.pexels.com/photos/11777628/pexels-photo-11777628.jpeg?auto=compress&cs=tinysrgb&w=1000",
  label:"Heavy goods truck"
 },
 "cargo-van":{
  local:"/fleet/cargo-van.jpg",
  remote:"https://images.pexels.com/photos/11040957/pexels-photo-11040957.jpeg?auto=compress&cs=tinysrgb&w=1000",
  label:"Cargo delivery van"
 }
};

export function guessVehicleType(model?:string|null):VehicleType{
 const value=(model||"").toLowerCase();
 if(/(van|sprinter|transit|hiace|quantum|crafter|ducato|panel)/.test(value))return "cargo-van";
 if(/(semi|tractor|articulated|heavy|horse|scania|actros|fh\d|volvo|superlink|interlink)/.test(value))return "semi-truck";
 return "box-truck";
}

/** Representative stock photo, not a verified photo of this specific vehicle. */
export function VehicleThumbnail({className="",type="box-truck",imageSrc}:{
 className?:string;type?:VehicleType;imageSrc?:string|null
}){
 const defaults=imageSources[type];
 const provided=imageSrc?.startsWith("/")==true||
  imageSrc?.startsWith("https://images.pexels.com/")==true?imageSrc:null;
 const initial=provided||defaults.local;
 const [failed,setFailed]=useState<string|null>(null);
 const [lastAttempt,setLastAttempt]=useState("");
 const source=lastAttempt!==initial?initial:failed===initial?defaults.remote:failed===defaults.remote?null:initial;
 // Reset the fallback decision naturally when the selected source changes.
 const displaySource=source;
 return <div className={"relative isolate overflow-hidden rounded-xl border border-border bg-[#f2f5fa] "+className}>
  {displaySource?<Image
   key={displaySource}
   src={displaySource}
   alt={"Representative "+defaults.label.toLowerCase()+" photograph"}
   fill
   sizes="(max-width: 640px) 44vw, (max-width: 1280px) 25vw, 320px"
   className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.025]"
   onError={()=>{setLastAttempt(initial);setFailed(displaySource);}}
  />:<div className="flex h-full min-h-18 w-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-slate-400" role="img" aria-label="Vehicle photo unavailable"><Truck className="size-10"/></div>}
  <span className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/20 to-transparent p-2 text-[0px]" aria-hidden="true">Photo</span>
 </div>;
}
