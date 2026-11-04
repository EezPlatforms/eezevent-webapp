// Host-agnostic Node 20+ origin for crawler-ready vendor profile HTML.
// Build with npm run build; run with npm run start. Reverse proxy eezevent.com to this server.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const dist = resolve("dist");
const origin = "https://eezevent.com";
const api = (process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const port = Number(process.env.PORT || 3000);
const types = { ".js":"text/javascript", ".css":"text/css", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".ico":"image/x-icon", ".woff2":"font/woff2", ".txt":"text/plain", ".xml":"application/xml", ".json":"application/json", ".html":"text/html" };
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const absoluteImage = value => {
  try { const u = new URL(value, api || origin); return ["http:","https:"].includes(u.protocol) ? u.href : null; }
  catch { return null; }
};
const meta = (name, value, property = false) => '<meta ' + (property ? 'property' : 'name') + '="' + escapeHtml(name) + '" content="' + escapeHtml(value) + '">';
const json = value => JSON.stringify(value).replace(/</g,"\\u003c");
const respond = (res, status, body, type = "text/html; charset=utf-8", headers = {}) => {
  res.writeHead(status, {"Content-Type":type, "X-Content-Type-Options":"nosniff", ...headers}); res.end(body);
};
const template = await readFile(resolve(dist,"index.html"),"utf8");

async function fetchPublic(path) {
  if (!api) throw new Error("API_BASE_URL must be configured");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(api + path, {signal:controller.signal, headers:{"Accept":"application/json"}});
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Upstream " + response.status);
    return response.json();
  } finally { clearTimeout(timeout); }
}
function htmlPage({title,description,url,image,schema,robots="index,follow",body=""}) {
  const tags = [
    '<title>' + escapeHtml(title) + '</title>',
    meta("description",description), meta("robots",robots),
    '<link rel="canonical" href="' + escapeHtml(url) + '">',
    meta("og:type","website",true),meta("og:title",title,true),
    meta("og:description",description,true),meta("og:url",url,true),
    meta("twitter:card",image?"summary_large_image":"summary"),
    meta("twitter:title",title),meta("twitter:description",description),
    ...(image ? [meta("og:image",image,true),meta("twitter:image",image)] : []),
    ...(schema ? ['<script type="application/ld+json">' + json(schema) + '</script>'] : []),
  ].join("\n");
  // Remove generic tags to avoid duplicate conflicting metadata.
  let result = template.replace(/<title>[\s\S]*?<\/title>/i,"")
    .replace(/<meta\s+name="description"[\s\S]*?\/>/i,"")
    .replace(/<meta\s+property="og:(?:title|description|type)"[\s\S]*?\/>/gi,"");
  result = result.replace("</head>",tags + "\n</head>");
  return result.replace('<div id="root"></div>','<div id="root">' + body + '</div>');
}
async function vendorHtml(id) {
  const path = "/vendors/" + id;
  const url = origin + path;
  const profile = await fetchPublic("/business/public/service/" + id);
  if (!profile?.service) return {status:404,html:htmlPage({title:"Vendor not found | EezEvent",description:"This vendor profile is unavailable.",url,robots:"noindex,follow"})};
  const service = profile.service, business = profile.business || {};
  const city = service.service_city || business.city || "";
  const state = service.service_state || business.state || "";
  const type = service.type_name || service.type || "Event Services";
  const title = [service.name,city ? type + " in " + city : type,"EezEvent"].filter(Boolean).join(" | ").slice(0,160);
  const description = (service.description || "Discover " + service.name + " on EezEvent.") .replace(/\s+/g," ").slice(0,155);
  const [images,reviews] = await Promise.allSettled([
    fetchPublic("/business/service/" + id + "/images"),
    fetchPublic("/reviews/services/" + id + "?limit=5&offset=0"),
  ]);
  const photos = images.status === "fulfilled" && Array.isArray(images.value) ? images.value : [];
  const image = absoluteImage(photos[0]?.url);
  const review = reviews.status === "fulfilled" ? reviews.value : null;
  const rating = Number(review?.average_rating), count = Number(review?.review_count);
  const provider = {"@type":"Organization",name:business.business_name || service.name};
  const schema = {"@context":"https://schema.org","@type":"Service",name:service.name,description,url,serviceType:type,provider,
    ...(image?{image}:{}),
    ...(city || state ? {areaServed:{"@type":"Place",name:[city,state].filter(Boolean).join(", ")}}:{}),
    ...(Number.isFinite(rating) && rating > 0 && count > 0 ? {aggregateRating:{"@type":"AggregateRating",ratingValue:rating,reviewCount:count,bestRating:5,worstRating:1}}:{})
  };
  const body = '<main><h1>' + escapeHtml(service.name) + '</h1><p>' + escapeHtml([type,city,state].filter(Boolean).join(" · ")) + '</p><p>' + escapeHtml(service.description || "") + '</p>' +
    (image ? '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(service.name) + '" width="640" loading="eager">' : "") +
    (count > 0 ? '<p>' + escapeHtml(rating.toFixed(1) + " / 5 (" + count + " reviews)") + '</p>' : "") +
    '<section><h2>Customer reviews</h2>' +
    (Array.isArray(review?.reviews) ? review.reviews.map(r => '<article><h3>' + escapeHtml(r.author_name || "Customer") + '</h3><p>' + escapeHtml(r.rating) + ' / 5</p><p>' + escapeHtml(r.comment) + '</p>' + (r.vendor_response ? '<p>Vendor response: ' + escapeHtml(r.vendor_response) + '</p>' : '') + '</article>').join("") : "") +
    '</section></main>';
  return {status:200,html:htmlPage({title,description,url,image,schema,body})};
}
const server = createServer(async (req,res) => {
  if (req.method !== "GET" && req.method !== "HEAD") return respond(res,405,"Method not allowed","text/plain");
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url,"http://localhost").pathname); }
  catch { return respond(res,400,"Bad request","text/plain"); }
  if (pathname === "/robots.txt") return respond(res,200,"User-agent: *\nAllow: /vendors/\nSitemap: " + origin + "/sitemap.xml\n","text/plain");
  if (pathname === "/sitemap.xml") {
    // Explicit inventory only; never claim complete discovery without a public listing API.
    const ids = (process.env.PUBLIC_VENDOR_SERVICE_IDS || "").split(",").map(x=>x.trim()).filter(x=>/^\d+$/.test(x));
    const entries = [...new Set(ids)].map(id=>"<url><loc>"+origin+"/vendors/"+id+"</loc></url>").join("");
    return respond(res,200,'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+entries+"</urlset>","application/xml");
  }
  const match = /^\/vendors\/([1-9]\d*)\/?$/.exec(pathname);
  if (match) {
    try { const page = await vendorHtml(match[1]); return respond(res,page.status,page.html,"text/html; charset=utf-8",{"Cache-Control":"public, max-age=60, s-maxage=300"}); }
    catch (e) { console.error("Vendor SEO render failed:",e.message); return respond(res,503,"Vendor profile temporarily unavailable","text/plain",{"Retry-After":"60","X-Robots-Tag":"noindex"}); }
  }
  if (pathname.startsWith("/vendors/")) return respond(res,404,"Vendor not found","text/plain",{"X-Robots-Tag":"noindex"});
  const file = resolve(dist,"." + pathname);
  if (file !== dist && !file.startsWith(dist + sep)) return respond(res,403,"Forbidden","text/plain");
  try {
    if (pathname !== "/" && extname(file)) {
      const s = await stat(file);
      if (!s.isFile()) throw new Error("Not a file");
      const bytes = await readFile(file);
      return respond(res,200,bytes,types[extname(file)] || "application/octet-stream",{"Cache-Control":pathname.startsWith("/assets/")?"public, max-age=31536000, immutable":"public, max-age=300"});
    }
  } catch { return respond(res,404,"Not found","text/plain"); }
  return respond(res,200,template,"text/html; charset=utf-8",{"Cache-Control":"no-cache"});
});
server.listen(port,()=>console.log("EezEvent web server listening on "+port));
