CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS quote_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 reference text UNIQUE NOT NULL,
 contact_name text NOT NULL,
 company text,
 email text NOT NULL,
 phone text NOT NULL,
 origin text NOT NULL,
 destination text NOT NULL,
 service_type text NOT NULL,
 cargo_details text NOT NULL,
 pickup_date date,
 weight_kg numeric(12,2),
 status text NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','REVIEWING','PRICED','SENT','ACCEPTED','DECLINED','EXPIRED')),
 quoted_amount_cents bigint,
 quoted_currency char(3) NOT NULL DEFAULT 'ZAR',
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quote_requests_created_at_idx ON quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS quote_requests_status_idx ON quote_requests(status);
CREATE TABLE IF NOT EXISTS quote_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 quote_id uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
 from_status text,
 to_status text NOT NULL,
 note text,
 actor text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quote_events_quote_idx ON quote_events(quote_id,created_at DESC);
