# EezEvent Webapp

Next.js App Router + React + MUI website for EezEvent.

## API configuration

Local development calls FastAPI at `http://localhost:8000` by default.
To use another backend, set this in `.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Restart `npm run dev` after changing environment variables. `NEXT_PUBLIC_API_BASE_URL`
is embedded in browser code at build time, so set it before `npm run build` for deployments
(for example, `https://api.eezevent.com`). When omitted in production, browser requests use
the website origin and require a reverse proxy to the backend.

Server-rendered vendor profiles use `API_BASE_URL` if set, then
`NEXT_PUBLIC_API_BASE_URL`, with the same localhost default in development.
Set one of these variables for production vendor profiles.

`VITE_API_BASE_URL` and `VITE_API_PROXY_TARGET` are no longer used.

## Scripts

- `npm run dev` starts Next.js with output in `.next-dev`.
- `npm run build` creates a production build in `.next`.
- `npm start` serves the production build.

### Google sign-in

Set `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env.local` to your Google OAuth web
client ID (`NEXT_PUBLIC_GOOGLE_CLIENT_ID` is also supported). Expo's
`EXPO_PUBLIC_*` variables are not read by this Next.js app. Restart the dev server
after changing these values. For Docker deployments, supply
`--build-arg NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID=...` when building the image; the
public client ID is embedded at build time. Never put a Google client secret in
any `NEXT_PUBLIC_*` variable.

### Authentication mode

The web equivalent of mobile's `EXPO_PUBLIC_AUTH_MODE` is
`NEXT_PUBLIC_AUTH_MODE`:

- `social_only`: Google login and registration for Host and Business accounts.
  Email/password login, manual registration, email verification, and resend-code
  calls are hidden and blocked by the browser API layer.
- `mixed`: social and email/password authentication for local testing.
  Like mobile, `development` is also treated as mixed mode.

Local development defaults to `mixed`. Production builds and Docker default to
`social_only`. Set `NEXT_PUBLIC_AUTH_MODE=social_only` for production and keep it
aligned with the services backend's `AUTH_MODE=social_only`. The backend remains
responsible for enforcing its authentication policy. An explicit `mixed` override
is available for testing a production build against a development backend.

This public flag and `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` are embedded at build time.
Rebuild/redeploy after changes; runtime container environment changes do not alter
the browser bundle. Docker supports `--build-arg NEXT_PUBLIC_AUTH_MODE=social_only`.

### Vendor profile slugs

Profile links use the service's persistent `slug`, for example
`/vendors/nihi-cakes-a1b2c3d4e5f6`. Names can change without changing the URL.
Existing numeric profile links redirect permanently to the slug, retaining search
and inquiry parameters. All catalog, review, and inquiry API calls still use the
numeric `service_id` from the resolved profile.

Deploy the services migration `20261104_service_slugs` before the updated API,
then deploy this webapp. Existing services are backfilled with name-and-ID slugs;
new services receive name-and-random-suffix slugs. Neither requires users to edit
existing services. Numeric links remain supported for older mobile clients.

The sitemap accepts `PUBLIC_VENDOR_SERVICE_SLUGS` (comma separated). Existing
`PUBLIC_VENDOR_SERVICE_IDS` are resolved to slugs when an API base URL is configured.


## Deploy to AWS dev

`.github/workflows/deploy-dev.yml` deploys pushes to `dev` to
`https://webapp-dev.eezevent.com`; manual dispatch is also restricted to `dev`.
It runs tests, builds an amd64 image, pushes it to ECR, and deploys by image digest
to `eezevent-dev-webapp-service` in `eezevent-dev-cluster` (account `250830191532`,
region `us-east-2`). It waits for stability and fails if ECS rolls back the release.

Follow the [dev deployment guide](../eezevent-infra/live/dev/webapp/README.md)
for routine releases, one-time bootstrap, verification, and rollbacks.

Before the first run, bootstrap the service with `eezevent-infra/live/dev/webapp`
and apply its GitHub OIDC deployment role. In this repository's GitHub settings,
create an environment named **development**, restrict it to the **dev** branch,
and configure these environment variables:

- `AWS_ROLE_ARN`: infra output `github_deploy_role_arn`.
- `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`: the dev Google OAuth web client ID.

No AWS access-key secrets are required. The workflow uses
`https://dev-api.eezevent.com` and builds with `social_only` authentication.
Complete the GoDaddy DNS, backend CORS, and Google OAuth origin setup described
in the infra deployment guide before browser testing. Subsequent GitHub deployments
own the service's task-definition revision; Terraform retains infrastructure ownership.
