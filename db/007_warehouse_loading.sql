-- Warehouse loading workspace: dock assignment and recorded loaded weight per trip.
-- Values are entered by warehouse staff; nothing is inferred from telemetry.
BEGIN;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS loading_dock smallint CHECK (loading_dock BETWEEN 1 AND 99);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS loaded_kg numeric(12,2) NOT NULL DEFAULT 0 CHECK (loaded_kg >= 0);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS loading_status text NOT NULL DEFAULT 'NOT_STARTED'
  CHECK (loading_status IN ('NOT_STARTED','LOADING','READY'));
ALTER TABLE trips ADD COLUMN IF NOT EXISTS loading_updated_at timestamptz;
CREATE INDEX IF NOT EXISTS trips_loading_queue_idx ON trips(status,loading_status,scheduled_departure);
COMMIT;
