import path from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  server: { fs: { allow: [path.resolve(import.meta.dirname, "../../..")] } },
})
