import { vendorProfilePath, validServiceReference } from "../../../lib/vendorProfilePath";
import { safeVendorSearchUrl } from "../../../lib/vendorSearchState";
import { notFound, permanentRedirect } from "next/navigation";
import PageFrame from "../../../components/PageFrame";
import VendorProfilePage from "../../../views/VendorProfilePage";
const base = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "")).trim().replace(/\/+$/, "").replace(/\/api$/, "");
const publicProfile = async id => {
  if (!validServiceReference(id) || !base) return null;
  try {const response=await fetch(base+"/business/public/service/"+encodeURIComponent(id),{next:{revalidate:300}});if(!response.ok)return null;return await response.json();}catch{return null;}
};
const description = value => String(value||"Discover event vendors on EezEvent.").replace(/\s+/g," ").slice(0,155);
export async function generateMetadata({params}){
  const {serviceId}=await params;
  const profile=await publicProfile(serviceId);
  if(!profile?.service)return {title:"Vendor not found",robots:{index:false}};
  const service=profile.service,business=profile.business||{};
  const city=service.service_city||business.city;
  const title=[service.name,service.type_name||service.type,city].filter(Boolean).join(" | ");
  const url="https://eezevent.com"+vendorProfilePath(service);
  const summary=description(service.description);
  return {title,description:summary,alternates:{canonical:url},openGraph:{title,description:summary,url,type:"website"},twitter:{card:"summary",title,description:summary}};
}
export default async function Page({params, searchParams}){
  const query = await searchParams;
  const returnTo = safeVendorSearchUrl(query?.returnTo);
  const {serviceId}=await params;
  const profile=await publicProfile(serviceId);
  if(!profile?.service)notFound();
  const s=profile.service,b=profile.business||{};
  if (s.slug && serviceId !== s.slug) {
    const preserved = new URLSearchParams();
    for (const [key, value] of Object.entries(query || {})) {
      for (const entry of Array.isArray(value) ? value : value == null ? [] : [value]) preserved.append(key, entry);
    }
    permanentRedirect(vendorProfilePath(s) + (preserved.size ? `?${preserved}` : ""));
  }
  const schema={"@context":"https://schema.org","@type":"Service",name:s.name,description:s.description,url:"https://eezevent.com"+vendorProfilePath(s),serviceType:s.type_name||s.type,provider:{"@type":"Organization",name:b.business_name||s.name}};
  return <PageFrame contentSx={{ pt: { xs: 2, md: 3 } }}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/><VendorProfilePage initialProfile={profile} serviceId={String(s.service_id)} returnTo={returnTo} initialInquiry={query?.inquiry === "1"} initialInquiryEvent={/^\d+$/.test(query?.inquiryEvent || "") ? query.inquiryEvent : ""}/></PageFrame>;
}
