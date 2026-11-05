# EezEvent WebApp — Next.js migration

This branch migrates the existing React + Vite app to Next.js App Router (React 19, MUI 7), preserving the existing theme, pages, and FastAPI client adapters.

## Development

Node.js 20.9+ recommended.

```bash
npm install
NEXT_PUBLIC_API_BASE_URL=https://YOUR-EXISTING-API-ORIGIN npm run dev
npm run build
npm run start
```

Set `API_BASE_URL` to the existing eezevent-services origin for server-rendered public profiles. `NEXT_PUBLIC_API_BASE_URL` is compiled into the browser bundle; it must be a browser-reachable origin with suitable CORS configuration. Never put secrets in NEXT_PUBLIC variables. The existing auth flow remains browser-based and must be reviewed before introducing authenticated server rendering.

The public vendor URL is `https://eezevent.com/vendors/{serviceId}`. Next.js server-rendered metadata uses the existing `GET /business/public/service/{id}` API. Client reviews use the existing `GET /reviews/services/{id}` endpoint. No services changes.

## AWS deployment

Build a Next.js standalone Docker image; deploy it as a new ECS Fargate service and target group in the existing ECS cluster and ALB. Route the website domain through CloudFront/ALB as appropriate. Ensure CloudFront does not cache authenticated HTML or API responses. Configure ECS health checks, logging, task CPU/memory, autoscaling and deployment rollback. The old Vite `server.mjs` was removed.

## SEO

The Next.js App Router owns public metadata, canonical tags, and JSON-LD. `robots.js` and `sitemap.js` are Next metadata routes. The sitemap uses `PUBLIC_VENDOR_SERVICE_IDS` as a verified allowlist; a dynamic complete sitemap requires an existing enumerating API or an export pipeline. Review privacy, public eligibility and unpublished vendors before adding IDs.

## Release gates (not yet verified)

- Install dependencies and commit the generated lockfile; run `npm run build`.
- Test all existing routes, email/password login, Google sign-in, event creation, search, vendor profile, image display and reviews.
- Verify real HTML with `curl` and social sharing preview tools.
- Test API CORS and CDN routing in dev/staging before promoting to production.
- Confirm the current app's Vite environment values have been mapped to `NEXT_PUBLIC_*` variables.
- Check MUI SSR hydration, accessibility, and responsive layouts.
- Ensure only public service details are rendered server-side and no authenticated tokens enter CDN caches.

No merges into dev/main are part of this migration.
