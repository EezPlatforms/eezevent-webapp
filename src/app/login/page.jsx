import { safeReturnPath } from "../../lib/returnPath";
import PageFrame from "../../components/PageFrame";
import LoginPage from "../../views/LoginPage";
export const metadata={title:"Login",robots:{index:false,follow:false}};
export default async function Page({ searchParams }) {
  const query = await searchParams;
  const account = query?.account;
  return <PageFrame><LoginPage initialLoginType={account === "vendor" ? "vendor" : "client"} initialNextPath={safeReturnPath(query?.next)} /></PageFrame>;
}
