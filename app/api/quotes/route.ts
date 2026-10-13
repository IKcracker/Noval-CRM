import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const limit = Number(request.headers.get("content-length") ?? 0);
  if (limit > 16000) return NextResponse.json({error:"Request too large"},{status:413});
  let data: Record<string,unknown>;
  try { data = await request.json(); } catch { return NextResponse.json({error:"Invalid request body"},{status:400}); }
  const required = ["contactName","email","phone","origin","destination","cargoDetails"];
  if (required.some(key => typeof data[key] !== "string" || !(data[key] as string).trim() || (data[key] as string).length > 1500))
    return NextResponse.json({error:"Please provide valid contact, origin, destination and cargo details"},{status:400});
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email as string))
    return NextResponse.json({error:"Enter a valid email address"},{status:400});
  // Fail closed until persistence, abuse protection, and CRM notifications are configured.
  return NextResponse.json({error:"Quote submissions are not yet enabled. Please contact the operations team directly."},{status:503});
}
