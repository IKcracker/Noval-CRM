"use client";
import {useEffect,useRef} from "react";
import "leaflet/dist/leaflet.css";
type Props={geometry:number[][];origin:{lat:number;lon:number;label:string};destination:{lat:number;lon:number;label:string}};
export function RouteRoadMap({geometry,origin,destination}:Props){
 const container=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let cancelled=false;let mapInstance:import("leaflet").Map|undefined;
  void import("leaflet").then(L=>{
   if(cancelled||!container.current)return;
   mapInstance=L.map(container.current,{scrollWheelZoom:false});
   L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom:18
   }).addTo(mapInstance);
   const route=L.polyline(geometry.map(c=>[c[0],c[1]] as [number,number]),{color:"#2563eb",weight:5,opacity:.9}).addTo(mapInstance);
   L.circleMarker([origin.lat,origin.lon],{radius:8,color:"#119f88",fillColor:"#119f88",fillOpacity:1}).addTo(mapInstance).bindPopup("Collection: "+origin.label);
   L.circleMarker([destination.lat,destination.lon],{radius:8,color:"#2563eb",fillColor:"#2563eb",fillOpacity:1}).addTo(mapInstance).bindPopup("Delivery: "+destination.label);
   mapInstance.fitBounds(route.getBounds(),{padding:[34,34]});
  });
  return ()=>{cancelled=true;mapInstance?.remove();};
 },[geometry,origin,destination]);
 return <div ref={container} className="h-[400px] w-full rounded-xl border border-border md:h-[490px]" role="img" aria-label="Calculated road route with collection and delivery markers"/>;
}
