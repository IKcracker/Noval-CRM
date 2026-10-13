/** Short place name for compact routes; keep the full address available as a tooltip. */
export function place(address:string){
 const parts=address.split(",").map(x=>x.trim()).filter(x=>x&&!/^\d+$/.test(x));
 return parts.length>1?parts[parts.length-2]:parts[0]||address;
}
