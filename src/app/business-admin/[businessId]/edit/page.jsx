import BusinessEditorPage from '../../../../views/BusinessEditorPage';
export default async function Page({ params }) {
  const { businessId } = await params;
  return <BusinessEditorPage businessId={businessId} editing />;
}
