export type VehicleType="box-truck"|"semi-truck"|"cargo-van";
/** Choose an illustrative category; this is not proof of the actual vehicle type. */
export function guessVehicleType(model?:string|null):VehicleType{
 const text=(model||"").toLowerCase();
 if(/van|sprinter|transit|hiace|quantum|crafter|ducato|panel/.test(text))return "cargo-van";
 if(/semi|tractor|articulated|horse|scania|actros|volvo|superlink|interlink/.test(text))return "semi-truck";
 return "box-truck";
}
