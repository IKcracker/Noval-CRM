-- Customer relationship records are managed separately from historic quote submissions.
-- No automatic import of existing quote contacts; use the explicit admin import action.
BEGIN;
CREATE TABLE IF NOT EXISTS crm_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  billing_address text,
  status text NOT NULL DEFAULT 'PROSPECT' CHECK (status IN ('PROSPECT','ACTIVE','INACTIVE')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(length(trim(contact_name)) >= 2),
  CHECK(length(trim(email)) >= 5)
);
CREATE UNIQUE INDEX IF NOT EXISTS crm_customers_email_unique ON crm_customers(lower(email));
CREATE INDEX IF NOT EXISTS crm_customers_status_created_idx ON crm_customers(status,created_at DESC);
CREATE TABLE IF NOT EXISTS crm_customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES crm_customers(id) ON DELETE CASCADE,
  body text NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 5000),
  actor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_customer_notes_customer_idx ON crm_customer_notes(customer_id,created_at DESC);
COMMIT;
