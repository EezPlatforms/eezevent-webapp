# Production SEO deployment — public vendor profiles

Public canonical domain: https://eezevent.com

## Runtime

- Node.js 20+ required.
- Run `npm ci && npm run build && npm run start` behind HTTPS reverse proxy.
- Set `PORT` (default 3000).
- Set server-side `API_BASE_URL` to the existing eezevent-services API origin. No backend changes or new API routes are needed.
- Set browser build-time `VITE_API_BASE_URL` to the existing browser-accessible API origin; configure its CORS accordingly.
- Configure CDN/reverse proxy to route **all** eezevent.com requests (including /vendors/:id, /robots.txt, /sitemap.xml, static assets) to this Node origin. A static-only S3 site cannot execute this server.
- Proxy only publicly accessible vendor profiles. Do not expose bearer tokens or private inquiries in crawler HTML.
- Set `PUBLIC_VENDOR_SERVICE_IDS` to a comma-separated, verified inventory of publicly eligible service IDs to populate the sitemap. Without this inventory the sitemap is intentionally empty. A complete automatically maintained sitemap requires a public vendor listing source or an external export workflow; the existing per-service API alone cannot enumerate all vendors.
- If the existing production domain hosts another app, configure an edge route for /vendors/*, /robots.txt and /sitemap.xml, and coordinate a single canonical sitemap and robots policy before switching. The Node server's robots.txt is intended only when it owns the domain.
- Ensure SPA history fallback for non-vendor routes. BrowserRouter replaces HashRouter so pre-existing hash URLs need redirects or migration.
- Confirm that CDN cache keys exclude authentication cookies for public vendor HTML, and that public profile APIs never leak private data.

## Validation before release

1. `npm run build` and start the server with valid API configuration.
2. `curl -i https://eezevent.com/vendors/123` should return 200 and HTML containing the vendor name, canonical link, Open Graph tags and JSON-LD **before executing JavaScript**.
3. Test missing vendors (404), upstream outage (503), and nonnumeric IDs (404).
4. Test WhatsApp/Facebook/LinkedIn preview bots against the publicly deployed URL.
5. Verify sitemap entries match eligible public profiles, and robots.txt does not overwrite unrelated domain policies.
6. Test authenticated webapp navigation after HashRouter-to-BrowserRouter migration.
7. Validate structured data using Google's Rich Results Test and inspect indexing with Search Console. Service aggregateRating does not guarantee a Google review rich result.
8. Test page loading and API CORS in real browsers, plus mobile layout and accessible image descriptions.

No changes to eezevent-services or merges into main/dev are part of this feature branch.
