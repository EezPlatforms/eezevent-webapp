# EezEvent visual consistency

- Use `src/components/BrandIdentity.jsx` for every EezEvent header wordmark and logo. Use its `BrandLogo` export for standalone logos (for example, sign-in and registration). Do not recreate logo or wordmark styling in individual pages.
- Keep the shared logo dimensions, corner radius, padding, border, and background consistent. The EezEvent wordmark uses the theme's Source Sans 3 font, 24px, weight 700, line-height 1, and -0.02em letter spacing.
- Wordmark colors follow the brand palette: `primary.main` in light mode and `primary.light` in dark mode for readable contrast. Apply branding changes centrally so authenticated pages and public invitations stay consistent.
- Use typography and palette tokens from `src/theme.js` and surface/border tokens from `src/theme-tokens.js` across all pages. Reuse shared components instead of adding page-specific variations of the same UI.

- The canonical brand tagline is “More organized. Less chaos.” Match `BRAND_TAGLINE` in `BrandIdentity.jsx` and the coming-soon website. Do not introduce alternate header taglines; campaign headlines may remain specific to their content.
