# Noval Logistics — product source of truth

## Product objective
A web-first logistics platform connecting public freight quotes, sales CRM, dispatch, trips, and customer shipment visibility. South Africa is the initial operating market. Start with road freight and courier services; design the domain to allow future multimodal transport.

## User roles
- Visitors: request a quote; track shipments with a secure reference and additional verification where required.
- Customers: view approved quotes, bookings, PODs, invoices, and tracking.
- Sales agents: qualify and price quote requests, create customers, and obtain approval.
- Dispatchers: plan stops/routes, allocate drivers/vehicles, confirm trips, post operational events.
- Drivers: view assigned trips, update status, upload proof of delivery, report exceptions.
- Finance: invoice, record payments, credit notes, profitability.
- Administrators: RBAC, settings, tariffs, user permissions, audit.

## State machine and guards
Quote: NEW → REVIEWING → PRICED → SENT → ACCEPTED/DECLINED/EXPIRED.
Accepted quote → Booking PENDING → CONFIRMED after capacity, customer, price and pickup are checked.
Booking confirmed → Shipment CREATED → SCHEDULED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED, or EXCEPTION/RETURNED/CANCELLED.
Trip: DRAFT → ASSIGNED → CONFIRMED → IN_PROGRESS → COMPLETED; CANCELLATION requires reason and audit.
Persist status transitions and history; do not allow skips except permission-gated overrides. Never equate a planned route with live GPS.

## Main routes
Public: /, /quote, /track, /services, /contact, customer login.
Internal: /dashboard, /dashboard/quotes, /dashboard/customers, /dashboard/bookings, /dashboard/shipments, /dashboard/trips, /dashboard/fleet, /dashboard/tracking, /dashboard/invoices, /dashboard/analytics, /dashboard/settings.
Customer: /portal, /portal/shipments, /portal/documents, /portal/invoices.
Driver mobile-first: /driver/trips, /driver/trips/[id].

## Data model
Organization, User, Role, Customer, Contact, Address, QuoteRequest, Quote, QuoteLine, Booking, Shipment, Package, Trip, TripStop, Vehicle, Driver, Assignment, TrackingEvent, PositionPing, Document, ProofOfDelivery, Invoice, Payment, RateCard, AuditLog, Notification, IntegrationEvent.
Every internal record needs organizationId. Monetary fields: integer cents and ISO currency; record timezone-aware timestamps. Store documents in private object storage. Use immutable tracking event history.

## Interfaces and security
Use Next.js 16 App Router, TypeScript, Tailwind, shadcn/ui component primitives (Button, Card, Form, Input, Select, Dialog, Tabs, Badge, Table, Sheet), TanStack Table and Recharts. Add Neon PostgreSQL, Prisma, server-side authentication, org-scoped authorization, and background jobs. Use an approved route service (Google Maps Routes API or Mapbox Directions) with maps and ETA; GPS only when licensed tracking devices or driver-consented mobile pings provide it. Fall back to last confirmed scan with timestamp and explicit freshness label.
Never expose driver live coordinates without authorization. Apply rate limits/CAPTCHA to public quotes; validate with Zod, log data changes, protect PII, enforce upload limits, audit sensitive actions and test webhook signatures.

## Analytics
Quote funnel conversion, response time, acceptance rate, daily booking volumes, shipment statuses, pickup/on-time delivery SLA, trips by region, kilometers planned vs actual, driver utilization, delivery exceptions, revenue, outstanding receivables, gross margin by lane/customer, trend and cohort comparisons. All charts driven by actual, date-filtered, organization-scoped data; zero data means empty state, not fabricated metrics.

## Delivery slices
1. Public site, quote capture, tracking entry, and design system.
2. Auth/RBAC, org scope, persisted CRM quotes, inbox and approval events.
3. Quote pricing and PDF, customer acceptance, booking conversion.
4. Dispatcher board, vehicles, drivers, trips, route optimization, calendar.
5. Shipment lifecycle, driver POD, events, exception handling, public tracking.
6. Finance, notifications, operational and financial analytics.
7. Integration testing, monitoring, accessibility, performance, security and production launch.

## Release gates
Quote submitted into database exactly once; role-scoped operator can review and price; accepted quote converts into confirmed booking; trip assigned to an available licensed driver/vehicle; tracking pages reveal only permitted fields; events are timestamped; charts reconcile to operational records; tests and production build pass. Until dependencies and access control are configured, dashboard views must be considered non-production previews.
