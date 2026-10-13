# Driver & fleet operations (migration 004)

Run `npm run data:migrate` after pulling the latest CRM branch to add `drivers`, `vehicles`, and trip resource references.

Navigate to `/dashboard/fleet`. Register drivers and vehicles. New resources have status `PENDING` by default. The admin can change a resource to `VERIFIED` only when the recorded license or roadworthy expiry has not passed. Driver suspension and vehicle out-of-service options are available.

When confirming a pending booking, the dispatcher now chooses a driver and vehicle from verified resources; the server confirms both are still verified and their compliance dates are current before dispatch. It also rejects time-overlapping active trip assignments for either resource.

## Important limitations

- This is a basic **manual status verification**, **not** third-party licensing verification. There are no uploaded license, ID, insurance or roadworthy documents or automated document review yet.
- There is currently only a shared administrator login, not permission-level verification approvals. Do not treat a manually marked VERIFIED record as proof of legal operating eligibility.
- Schedule conflicts use trip records and their scheduled timestamps, not real-world driver availability or GPS.
- Existing demo trips still have free-text driver and vehicle snapshots. They remain viewable but are not linked to registry resources.
- Create sample driver and vehicle records manually in the Fleet page; demo seed is unchanged.
- Database migrations and realistic multi-user UAT are required prior to production use.

## Deployment

1. Pull feature branch or after merge pull main.
2. `npm install`, then `npm run data:migrate` using the intended Neon database.
3. Start `npm run dev`; open `/dashboard/fleet`.
4. Add and verify test resources, then confirm a pending booking.
