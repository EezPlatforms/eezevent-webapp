import PageFrame from "../../components/PageFrame";
import VendorDashboardPage from "../../views/VendorDashboardPage";
export const metadata = { title: "Vendor dashboard", robots: { index: false, follow: false } };
export default function Page() { return <PageFrame contentSx={{ py: { xs: 3, md: 4 } }}><VendorDashboardPage /></PageFrame>; }
