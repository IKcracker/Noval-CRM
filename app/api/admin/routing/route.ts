import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin-auth";
const ORS="https://api.openrouteservice.org";
type Point={lon:number;lat:number;label:string};
const cache=new Map<string,{expires:number;data:unknown}>();
async function lookup(input:string,key:string):Promise<Point>{
 const cacheKey="geo:"+input.trim().toLowerCase();
 const cached=cache.get(cacheKey);if(cached&&cached.expires>Date.now())return cached.data as Point;
 const url=new URL(ORS+"/geocode/search");
 url.searchParams.set("api_key",key);
 url.searchParams.set("text",input+", South Africa");
 url.searchParams.set("boundary.country","ZA");
 url.searchParams.set("size","1");
 const res=await fetch(url,{signal:AbortSignal.timeout(8500),cache:"no-store"});
 if(!res.ok)throw new Error("Location lookup failed ("+res.status+"). Check API quota or settings.");
 const payload=await res.json() as {features?:{geometry?:{coordinates?:number[]};properties?:{label?:string}}[]};
 const feature=payload.features?.[0],coord=feature?.geometry?.coordinates;
 if(!coord||!Number.isFinite(coord[0])||!Number.isFinite(coord[1]))throw new Error("No matching South African location found: "+input);
 const data={lon:coord[0],lat:coord[1],label:feature?.properties?.label||input};
 if(cache.size>500)cache.clear();
 cache.set(cacheKey,{expires:Date.now()+86400000,data});return data;
}
export async function POST(request:Request){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const key=process.env.OPENROUTESERVICE_API_KEY;
 if(!key)return NextResponse.json({error:"Set OPENROUTESERVICE_API_KEY on the server to enable calculated road routes."},{status:503});
 let body:unknown;try{body=await request.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 const data=body as {origin?:unknown;destination?:unknown};
 const origin=typeof data.origin==="string"?data.origin.trim():"";
 const destination=typeof data.destination==="string"?data.destination.trim():"";
 if(origin.length<3||destination.length<3||origin.length>200||destination.length>200)return NextResponse.json({error:"Provide valid collection and destination locations."},{status:400});
 const ck="route:"+origin.toLowerCase()+":"+destination.toLowerCase();
 const known=cache.get(ck);if(known&&known.expires>Date.now())return NextResponse.json(known.data);
 try{
  const [from,to]=await Promise.all([lookup(origin,key),lookup(destination,key)]);
  const res=await fetch(ORS+"/v2/directions/driving-car/geojson",{
   method:"POST",headers:{"Authorization":key,"Content-Type":"application/json"},
   body:JSON.stringify({coordinates:[[from.lon,from.lat],[to.lon,to.lat]],instructions:false}),
   signal:AbortSignal.timeout(12000),cache:"no-store"
  });
  if(!res.ok)throw new Error("Road routing failed ("+res.status+"). Check driving access or quota.");
  const json=await res.json() as {features?:{geometry?:{coordinates?:number[][]};properties?:{summary?:{distance?:number;duration?:number}}}[]};
  const feature=json.features?.[0],summary=feature?.properties?.summary,coords=feature?.geometry?.coordinates;
  if(!summary||!coords?.length)throw new Error("No drivable road route found between these locations.");
  // Restrict geometry payload size to avoid unbounded client response.
  const stride=Math.max(1,Math.ceil(coords.length/350));
  const geometry=coords.filter((_,i)=>i%stride===0||i===coords.length-1).map(c=>[c[1],c[0]]);
  const result={origin:from,destination:to,distanceKm:Math.round((summary.distance||0)/100)/10,durationMinutes:Math.round((summary.duration||0)/60),geometry,provider:"openrouteservice",kind:"planned"};
  cache.set(ck,{expires:Date.now()+3600000,data:result});
  return NextResponse.json(result,{headers:{"Cache-Control":"private, no-store"}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Routing unavailable"},{status:502});}
}
