import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import path from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: { dedupe: ["vue", "@ui-sdk/vue", "@ui-sdk/core", "tailwind-merge"], alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: { fs: { allow: [path.resolve(import.meta.dirname, "../../..")] } },
})
