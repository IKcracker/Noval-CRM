# Neon database commands (VS Code terminal)

Configure a **dedicated development Neon database** in `.env.local`:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@YOUR-DEV-HOST.neon.tech/noval_dev?sslmode=require
DEMO_DATA_ENABLED=true
DEMO_DATABASE_NAME=noval_dev
DEMO_NEON_HOST=YOUR-DEV-HOST.neon.tech
```

Use the exact development host and database name from your Neon connection string. Keep credentials secret and never commit `.env.local`.

From the repository root, run:

```bash
npm install
npm run data:generate -- add_vehicle_table  # creates the NEXT SQL migration template (does not change Neon)
npm run data:migrate                        # applies numbered migrations 001, 002, 003 and any new ones
npm run load:demo                           # inserts sample records (safe to rerun)
npm run clear:demo                          # removes only deterministic sample records
```

`data:generate` without a name generates `NNN_new_change.sql`. It creates a **SQL template**, not an automatic schema diff. Edit the new migration before applying it.

`data:migrate` maintains a `_noval_migrations` table and rejects changes to a migration file after it was applied. Initial migrations already deployed manually can be re-run due to their idempotent definitions.

Demo commands require explicit environment flags and a matching Neon development host/database. They never insert into production automatically.

**Important:** Run migrations first. The seed SQL is stored at `db/seed_demo.sql`. Demo loading and deletion are not part of app startup or deploy. They must be explicitly run from the terminal.
