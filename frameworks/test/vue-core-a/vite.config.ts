import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import path from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  publicDir: path.resolve(import.meta.dirname, "../../../public"),
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") }, dedupe: ["vue", "@ui-sdk/vue", "@ui-sdk/core", "tailwind-merge"] },
  server: { fs: { allow: [path.resolve(import.meta.dirname, "../../..")] } },
})
