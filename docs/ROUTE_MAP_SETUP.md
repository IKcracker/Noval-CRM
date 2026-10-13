# Free OpenStreetMap route overview

The route planning page at `/dashboard/routes` now embeds **OpenStreetMap** without a Google Maps key or paid map account.

The embedded map shows an approximate geographic overview for supported South African city names. It is **not** the calculated road route and does not display live GPS. Select **Plan driving route** to open OpenStreetMap directions in a new tab, where road routing is handled by the directions service.

The locations are approximate city centres, not collection/delivery addresses. Unsupported or ambiguous locations show a fallback message; add geocoding and a suitable routing service if precise address-to-address route geometry and ETA are required.

OpenStreetMap data contributors must be credited. Its public embedded map and directions services are community infrastructure with usage limits and no production SLA. If traffic grows, use a compliant tile/routing provider or self-hosted services. See https://operations.osmfoundation.org/policies/tiles/ .

No API key is needed for this first stage. Live vehicle tracking still requires driver consent and a positioning integration.
