import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// When served behind nginx (docker compose dev), the browser reaches Vite on
// nginx's port, so the HMR socket has to be told which port to dial back on.
const hmrClientPort = process.env.HMR_CLIENT_PORT;

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://[::1]:80",
        changeOrigin: true,
      },
    },
    hmr: hmrClientPort ? { clientPort: Number(hmrClientPort) } : undefined,
  },
  build: {
    // Vite inlines assets under 4 KB into whatever references them. For
    // flag-icons that means ~400 flags base64'd into the main stylesheet, which
    // every visitor would download. Kept as files, a browser fetches only the
    // flags actually on screen. Returning undefined keeps the default for
    // everything else.
    assetsInlineLimit: file => (file.includes("flag-icons") ? false : undefined),
  },
});
