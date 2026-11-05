import { resolveAuthMode } from "./src/lib/authMode.js";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

export default function nextConfig(phase) {
  return {
    output: "standalone",
    env: {
      NEXT_PUBLIC_AUTH_MODE: resolveAuthMode(process.env.NEXT_PUBLIC_AUTH_MODE,
        phase === PHASE_DEVELOPMENT_SERVER ? "development" : "production"),
    },
    reactStrictMode: true,
    async redirects() {
      return [{
        source: "/help/:path*",
        destination: "https://www.eezevent.com/help.html",
        permanent: true,
      }];
    },
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  };
}
