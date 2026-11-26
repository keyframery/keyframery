import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import fs from "node:fs"
import path from "node:path"
import { defineConfig, type Plugin } from "vite"

/* The Vue bench. The examples import Keyframery the way a user's project does:
   "@/components/keyframery/<slug>" → frameworks/vue/<slug> (generated, or copied from frameworks/overrides/vue)
   "@/lib/<name>"                   → frameworks/vue/_lib/<name> (or frameworks/vue/lib while the generator still writes there) */
const repo = path.resolve(import.meta.dirname, "../../..")
const vueDir = path.join(repo, "frameworks/vue")
const here = import.meta.dirname
const exts = ["", ".ts", ".js", ".vue", "/index.ts", "/index.js"]

function keyframeryPaths(): Plugin {
  const tryFile = (base: string) => {
    for (const e of exts) {
      const f = base + e
      if (fs.existsSync(f) && fs.statSync(f).isFile()) return f
    }
    return null
  }
  return {
    name: "kf-bench-paths",
    enforce: "pre",
    async resolveId(id, importer, options) {
      /* Bare imports from the examples and from frameworks/vue resolve from this app's node_modules (one vue,
         one @ui-sdk/vue), as they would in a user's project. */
      if (importer && !importer.startsWith(here) && /^(@[a-z0-9-]+\/)?[a-z0-9][a-z0-9.-]*(\/.*)?$/i.test(id) && !id.startsWith("@/")) {
        return this.resolve(id, path.join(here, "src/main.ts"), { ...options, skipSelf: true })
      }
      if (id.startsWith("@/components/keyframery/")) return tryFile(path.join(vueDir, id.slice("@/components/keyframery/".length)))
      if (id.startsWith("@/lib/")) {
        const rest = id.slice("@/lib/".length)
        return tryFile(path.join(vueDir, "_lib", rest)) ?? tryFile(path.join(vueDir, "lib", rest))
      }
      return null
    },
  }
}

export default defineConfig({
  root: import.meta.dirname,
  plugins: [keyframeryPaths(), vue(), tailwindcss()],
  resolve: { dedupe: ["vue", "@ui-sdk/vue", "@ui-sdk/core", "tailwind-merge", "clsx"] },
  server: { port: 4715, strictPort: true, fs: { allow: [repo] } },
  /* The repo's postcss.config.mjs belongs to the Next.js site; Tailwind runs through the Vite plugin here. */
  css: { postcss: { plugins: [] } },
  clearScreen: false,
})
