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
});
