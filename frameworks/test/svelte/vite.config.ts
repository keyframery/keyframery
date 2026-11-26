import { svelte } from "@sveltejs/vite-plugin-svelte"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  server: { fs: { allow: [path.resolve(import.meta.dirname, "../../..")] } },
})
