import { safeReturnPath } from "../../../lib/returnPath";
import PageFrame from "../../../components/PageFrame";
import CreateEventPage from "../../../views/CreateEventPage";
export const metadata={title:"Create Event",robots:{index:false,follow:false}};
export default async function Page({ searchParams }) {
  return <PageFrame><CreateEventPage returnTo={safeReturnPath((await searchParams)?.returnTo, "")} /></PageFrame>;
}
