#!/usr/bin/env node
/* Builds every generated component (all 55, not only the eight the parity test renders) in each
   framework's test app with Vite, so a template or syntax error in any wrapper shows up.
   It copies frameworks/<fw>/* into frameworks/test/<fw>/.all/, writes an entry that imports every
   component's index, and runs a production build into a throwaway folder. Nothing is rendered. */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

import { syncVue } from "./sync-test.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const fwDir = path.join(root, "frameworks")
const slugs = fs.readdirSync(path.join(fwDir, "classes")).filter((f) => f.endsWith(".json") && !f.startsWith("_")).map((f) => f.slice(0, -5))
const only = process.argv.slice(2)
const results = {}

for (const fw of only.length ? only : ["vue", "svelte", "solid"]) {
  const app = path.join(fwDir, "test", fw)
  const all = path.join(app, ".all")
  fs.rmSync(all, { recursive: true, force: true })
  fs.mkdirSync(all, { recursive: true })
  let vueSlugs = null
  if (fw === "vue") {
    /* Vue: every component in frameworks/vue (generated and overrides), in the install layout the test
       app uses (src/components/keyframery/<slug>, src/lib), imported the way a user's project does. */
    syncVue()
    vueSlugs = fs.readdirSync(path.join(fwDir, "vue")).filter((s) => s !== "_lib" && s !== "core" && fs.existsSync(path.join(fwDir, "vue", s, "index.ts")))
  } else if (fw === "solid") {
    for (const s of slugs) fs.copyFileSync(path.join(fwDir, "solid", s + ".tsx"), path.join(all, s + ".tsx"))
    fs.cpSync(path.join(fwDir, "solid/lib"), path.join(all, "lib"), { recursive: true })
  } else {
    for (const s of [...slugs, "lib"]) fs.cpSync(path.join(fwDir, fw, s), path.join(all, s), { recursive: true })
  }
  const ext = fw === "solid" ? "tsx" : "ts"
  const entry = path.join(all, `entry.${ext}`)
  const list = vueSlugs ?? slugs
  const spec = (s) => (fw === "vue" ? `@/components/keyframery/${s}` : `./${s}${fw === "solid" ? "" : "/index"}`)
  fs.writeFileSync(entry, list.map((s, i) => `import * as c${i} from "${spec(s)}"`).join("\n") + `\nexport default [${list.map((_, i) => `c${i}`).join(", ")}]\n`)
  const require = createRequire(path.join(app, "package.json"))
  const { build } = await import(pathToFileURL(require.resolve("vite")).href)
  const t0 = Date.now()
  try {
    const warnings = []
    await build({
      root: app,
      configFile: path.join(app, "vite.config.ts"),
      logLevel: "silent",
      build: { outDir: path.join(all, "dist"), emptyOutDir: true, lib: { entry, formats: ["es"], fileName: "all" }, rollupOptions: { external: [/^@ui-sdk\//, /^@lucide\//, /^vue$/, /^svelte/, /^solid-js/, /^@solidjs\//, "tailwind-merge"], onwarn: (w) => warnings.push(w.message) } },
    })
    results[fw] = { ok: true, components: list.length, warnings: warnings.slice(0, 20), seconds: (Date.now() - t0) / 1000 }
  } catch (e) {
    results[fw] = { ok: false, error: String(e.message ?? e).slice(0, 2000) }
  }
  if (results[fw].ok) results[fw].bundleKB = Math.round(fs.statSync(path.join(all, "dist", "all.js")).size / 1024)
  if (!process.env.KEEP) fs.rmSync(all, { recursive: true, force: true })
  console.log(fw, JSON.stringify(results[fw], null, 2))
}
