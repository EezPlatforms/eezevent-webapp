# Eezevent Coming Soon Site

Simple static one-page site for GitHub Pages deployment with custom domain `eezevent.com`.

## Files

- `index.html` page markup
- `styles.css` brand styling (mobile app palette)
- `CNAME` custom domain config (`eezevent.com`)
- `.nojekyll` disables Jekyll processing

## Deploy To GitHub Pages

1. Create a new repository, for example `eezevent-coming-soon`.
2. Copy contents of this folder into the repository root.
3. Push to `main`.
4. In GitHub:
   - `Settings` -> `Pages`
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` and `/ (root)`
5. Wait for Pages to publish.

## Connect `eezevent.com` (GoDaddy DNS)

Use these records on your domain:

- `A` record: host `@` -> `185.199.108.153`
- `A` record: host `@` -> `185.199.109.153`
- `A` record: host `@` -> `185.199.110.153`
- `A` record: host `@` -> `185.199.111.153`
- `CNAME` record: host `www` -> `<your-github-username>.github.io`

Then in GitHub Pages settings:

1. Set custom domain to `eezevent.com`.
2. Enable `Enforce HTTPS` after DNS resolves.

## Local Preview

Open `index.html` directly, or run:

```bash
cd coming-soon-site
python3 -m http.server 8080
```

