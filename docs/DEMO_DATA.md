# Demo dataset for Noval CRM

This is **fictional demo data**, not live cargo, customers, drivers, or GPS positions.

## Coverage

- 12 quote requests across NEW, REVIEWING, PRICED, SENT, ACCEPTED, DECLINED and EXPIRED
- 6 bookings: 1 pending dispatch and 5 confirmed
- 5 trips with example driver names and vehicle registrations
- 5 shipments covering SCHEDULED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED and EXCEPTION
- Shipment milestone histories including an internal-only exception event
- All contact emails use `example.com`; no real customer contact details are seeded

## Seed a non-production database

1. Configure a **development/staging** `DATABASE_URL`, and apply `db/001_quotes.sql`, then `db/002_booking_pipeline.sql`, then `db/003_shipment_operations.sql`.
2. Execute the seed script with the explicit safeguard:

```bash
PGOPTIONS="-c noval.allow_demo_seed=true" psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/seed_demo.sql
```

The script refuses to run without the session flag. It never drops, deletes or updates business records. It uses stable IDs and `ON CONFLICT DO NOTHING`, so rerunning will not create duplicate demo records.

## Testing

Open `/dashboard`, `/dashboard/quotes`, `/dashboard/bookings` and `/dashboard/shipments` after configuring admin access.

For public tracking use the generated reference and matching `example.com` email from the quote. To look up sample pairs:

```sql
SELECT q.reference AS quote_reference,q.email,s.tracking_number,s.status
FROM shipments s JOIN bookings b ON s.booking_id=b.id
JOIN quote_requests q ON q.id=b.quote_id
WHERE q.reference LIKE 'DEMO-Q%'
ORDER BY q.reference;
```

You may also change **the state of a seeded shipment** through the operator UI. If you need a fresh dataset afterward, reset only a disposable development database and reapply migrations and seed.

**Do not seed production:** explicit opt-in is a safeguard, not a guarantee that your connection points to the correct database. Check `DATABASE_URL` before running. This change commits files to the repository; it does not insert records into your Neon database automatically.
