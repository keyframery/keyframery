import solid from "@solidjs/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  optimizeDeps: { exclude: ["@ui-sdk/core"] },
  server: { fs: { allow: [path.resolve(import.meta.dirname, "../../..")] } },
})
