# Noval quote workflow — setup

This branch implements a basic Neon-backed quote intake and admin review interface, not yet a complete logistics CRM.

1. Run `npm install` locally to install `@neondatabase/serverless` and regenerate **package-lock.json**. Commit the regenerated lockfile before a CI deploy.
2. Create a Neon PostgreSQL database and execute `db/001_quotes.sql`.
3. Set `DATABASE_URL` to the Neon database connection string.
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (long unique secret), and `ADMIN_SESSION_SECRET` (32+ random characters).
5. Verify `npm run lint` and `npm run build`. Neither has been run in this environment.
6. Apply bot protection and rate limiting to public quote submissions and admin login before exposing the service.
7. Restrict `/dashboard` itself: it still uses illustrative data and is not a protected authenticated dashboard. Use `/dashboard/quotes` for the authenticated inbox.
8. Verify real email notifications and consent/privacy requirements before production onboarding.

## Routes
- Public: `/`, `/quote`, `/track`.
- Operator: `/admin/login`, `/dashboard/quotes`.
- API: `POST /api/quotes`, `POST /api/auth/login`, `PATCH /api/admin/quotes/[id]`.

## Workflow limits
Status transitions are audited in `quote_events`, but the admin actor currently uses a shared operator identity. Later replace this minimal cookie login with per-user auth and full RBAC; add customer records, pricing, approval verification, quote PDFs, expiry rules and shipment conversion. The UI currently permits advancing statuses without actual prices or a sent quote, so **do not operationally mark quotes PRICED, SENT or ACCEPTED** until pricing and approval guards are implemented.
Quotes are persisted only when Neon is configured. There is no fake success.
