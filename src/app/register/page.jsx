import { safeReturnPath } from "../../lib/returnPath";
import PageFrame from "../../components/PageFrame";
import RegistrationPage from "../../views/RegistrationPage";
export const metadata = { title: "Create an account", robots: { index: false, follow: false } };
export default async function Page({ searchParams }) {
  return <PageFrame><RegistrationPage nextPath={safeReturnPath((await searchParams)?.next)} /></PageFrame>;
}
