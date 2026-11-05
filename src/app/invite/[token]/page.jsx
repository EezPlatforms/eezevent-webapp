import InvitationPage from '../../../views/InvitationPage';
export const metadata = { title: 'Event invitation', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default async function Page({ params }) { const { token } = await params; return <InvitationPage token={token} />; }
