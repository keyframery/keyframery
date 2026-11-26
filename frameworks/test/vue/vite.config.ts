import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import path from "node:path"
import { defineConfig } from "vite"

/* The generated components are copied in the install layout (scripts/frameworks/sync-test.mjs):
   src/components/keyframery/<slug>, src/components/keyframery/core, src/lib. "@" is src, as in a
   shadcn-vue project. Port: 4711 for the Vue builder's checks (pnpm dev). */
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: { fs: { allow: [path.resolve(import.meta.dirname, "../../..")] } },
})
