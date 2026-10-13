# Route planning setup

Operator route planning is available at `/dashboard/routes`. It reads **confirmed trip assignments** from Neon.

To enable an embedded map, activate the Google Maps Embed API on a Google Cloud project, create a browser-restricted API key and enable billing as applicable. Add the key in server environment variables:

```
GOOGLE_MAPS_EMBED_API_KEY=your_api_key_here
```

Restart the Next.js development server or redeploy. The page falls back to an external directions link when the key is absent.

**Security:** Restrict the key by the application's allowed HTTP referrers, restrict the API key to **Maps Embed API only**, and apply billing quotas. Maps Embed API iframe requests transmit the key to Google in the iframe URL, so do not consider the key secret.

This first iteration uses the quote's origin and destination as place labels. It does not geocode pickup and delivery addresses, optimize multi-stop routes, calculate verified ETA, or display vehicle GPS. The displayed route is **planned driving directions**, not a real-time driver location. Live GPS requires a separate, consent-aware driver-position integration.

To test route planning after Neon migrations, run `npm run load:demo` on the development branch (if necessary).
