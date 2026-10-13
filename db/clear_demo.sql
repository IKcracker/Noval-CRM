-- Explicitly removes only deterministic demo records and dependent rows.
-- Safe against accidental deletion of unrelated quotations.
BEGIN;
DO $guard$
BEGIN
 IF current_setting('noval.allow_demo_seed',true) IS DISTINCT FROM 'true' THEN
  RAISE EXCEPTION 'Demo cleanup requires explicit opt-in.';
 END IF;
END
$guard$;
DELETE FROM shipment_events WHERE shipment_id IN (
 SELECT id FROM shipments s WHERE s.id IN (
  SELECT md5('noval-demo-shipment:'||q.reference)::uuid
  FROM quote_requests q
  WHERE q.reference LIKE 'DEMO-Q%' AND q.id=md5('noval-demo-quote:'||q.reference)::uuid
 )
);
DELETE FROM shipments WHERE id IN (
 SELECT md5('noval-demo-shipment:'||q.reference)::uuid FROM quote_requests q
 WHERE q.reference LIKE 'DEMO-Q%' AND q.id=md5('noval-demo-quote:'||q.reference)::uuid
);
DELETE FROM trips WHERE id IN (
 SELECT md5('noval-demo-trip:'||q.reference)::uuid FROM quote_requests q
 WHERE q.reference LIKE 'DEMO-Q%' AND q.id=md5('noval-demo-quote:'||q.reference)::uuid
);
DELETE FROM bookings WHERE id IN (
 SELECT md5('noval-demo-booking:'||q.reference)::uuid FROM quote_requests q
 WHERE q.reference LIKE 'DEMO-Q%' AND q.id=md5('noval-demo-quote:'||q.reference)::uuid
);
DELETE FROM quote_events WHERE quote_id IN (
 SELECT q.id FROM quote_requests q
 WHERE q.reference LIKE 'DEMO-Q%' AND q.id=md5('noval-demo-quote:'||q.reference)::uuid
);
DELETE FROM quote_requests q WHERE q.reference LIKE 'DEMO-Q%' AND q.id=md5('noval-demo-quote:'||q.reference)::uuid;
COMMIT;
