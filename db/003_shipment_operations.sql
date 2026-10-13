BEGIN;
ALTER TABLE shipment_events ADD COLUMN IF NOT EXISTS location_label text;
ALTER TABLE shipment_events ADD COLUMN IF NOT EXISTS visible_to_customer boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS shipments_status_created_idx ON shipments(status,created_at DESC);
CREATE INDEX IF NOT EXISTS shipment_events_visibility_idx ON shipment_events(shipment_id,visible_to_customer,created_at DESC);
COMMIT;
