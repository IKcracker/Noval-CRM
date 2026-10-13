import { cookies } from "next/headers";
import { connection } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
const cookieName="noval_admin";
export function secureConfigured(){return Boolean(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD&&process.env.ADMIN_SESSION_SECRET&&process.env.ADMIN_SESSION_SECRET.length>=32);}
function signature(payload:string){return createHmac("sha256",process.env.ADMIN_SESSION_SECRET!).update(payload).digest("hex");}
export function issueSession(){const value=String(Date.now()+8*60*60*1000);return value+"."+signature(value);}
export async function isAdmin(){
 if(!secureConfigured())return false;
 const token=(await cookies()).get(cookieName)?.value??"";
 const parts=token.split(".");if(parts.length!==2||!/^[0-9]{13}$/.test(parts[0])||!/^[a-f0-9]{64}$/.test(parts[1]))return false;
 // Session expiry must be checked at request time, never during PPR prerendering.
 await connection();
 const expected=Buffer.from(signature(parts[0]),"hex"), actual=Buffer.from(parts[1],"hex");
 return timingSafeEqual(expected,actual)&&Number(parts[0])>Date.now();
}
export {cookieName};
