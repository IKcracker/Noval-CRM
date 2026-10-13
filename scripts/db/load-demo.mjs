import {run,requireDemoAccess,sqlFile} from "./core.mjs";
try{
 requireDemoAccess();
 await run(async sql=>{
  await sql.unsafe("SET noval.allow_demo_seed = 'true'");
  await sql.unsafe(sqlFile("seed_demo.sql"));
  const rows=await sql`SELECT (SELECT count(*) FROM quote_requests WHERE reference LIKE 'DEMO-Q%')::int AS quotes,(SELECT count(*) FROM bookings WHERE reference LIKE 'DEMO-B%')::int AS bookings,(SELECT count(*) FROM shipments WHERE tracking_number LIKE 'NVL-%' AND id IN (SELECT md5('noval-demo-shipment:'||replace(reference,'DEMO-B','DEMO-Q'))::uuid FROM bookings WHERE reference LIKE 'DEMO-B%'))::int AS shipments`;
  console.log("Demo data ready:",rows[0]);
 });
}catch(error){console.error("Demo load failed:",error.message);process.exitCode=1;}
