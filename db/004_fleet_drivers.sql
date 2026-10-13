BEGIN;
CREATE TABLE IF NOT EXISTS drivers(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name text NOT NULL,
 phone text NOT NULL,
 license_number text NOT NULL UNIQUE,
 license_expiry date NOT NULL,
 status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','VERIFIED','SUSPENDED')),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS vehicles(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 registration text NOT NULL UNIQUE,
 make_model text NOT NULL,
 capacity_kg numeric(12,2) NOT NULL CHECK(capacity_kg>0),
 roadworthy_expiry date NOT NULL,
 status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','VERIFIED','OUT_OF_SERVICE')),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS driver_id uuid REFERENCES drivers(id);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS vehicle_id uuid REFERENCES vehicles(id);
CREATE INDEX IF NOT EXISTS drivers_status_idx ON drivers(status,license_expiry);
CREATE INDEX IF NOT EXISTS vehicles_status_idx ON vehicles(status,roadworthy_expiry);
CREATE INDEX IF NOT EXISTS trips_driver_schedule_idx ON trips(driver_id,scheduled_departure,scheduled_arrival);
CREATE INDEX IF NOT EXISTS trips_vehicle_schedule_idx ON trips(vehicle_id,scheduled_departure,scheduled_arrival);
COMMIT;
