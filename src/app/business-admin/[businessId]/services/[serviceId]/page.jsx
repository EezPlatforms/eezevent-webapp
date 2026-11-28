import ServiceEditorPage from '../../../../../views/ServiceEditorPage';
export default async function Page({ params }) { const { businessId, serviceId } = await params; return <ServiceEditorPage businessId={businessId} serviceId={serviceId} />; }
