import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxyTarget = process.env.VITE_API_PROXY_TARGET || "http://localhost:8000";

export default defineConfig({
  envPrefix: ["VITE_", "EXPO_PUBLIC_"],
  plugins: [react()],
  server: {
    proxy: {
      "/auth": {
        target: proxyTarget,
        changeOrigin: true,
      },
      "/business": {
        target: proxyTarget,
        changeOrigin: true,
      },
      "/clients": {
        target: proxyTarget,
        changeOrigin: true,
      },
      "/events": {
        target: proxyTarget,
        changeOrigin: true,
      },
      "/inquiries": {
        target: proxyTarget,
        changeOrigin: true,
      },
      "/outreach": {
        target: proxyTarget,
        changeOrigin: true,
      },
      "/notifications": {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
});
