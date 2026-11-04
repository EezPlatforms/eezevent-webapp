import { vendorProfilePath, validServiceReference } from "../lib/vendorProfilePath";

export default async function sitemap() {
  const slugs = (process.env.PUBLIC_VENDOR_SERVICE_SLUGS || "").split(",").map(value => value.trim()).filter(validServiceReference);
  const ids = (process.env.PUBLIC_VENDOR_SERVICE_IDS || "").split(",").filter(value => /^\d+$/.test(value));
  const base = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/+$/, "").replace(/\/api$/, "");
  const resolved = await Promise.all(ids.map(async id => {
    if (!base) return vendorProfilePath({ service_id: id });
    try {
      const response = await fetch(`${base}/business/public/service/${id}`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return null;
      const profile = await response.json();
      return profile?.service ? vendorProfilePath(profile.service) : null;
    } catch { return vendorProfilePath({ service_id: id }); }
  }));
  const paths = new Set([...slugs.map(slug => vendorProfilePath({ slug })), ...resolved.filter(Boolean)]);
  return [{ url: "https://eezevent.com", lastModified: new Date() }, ...[...paths].map(path => ({ url: `https://eezevent.com${path}` }))];
}
