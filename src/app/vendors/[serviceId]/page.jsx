import { notFound } from "next/navigation";
import PageFrame from "../../../components/PageFrame";
import VendorProfilePage from "../../../pages/VendorProfilePage";
const base = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
const publicProfile = async id => {
  if (!/^\d+$/.test(id) || !base) return null;
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
  const url="https://eezevent.com/vendors/"+serviceId;
  const summary=description(service.description);
  return {title,description:summary,alternates:{canonical:url},openGraph:{title,description:summary,url,type:"website"},twitter:{card:"summary",title,description:summary}};
}
export default async function Page({params}){
  const {serviceId}=await params;
  const profile=await publicProfile(serviceId);
  if(!profile?.service)notFound();
  const s=profile.service,b=profile.business||{};
  const schema={"@context":"https://schema.org","@type":"Service",name:s.name,description:s.description,url:"https://eezevent.com/vendors/"+serviceId,serviceType:s.type_name||s.type,provider:{"@type":"Organization",name:b.business_name||s.name}};
  return <PageFrame><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/><VendorProfilePage initialProfile={profile} serviceId={serviceId}/></PageFrame>;
}
