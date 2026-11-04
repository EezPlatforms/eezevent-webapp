import { useEffect } from "react";

const ensureMeta = (attribute, key, content) => {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

export default function VendorProfileSeo({ service, business, images, reviewCount, averageRating, invalid = false }) {
  useEffect(() => {
    const oldTitle = document.title;
    const title = service?.name
      ? `${service.name} | ${service.type_name || service.type || "Event Services"}${service.service_city || business?.city ? ` in ${service.service_city || business.city}` : ""} | EezEvent`
      : "Vendor Profile | EezEvent";
    const description = [service?.description || `Explore ${service?.name || "this vendor"} on EezEvent.`, service?.service_city || business?.city, service?.service_state || business?.state].filter(Boolean).join(" · ").slice(0, 160);
    const url = window.location.origin + window.location.pathname;
    document.title = title;
    ensureMeta("name", "description", description);
    ensureMeta("name", "robots", invalid ? "noindex,follow" : "index,follow");
    ensureMeta("property", "og:type", "profile");
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:url", url);
    ensureMeta("name", "twitter:card", images?.[0]?.url ? "summary_large_image" : "summary");
    ensureMeta("name", "twitter:title", title);
    ensureMeta("name", "twitter:description", description);
    if (images?.[0]?.url) {
      ensureMeta("property", "og:image", images[0].url);
      ensureMeta("name", "twitter:image", images[0].url);
    }
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = url;
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.id = "eezevent-vendor-jsonld";
    const address = {
      "@type": "PostalAddress",
      addressLocality: service?.service_city || business?.city || undefined,
      addressRegion: service?.service_state || business?.state || undefined,
      postalCode: service?.service_zip || business?.zip || undefined,
    };
    const data = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service?.name,
      description: service?.description,
      url,
      image: images?.map(item => item.url).filter(Boolean),
      serviceType: service?.type_name || service?.type,
      provider: {
        "@type": "Organization",
        name: business?.business_name || service?.name,
        address,
      },
      ...(reviewCount > 0 && Number(averageRating) > 0 ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: Number(averageRating),
          reviewCount: Number(reviewCount),
          bestRating: 5,
          worstRating: 1,
        },
      } : {}),
    };
    schema.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
    document.getElementById(schema.id)?.remove();
    if (service?.name && !invalid) document.head.appendChild(schema);
    return () => {
      document.title = oldTitle;
      schema.remove();
      canonical.remove();
      ["description", "robots", "twitter:card", "twitter:title", "twitter:description", "twitter:image"].forEach(name => document.head.querySelector(`meta[name="${name}"]`)?.remove());
      ["og:type", "og:title", "og:description", "og:url", "og:image"].forEach(name => document.head.querySelector(`meta[property="${name}"]`)?.remove());
    };
  }, [service, business, images, reviewCount, averageRating, invalid]);
  return null;
}
