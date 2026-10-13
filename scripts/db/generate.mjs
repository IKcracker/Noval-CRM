import fs from "node:fs";
import path from "node:path";

const label=(process.argv.slice(2).join("_")||"new_change").toLowerCase().replace(/[^a-z0-9_]+/g,"_").replace(/^_+|_+$/g,"");
if(!label){console.error("Provide a migration name.");process.exit(1);}
const folder=path.join(process.cwd(),"db");
const migrations=fs.readdirSync(folder).filter(x=>/^\d{3}_.*\.sql$/.test(x));
const next=String(Math.max(0,...migrations.map(x=>Number(x.slice(0,3))))+1).padStart(3,"0");
const file=path.join(folder,next+"_"+label+".sql");
fs.writeFileSync(file,`-- ${label.replaceAll("_"," ")}\n-- Add your PostgreSQL schema changes here.\nBEGIN;\n\n-- Example: ALTER TABLE ...;\n\nCOMMIT;\n`,{flag:"wx"});
console.log("Created db/"+path.basename(file));
console.log("Edit the SQL, then run: npm run data:migrate");
