# Real route calculation setup

The CRM uses [openrouteservice](https://openrouteservice.org/) for South African location lookup and road routing, and Leaflet/OpenStreetMap for map display.

Add to server environment variables only:

```dotenv
OPENROUTESERVICE_API_KEY=your_key
```

Create a developer account with openrouteservice, generate an API key, set it locally in `.env.local`, and configure it in Vercel. **Do not** prefix it with `NEXT_PUBLIC_`. The server API `POST /api/admin/routing` requires an authenticated administrator, validates origin/destination and never exposes the key.

The map shows road-route geometry and estimated travel time from the routing provider; **it is not live GPS, promised arrival time or vehicle compliance verification**. City names may resolve to city centres. Use verified street addresses/coordinates for real jobs. Location results should be reviewed before dispatching.

The free openrouteservice tier has API quotas and service-specific restrictions. The public OpenStreetMap tile service has its own [usage policy](https://operations.osmfoundation.org/policies/tiles/). High-traffic production requires compliant commercial/hosted map tiles, quotas, monitoring and usually external caching/rate limiting. This initial route API uses in-memory caching only; it is per instance and does not implement distributed throttling.

Outstanding release gates: persisted verified collection/delivery coordinates; driver/vehicle eligibility; role-based auth; API throttling; routing failure monitoring; maps tile SLA; unit and integration tests; UAT with real addresses; live GPS consent and telemetry.
