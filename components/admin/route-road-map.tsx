"use client";
import {useEffect,useRef} from "react";
import "leaflet/dist/leaflet.css";
type Point={lat:number;lon:number;label:string};
type Props={geometry:number[][];origin:Point;destination:Point;approximate?:boolean;className?:string};
/** Road route map. With `approximate`, draws a dashed straight line between known city locations instead. */
export function RouteRoadMap({geometry,origin,destination,approximate=false,className="h-[400px] md:h-[490px]"}:Props){
 const container=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let cancelled=false;let mapInstance:import("leaflet").Map|undefined;
  void import("leaflet").then(L=>{
   if(cancelled||!container.current)return;
   mapInstance=L.map(container.current,{scrollWheelZoom:false,zoomControl:false});
   L.control.zoom({position:"bottomright"}).addTo(mapInstance);
   L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom:18
   }).addTo(mapInstance);
   const line=geometry.map(c=>[c[0],c[1]] as [number,number]);
   if(!approximate)L.polyline(line,{color:"#ffffff",weight:9,opacity:.9}).addTo(mapInstance);
   const route=L.polyline(line,{color:"#16a34a",weight:approximate?3:5,opacity:.95,dashArray:approximate?"8 8":undefined}).addTo(mapInstance);
   const pin=(fill:string)=>L.divIcon({className:"",iconSize:[18,18],iconAnchor:[9,9],html:`<span style="display:block;width:18px;height:18px;border-radius:999px;background:${fill};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></span>`});
   L.marker([origin.lat,origin.lon],{icon:pin("#111a15")}).addTo(mapInstance).bindPopup("Collection: "+origin.label);
   L.marker([destination.lat,destination.lon],{icon:pin("#16a34a")}).addTo(mapInstance).bindPopup("Delivery: "+destination.label);
   mapInstance.fitBounds(route.getBounds(),{paddingTopLeft:[40,150],paddingBottomRight:[40,40]});
  });
  return ()=>{cancelled=true;mapInstance?.remove();};
 },[geometry,origin,destination,approximate]);
 return <div ref={container} className={"isolate w-full "+className} role="img" aria-label={(approximate?"Approximate straight-line overview":"Calculated road route")+" with collection and delivery markers"}/>;
}
