import {run,requireDemoAccess,sqlFile} from "./core.mjs";
try{
 requireDemoAccess();
 await run(async sql=>{
  await sql.unsafe("SET noval.allow_demo_seed = 'true'");
  await sql.unsafe(sqlFile("clear_demo.sql"));
  console.log("Demo records cleared. Non-demo records were left unchanged.");
 });
}catch(error){console.error("Demo cleanup failed:",error.message);process.exitCode=1;}
