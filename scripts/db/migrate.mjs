import fs from "node:fs";
import path from "node:path";
import {run,checksum,sqlFile} from "./core.mjs";

try {
 await run(async sql=>{
  await sql`CREATE TABLE IF NOT EXISTS _noval_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`;
  const dir=path.join(process.cwd(),"db");
  const files=fs.readdirSync(dir).filter(x=>/^\d{3}_[\w-]+\.sql$/.test(x)).sort();
  if(!files.length)throw new Error("No numbered database migrations found in db/.");
  for(const file of files){
   const body=sqlFile(file), hash=checksum(body);
   const old=await sql`SELECT checksum FROM _noval_migrations WHERE name=${file}`;
   if(old.length){if(old[0].checksum!==hash)throw new Error("Applied migration changed: "+file+". Create a new migration instead.");console.log("SKIP",file);continue;}
   // Individual migration files can include BEGIN/COMMIT. Run each on a single connection.
   await sql.unsafe(body);
   await sql`INSERT INTO _noval_migrations(name,checksum) VALUES (${file},${hash})`;
   console.log("APPLIED",file);
  }
  console.log("All Neon migrations are up to date.");
 });
}catch(error){console.error("Migration failed:",error.message);process.exitCode=1;}
