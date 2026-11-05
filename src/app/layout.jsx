import { cookies } from "next/headers";
import Providers from "./providers";
import "../styles.css";
export const metadata = {metadataBase:new URL("https://eezevent.com"),title:{default:"EezEvent",template:"%s | EezEvent"},description:"Discover event vendors and manage your event business with EezEvent."};
export default async function RootLayout({ children }) {
  const savedMode = (await cookies()).get("eezevent-color-mode")?.value;
  const initialMode = savedMode === "dark" ? "dark" : "light";
  return <html lang="en"><body><Providers initialMode={initialMode}>{children}</Providers></body></html>;
}
