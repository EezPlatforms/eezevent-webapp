export const dynamic = "force-dynamic";

export default function robots() {
  if (process.env.DISABLE_INDEXING === "true") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/events", "/login"] }],
    sitemap: "https://eezevent.com/sitemap.xml",
  };
}
