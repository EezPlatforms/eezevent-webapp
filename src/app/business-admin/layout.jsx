import PageFrame from '../../components/PageFrame';
import BusinessOwnerGate from '../../components/BusinessOwnerGate';
export const metadata = { title: 'Business Admin', robots: { index: false, follow: false } };
export default function Layout({ children }) { return <PageFrame><BusinessOwnerGate>{children}</BusinessOwnerGate></PageFrame>; }
