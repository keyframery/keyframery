import react from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig } from "vite"

// Tailwind runs through postcss.config.mjs, which the Next.js site shares.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
})
