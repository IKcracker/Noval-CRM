export type QuoteInput = {contactName:string;company:string;email:string;phone:string;origin:string;destination:string;serviceType:string;cargoDetails:string;pickupDate:string|null;weightKg:number|null};
export function parseQuote(payload:unknown):QuoteInput {
 if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid request");
 const p=payload as Record<string,unknown>;
 const string=(key:string,max:number,required=true)=>{
  const v=p[key]; if(typeof v !== "string") {if(!required&&v==null)return "";throw new Error("Invalid "+key)}
  const trimmed=v.trim();if(trimmed.length>max||(required&&!trimmed))throw new Error("Invalid "+key);
  return trimmed;
 };
 const contactName=string("contactName",150),company=string("company",150,false),email=string("email",254),phone=string("phone",40);
 const origin=string("origin",500),destination=string("destination",500),cargoDetails=string("cargoDetails",1500);
 const serviceType=string("serviceType",60);
 if(!["Road freight","Courier delivery","Dedicated truck","Express shipment"].includes(serviceType))throw new Error("Unsupported service type");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("Invalid email");
 const date=string("pickupDate",10,false);
 if(date && (!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))))throw new Error("Invalid pickup date");
 const weightRaw=string("weightKg",20,false);
 const weightKg=weightRaw?Number(weightRaw):null;
 if(weightKg!==null&&(!Number.isFinite(weightKg)||weightKg<=0||weightKg>1000000))throw new Error("Invalid shipment weight");
 return {contactName,company,email,phone,origin,destination,cargoDetails,serviceType,pickupDate:date||null,weightKg};
}
