# Noval Premium Logistics Workspace

This UI iteration translates the two provided logistics dashboard references into the existing Next.js + shadcn/Base UI system. It does **not** copy screenshot assets or hard-code screenshot sample numbers.

## Visual system
- Light operational canvas, cobalt blue primary actions, white cards, subtle borders and shadows.
- Grouped, collapsible light sidebar; responsive workspace header with working quote search, refresh, exception navigation and new enquiry action.
- Consistent enterprise UI design tokens scoped to the CRM. Base UI portalled menus and dialogs inherit the theme.
- Main dashboard: KPIs, interactive ongoing shipment selector, driving-route preview, tracking-order register, fleet gallery, attention queues and 14-day quotation activity.
- Fleet page: searchable vehicle gallery, verification actions and registration form revealed on demand. Vehicle thumbnails are **illustrations**, not uploaded photos of registered trucks.

## Data integrity
- KPIs read existing Neon quotes, shipments, bookings, drivers and vehicles. "Accepted quote value" is **not** revenue or cash received.
- Delivery map uses the authenticated `POST /api/admin/routing` endpoint with `OPENROUTESERVICE_API_KEY`, otherwise provides an honest unavailable state and external OpenStreetMap link.
- Directions display **planned road estimates** and do **not** represent live GPS, current location or a promised ETA.
- Vehicle cards show registration, make/model, payload capacity and manually set verification status. No invented loading progress.
- Pages preserve existing CRUD/dispatch workflows. No new database migration is required.

## Review / production checks
- Validate responsive breakpoints in desktop/tablet/mobile.
- Verify the route map with legitimate shipment addresses and a valid routing API key.
- Verify fleet gallery registration/verification actions against the development Neon database.
- Test Base UI dialogs, selects and dropdowns in the premium theme.
- Confirm accessibility: keyboard navigation, focus states, contrast, empty/loading/error states.
- Run `npm run lint` and `npm run build`.
- This UI upgrade does not replace planned RBAC, multi-user authentication, real vehicle photos, telemetry, auditing, rate-limiting or compliance checks.
