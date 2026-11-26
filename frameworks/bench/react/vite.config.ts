import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig } from "vite"

/* The React reference bench. Everything resolves from the repo: "@" is src/, so each example imports the real
   Keyframery components, and bare imports (react, @ui-sdk/react, lucide-react) come from the root node_modules. */
const repo = path.resolve(import.meta.dirname, "../../..")

export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.join(repo, "src") }, dedupe: ["react", "react-dom"] },
  server: { port: 4716, strictPort: true, fs: { allow: [repo] } },
  /* The repo's postcss.config.mjs belongs to the Next.js site; Tailwind runs through the Vite plugin here. */
  css: { postcss: { plugins: [] } },
  clearScreen: false,
})
