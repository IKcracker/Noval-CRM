"use client";

import Image from "next/image";
import {useState} from "react";
import {Truck} from "lucide-react";

import type {VehicleType} from "@/lib/vehicle-type";

const photographs:Record<VehicleType,{src:string;description:string}>={
 "box-truck":{
  src:"/fleet/truck-box.jpg",
  description:"White delivery truck parked on a city street"
 },
 "semi-truck":{
  src:"/fleet/truck-semi.jpg",
  description:"White heavy freight truck parked by a roadside"
 },
 "cargo-van":{
  src:"/fleet/cargo-van.jpg",
  description:"White delivery van with a courier loading packages"
 }
};

function VehiclePhoto({src,description}: {src:string;description:string}){
 const [failed,setFailed]=useState(false);
 return failed
  ? <div className="flex h-full min-h-18 w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-slate-50 to-emerald-50 text-slate-400" role="img" aria-label="Vehicle image unavailable">
      <Truck className="size-9"/><span className="text-[10px]">Photo unavailable</span>
    </div>
  : <Image src={src} alt={"Representative stock photograph: "+description} fill
      sizes="(max-width: 640px) 50vw, (max-width: 1280px) 30vw, 340px"
      className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.025]"
      onError={()=>setFailed(true)}/>;
}

/** Representative photos are illustrative, not photos of a registered fleet vehicle. */
export function VehicleThumbnail({className="",type="box-truck",imageSrc}:{
 className?:string;type?:VehicleType;imageSrc?:string|null
}){
 const photo=photographs[type];
 const custom=imageSrc?.startsWith("/")&&!imageSrc.startsWith("//")?imageSrc:null;
 const src=custom||photo.src;
 return <div className={"relative isolate overflow-hidden rounded-xl border border-border bg-[#f4f6f5] "+className}>
  <VehiclePhoto key={src} src={src} description={custom?"Vehicle":photo.description}/>
 </div>;
}
