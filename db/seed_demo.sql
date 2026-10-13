-- TEST DATA ONLY. Requires migrations 001, 002 and 003.
-- Explicitly opt in for this psql session: PGOPTIONS="-c noval.allow_demo_seed=true" psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/seed_demo.sql
-- Safe to run repeatedly: deterministic IDs, ON CONFLICT DO NOTHING, no edits to existing records.
BEGIN;
DO $seed_guard$
BEGIN
 IF current_setting('noval.allow_demo_seed', true) IS DISTINCT FROM 'true' THEN
  RAISE EXCEPTION 'Demo seeding blocked. Set noval.allow_demo_seed=true for this session in a NON-PRODUCTION database.';
 END IF;
END
$seed_guard$;
WITH sample(reference,contact_name,company,email,origin,destination,service_type,cargo_details,weight_kg,status,quoted_amount_cents,age_days) AS (
 VALUES
 ('DEMO-Q001','Naledi Molefe','Highveld Office Supplies','naledi@example.com','Pretoria','Johannesburg','Road freight','Office stationery, 8 cartons',160,'NEW',NULL,3),
 ('DEMO-Q002','Thabo Mokoena','Summit Trading','thabo@example.com','Centurion','Polokwane','Dedicated truck','Palletised packaging materials',1250,'REVIEWING',NULL,2),
 ('DEMO-Q003','Lerato Dlamini','Cape Distribution','lerato@example.com','Cape Town','George','Courier delivery','12 boxed computer accessories',84,'PRICED',295000,6),
 ('DEMO-Q004','Sipho Nkosi','Coastal Fresh','sipho@example.com','Durban','Pietermaritzburg','Express shipment','Temperature-controlled food samples',95,'SENT',185000,5),
 ('DEMO-Q005','Amara Jacobs','VeldTech','amara@example.com','Johannesburg','Pretoria','Road freight','4 pallets of electrical supplies',960,'ACCEPTED',520000,7),
 ('DEMO-Q006','Karabo Ndlovu','Westline Retail','karabo@example.com','Bloemfontein','Johannesburg','Road freight','Homeware, 20 cartons',440,'ACCEPTED',670000,8),
 ('DEMO-Q007','Neo Matlala','Northstar Auto','neo@example.com','Polokwane','Pretoria','Dedicated truck','Automotive components, 3 pallets',1800,'ACCEPTED',995000,9),
 ('DEMO-Q008','Zanele Maseko','KwaZulu Retail','zanele@example.com','Durban','Johannesburg','Road freight','Retail stock, 6 pallets',2300,'ACCEPTED',1240000,10),
 ('DEMO-Q009','Boitumelo van Wyk','Eastern Logistics','boitumelo@example.com','Gqeberha','East London','Courier delivery','Small electronics, 5 cartons',120,'ACCEPTED',345000,4),
 ('DEMO-Q010','David Molefe','Limpopo Plastics','david@example.com','Pretoria','Nelspruit','Road freight','Plastic products, 9 pallets',3600,'ACCEPTED',1795000,11),
 ('DEMO-Q011','Lebohang Mokoena','Riverstone Foods','lebohang@example.com','Cape Town','Stellenbosch','Courier delivery','Packaging samples',50,'DECLINED',NULL,6),
 ('DEMO-Q012','Mpho Khumalo','Meridian Steel','mpho@example.com','Johannesburg','Witbank','Dedicated truck','Steel sections, 3 tonnes',3000,'EXPIRED',890000,12)
)
INSERT INTO quote_requests(id,reference,contact_name,company,email,phone,origin,destination,service_type,cargo_details,weight_kg,status,quoted_amount_cents,quoted_currency,pickup_date,created_at,updated_at)
SELECT md5('noval-demo-quote:'||reference)::uuid,reference,contact_name,company,email,'+27 00 000 0000',origin,destination,service_type,cargo_details,weight_kg,status,quoted_amount_cents,'ZAR',(CURRENT_DATE+7)::date,now()-(age_days||' days')::interval,now()-(age_days||' days')::interval
FROM sample
ON CONFLICT DO NOTHING;
-- Each demo quote gets an initial event; upsert by a deterministic event ID.
INSERT INTO quote_events(id,quote_id,from_status,to_status,note,actor,created_at)
SELECT md5('noval-demo-quote-event:'||q.reference)::uuid,q.id,NULL,q.status,'DEMO ONLY: initial status for test records','demo-seed',q.created_at
FROM quote_requests q WHERE q.reference LIKE 'DEMO-Q%' AND q.id=md5('noval-demo-quote:'||q.reference)::uuid
ON CONFLICT DO NOTHING;
-- Accepted quotations create pending bookings.
INSERT INTO bookings(id,quote_id,reference,status,created_at,updated_at)
SELECT md5('noval-demo-booking:'||q.reference)::uuid,q.id,replace(q.reference,'DEMO-Q','DEMO-B'),CASE WHEN q.reference='DEMO-Q005' THEN 'PENDING' ELSE 'CONFIRMED' END,
q.created_at+interval '6 hours',q.created_at+interval '6 hours'
FROM quote_requests q WHERE q.reference IN ('DEMO-Q005','DEMO-Q006','DEMO-Q007','DEMO-Q008','DEMO-Q009','DEMO-Q010')
AND q.id=md5('noval-demo-quote:'||q.reference)::uuid
ON CONFLICT DO NOTHING;
-- Confirmed bookings each have one scheduled trip and one shipment.
WITH sample(reference,status,driver,registration,stages) AS (
 VALUES ('DEMO-Q006','IN_TRANSIT','Busi Sibiya','GP-482-DK','SCHEDULED,PICKED_UP,IN_TRANSIT'),
 ('DEMO-Q007','OUT_FOR_DELIVERY','Peter Maseko','LMP-993-GP','SCHEDULED,PICKED_UP,IN_TRANSIT,OUT_FOR_DELIVERY'),
 ('DEMO-Q008','DELIVERED','Nokuthula Zulu','ND-348-PL','SCHEDULED,PICKED_UP,IN_TRANSIT,OUT_FOR_DELIVERY,DELIVERED'),
 ('DEMO-Q009','EXCEPTION','David Jones','EC-627-XP','SCHEDULED,PICKED_UP,EXCEPTION'),
 ('DEMO-Q010','SCHEDULED','Moeketsi Seema','GP-840-JW','SCHEDULED')
)
INSERT INTO trips(id,booking_id,reference,driver_name,vehicle_registration,scheduled_departure,scheduled_arrival,status,created_at)
SELECT md5('noval-demo-trip:'||s.reference)::uuid,b.id,replace(s.reference,'DEMO-Q','DEMO-T'),s.driver,s.registration,
now()-interval '2 days',now()+interval '2 days',
CASE WHEN s.status='DELIVERED' THEN 'COMPLETED' WHEN s.status='SCHEDULED' THEN 'CONFIRMED' ELSE 'IN_TRANSIT' END,b.created_at+interval '1 hour'
FROM sample s JOIN bookings b ON b.reference=replace(s.reference,'DEMO-Q','DEMO-B') AND b.id=md5('noval-demo-booking:'||s.reference)::uuid
ON CONFLICT DO NOTHING;
WITH sample(reference,status) AS (VALUES ('DEMO-Q006','IN_TRANSIT'),('DEMO-Q007','OUT_FOR_DELIVERY'),('DEMO-Q008','DELIVERED'),('DEMO-Q009','EXCEPTION'),('DEMO-Q010','SCHEDULED'))
INSERT INTO shipments(id,booking_id,tracking_number,status,created_at)
SELECT md5('noval-demo-shipment:'||s.reference)::uuid,b.id,'NVL-'||upper(substr(md5('noval-demo-tracking:'||s.reference),1,16)),s.status,b.created_at+interval '1 hour'
FROM sample s JOIN bookings b ON b.reference=replace(s.reference,'DEMO-Q','DEMO-B') AND b.id=md5('noval-demo-booking:'||s.reference)::uuid
ON CONFLICT DO NOTHING;
-- Multiple immutable milestone records for each shipment, with one internal-only example.
WITH sample(reference,stages) AS (
 VALUES ('DEMO-Q006',string_to_array('SCHEDULED,PICKED_UP,IN_TRANSIT',',')),
 ('DEMO-Q007',string_to_array('SCHEDULED,PICKED_UP,IN_TRANSIT,OUT_FOR_DELIVERY',',')),
 ('DEMO-Q008',string_to_array('SCHEDULED,PICKED_UP,IN_TRANSIT,OUT_FOR_DELIVERY,DELIVERED',',')),
 ('DEMO-Q009',string_to_array('SCHEDULED,PICKED_UP,EXCEPTION',',')),
 ('DEMO-Q010',string_to_array('SCHEDULED',','))
), stages AS (
 SELECT s.reference, u.status,u.ordinality AS step
 FROM sample s CROSS JOIN LATERAL unnest(s.stages) WITH ORDINALITY AS u(status,ordinality)
)
INSERT INTO shipment_events(id,shipment_id,status,note,actor,location_label,visible_to_customer,created_at)
SELECT md5('noval-demo-event:'||x.reference||':'||x.step)::uuid, sh.id,x.status,
 CASE x.status WHEN 'EXCEPTION' THEN 'Demo test exception: vehicle delayed; dispatch reviewing.'
 WHEN 'DELIVERED' THEN 'Demo proof of delivery confirmed (no actual document attached).'
 ELSE 'DEMO ONLY: shipment moved to '||replace(x.status,'_',' ') END,
 'demo-seed',
 CASE WHEN x.step=1 THEN 'Collection depot' WHEN x.step=2 THEN 'Regional depot' ELSE 'On route' END,
 NOT (x.status='EXCEPTION'),
 sh.created_at+(x.step*interval '5 hours')
FROM stages x JOIN shipments sh ON sh.id=md5('noval-demo-shipment:'||x.reference)::uuid
ON CONFLICT DO NOTHING;
COMMIT;
