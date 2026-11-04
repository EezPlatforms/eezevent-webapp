import PageFrame from "../../components/PageFrame";
import SearchVendorsPage from "../../views/SearchVendorsPage";
import { Suspense } from "react";
export const metadata={title:"Search Event Vendors"};
export default function Page(){return <PageFrame><Suspense fallback={null}><SearchVendorsPage/></Suspense></PageFrame>}
