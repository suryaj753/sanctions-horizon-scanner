import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// React 19 + Vite + Tailwind v4, same toolchain as Sentinel. Own dev port so
// it can run alongside the Compliance Engine (5173) and Sentinel (5174).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5175 },
});
