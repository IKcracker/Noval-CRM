import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import postgres from "postgres";

const root=process.cwd();
for (const file of [".env.local",".env"]) {
 const location=path.join(root,file);
 if (fs.existsSync(location) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(location);
 }
}
export function database() {
 const url=process.env.DATABASE_URL;
 if (!url) throw new Error("DATABASE_URL is missing. Configure .env.local with your Neon development connection string.");
 const parsed=new URL(url);
 if (!["postgres:","postgresql:"].includes(parsed.protocol)) throw new Error("DATABASE_URL must be a PostgreSQL connection string.");
 return postgres(url,{ssl:"require",max:1,prepare:false,connect_timeout:15,idle_timeout:3});
}
export function requireDemoAccess() {
 if(process.env.DEMO_DATA_ENABLED!=="true") throw new Error("Set DEMO_DATA_ENABLED=true in .env.local before loading or clearing demo data.");
 if(process.env.NODE_ENV==="production" || process.env.VERCEL_ENV==="production") throw new Error("Demo operations are not allowed in production runtime.");
 const parsed=new URL(process.env.DATABASE_URL||"");
 const host=parsed.hostname.toLowerCase();
 if(!host.endsWith(".neon.tech")) throw new Error("Demo scripts require a Neon PostgreSQL connection.");
 const databaseName=decodeURIComponent(parsed.pathname.slice(1));
 if(!databaseName) throw new Error("DATABASE_URL must include a Neon database name.");
 // The database name and hostname come from DATABASE_URL; no duplicate configuration is needed.
 // Confirm you are connected to a disposable Neon branch before enabling demo operations.
 console.log("Demo database target:", databaseName,"on",host);
}
export function checksum(value){return createHash("sha256").update(value).digest("hex");}
export function sqlFile(name){return fs.readFileSync(path.join(root,"db",name),"utf8");}
export async function run(command) {
 const client=database();
 try{return await command(client);}finally{await client.end({timeout:5});}
}
