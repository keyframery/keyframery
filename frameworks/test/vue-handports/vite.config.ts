import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import path from "node:path"
import fs from "node:fs"
import { defineConfig, type Plugin } from "vite"

/* "@/components/keyframery/<slug>": the hand-written override when there is one, else the generated folder
   (what the generator does when it copies overrides into frameworks/vue). */
const keyframery = (): Plugin => ({
  name: "kf-components",
  enforce: "pre",
  async resolveId(id, importer) {
    const m = id.match(/^@\/components\/keyframery\/(.+)$/)
    if (!m) return null
    const override = path.resolve(import.meta.dirname, "../../overrides/vue", m[1])
    const target = fs.existsSync(override) ? override : path.resolve(import.meta.dirname, "../../vue", m[1])
    return this.resolve(fs.statSync(target, { throwIfNoEntry: false })?.isDirectory() ? `${target}/index.ts` : target, importer, { skipSelf: true })
  },
})

export default defineConfig({
  plugins: [keyframery(), vue(), tailwindcss()],
  resolve: {
    /* The override folders sit outside this app: resolve their packages from here. */
    dedupe: ["vue", "@ui-sdk/vue", "@ui-sdk/core", "tailwind-merge"],
    alias: {
      "@/lib": path.resolve(import.meta.dirname, "../../vue/_lib"),
      "@kf": path.resolve(import.meta.dirname, "../../overrides/vue"),
    },
  },
  server: { fs: { allow: [path.resolve(import.meta.dirname, "../../..")] } },
})
