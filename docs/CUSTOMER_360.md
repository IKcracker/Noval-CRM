# Customer 360 Workspace

The Customers module uses persistent tables `crm_customers` and `crm_customer_notes`. Apply `db/005_customer_workspace.sql` via `npm run data:migrate` after updating the code.

## What works
- Create customer accounts, including contact name, company, email, telephone, billing address and status.
- Search/filter customer directory with Neon-backed pagination.
- Open a customer profile and update contact details.
- Record dated notes linked to each customer.
- View existing quotes and shipment history associated with the customer's email.
- Explicitly import customer contacts from existing real quotations, skipping email duplicates and reference prefix `DEMO-Q%`.

## Important limitations and production gates
- History is currently associated **by email**, not by an immutable customer foreign key. If the customer email is changed, the historical association shown on the profile can change. Full normalization requires a later migration and backfill review.
- Import is explicit and does not rewrite historical quotation records. Check imported contacts for outdated or shared email addresses before using them for outreach.
- The application still uses one shared administrator identity. Implement individual accounts, role-based permissions and change audit logs before deploying for large multi-user operations.
- Notes currently have no edit/delete workflow and records have no deduplication beyond unique email. Build retention policies and consent/POPIA controls before using it for customer PII at scale.
- Creation, editing and import remain admin-only. No automated customer communications are sent from these features.
- CI compile checks do not validate live Neon migrations, browser behavior or production security.

## Rollout
1. Pull latest main after merge.
2. Set your Neon development `DATABASE_URL`.
3. Run `npm run data:migrate` to apply migration 005.
4. Start `npm run dev` and visit `/dashboard/customers`.
5. Test customer creation and customer notes; optionally import real quote contacts from the directory.
