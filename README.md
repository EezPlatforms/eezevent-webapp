# EezEvent Webapp

React + MUI marketing site for EezEvent, using the mobile app navy palette as its base design
system.

## API configuration

Set `VITE_API_BASE_URL` when the web app should call a specific `eezevent-services` host.

- Example local value: `http://localhost:8000`
- If omitted, the app uses the current origin and expects the backend to be available there or
  behind a reverse proxy.

For local Vite development, the dev server now proxies backend routes to
`http://localhost:8000` by default. Override that with `VITE_API_PROXY_TARGET` if your local
`eezevent-services` instance runs somewhere else.

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.
