import Providers from "./providers";
import "../styles.css";
export const metadata = {metadataBase:new URL("https://eezevent.com"),title:{default:"EezEvent",template:"%s | EezEvent"},description:"Discover event vendors and manage your event business with EezEvent."};
export default function RootLayout({children}) {return <html lang="en"><body><Providers>{children}</Providers></body></html>;}
