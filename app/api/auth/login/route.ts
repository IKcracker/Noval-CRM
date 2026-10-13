import {NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {cookieName,issueSession,secureConfigured} from "@/lib/admin-auth";
function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export async function POST(req:Request){
 if(!secureConfigured())return NextResponse.json({error:"Admin login not configured"},{status:503});
 let data:unknown;try{data=await req.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 const input=data as {email?:unknown;password?:unknown};
 if(!input||typeof input.email!=="string"||typeof input.password!=="string"||!equal(input.email,process.env.ADMIN_EMAIL!)||!equal(input.password,process.env.ADMIN_PASSWORD!))
 return NextResponse.json({error:"Invalid credentials"},{status:401});
 const res=NextResponse.json({ok:true});res.cookies.set(cookieName,issueSession(),{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/",maxAge:28800});return res;
}
