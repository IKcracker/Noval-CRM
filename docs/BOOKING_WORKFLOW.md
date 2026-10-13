# Quotation → booking → trip flow (slice 2)

## Schema
Apply `db/001_quotes.sql` before `db/002_booking_pipeline.sql` to the same Neon database. The second migration creates:
- `bookings` (one per accepted quote)
- `trips` (one confirmed trip per booking)
- `shipments` (one tracking reference per confirmed booking)
- `shipment_events` (append-only delivery milestone history)

The migrations are written for PostgreSQL and must be applied separately to a provisioned database. No production data has been migrated by these commits.

## Operator journey
1. Sign in at `/admin/login`, then open `/dashboard/quotes`.
2. Review a NEW quote and move it to REVIEWING.
3. Save a valid price in ZAR. The server transitions the quote to PRICED and audits the event.
4. Send the quotation through an approved external channel, then manually record communication evidence to mark SENT.
5. Obtain written customer acceptance and record evidence in the workbench. The server atomically marks ACCEPTED, audits it and creates a unique PENDING booking.
6. Open the booking via `/dashboard/bookings`. Assign a driver name, vehicle registration and schedule; confirmation atomically creates a trip, shipment, and first SCHEDULED event.
7. Customers can use `/track` with the tracking reference **and their quote email address** to see a milestone view.

## Important limitations
- This slice does not actually send email, send PDF quotations, verify customer approval, calculate taxes, validate fleet/driver availability, expose real-time GPS, or draw live route maps.
- Operator login is a minimal single shared administrator account. Replace with proper individual accounts/RBAC before production.
- Dashboard data is real where configured, otherwise an explicit unavailable message appears. No fabricated shipment data is shown.
- Quote history and shipment history are logged. Shipment status update tools, route optimization, pricing breakdowns and live GPS integration are not yet implemented.
- Public endpoints need abuse prevention/rate limiting before public launch. Do not deploy broadly with the sample admin login without additional protection.
- Full end-to-end tests against a migrated database, RBAC tests, and manual UAT are required before release.

## Acceptance tests to run after deployment
- Unauthorized operator is redirected; API returns 401.
- Create a quote: valid data returns reference and is visible only in the operator inbox.
- Price only after REVIEWING; amount required and positive.
- Mark SENT only with evidence; ACCEPTED only after SENT and valid price.
- Repeated acceptance cannot create a duplicate booking.
- Booking confirmation requires valid times and creates one trip/shipment/tracking number.
- Repeated confirmation returns conflict and does not create duplicates.
- Correct tracking reference + customer email returns milestones, incorrect pairing returns 404.
- Database outage returns controlled error rather than false success.
