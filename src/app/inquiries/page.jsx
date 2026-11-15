import PageFrame from "../../components/PageFrame";
import VendorInquiriesPage from "../../views/VendorInquiriesPage";
export const metadata = { title: "Vendor inquiries", robots: { index: false, follow: false } };
export default function Page() { return <PageFrame contentSx={{ py: { xs: 3, md: 4 } }}><VendorInquiriesPage /></PageFrame>; }
