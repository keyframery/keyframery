#!/usr/bin/env node
/* Copies the generated files into each test app, the way a user installs them (copied into the
   project, as the shadcn CLIs do): frameworks/<fw>/... -> frameworks/test/<fw>/src/kf/. */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const fw = path.join(root, "frameworks")
export const testSlugs = ["tabs", "switch", "popover", "accordion", "checkbox", "select", "dialog", "segmented-control"]

/* Vue: every component in the install layout (src/components/keyframery/<slug>, .../core, src/lib),
   so the demos import "@/components/keyframery/<slug>" like a user's project. */
export function syncVue() {
  const app = path.join(fw, "test/vue/src")
  const dest = path.join(app, "components/keyframery")
  fs.rmSync(dest, { recursive: true, force: true })
  fs.rmSync(path.join(app, "kf"), { recursive: true, force: true })
  for (const s of fs.readdirSync(path.join(fw, "vue"))) {
    if (s === "_lib" || !fs.statSync(path.join(fw, "vue", s)).isDirectory()) continue
    fs.cpSync(path.join(fw, "vue", s), path.join(dest, s), { recursive: true })
  }
  fs.rmSync(path.join(app, "lib"), { recursive: true, force: true })
  fs.cpSync(path.join(fw, "vue/_lib"), path.join(app, "lib"), { recursive: true })
  /* The examples the bench converted from src/examples (frameworks/bench/examples/vue, read only), so
     #/<slug>/<example> here renders the same example as the React bench's #/<slug>/<example>. */
  const examples = path.join(fw, "bench/examples/vue")
  fs.rmSync(path.join(app, "examples"), { recursive: true, force: true })
  if (fs.existsSync(examples))
    for (const s of fs.readdirSync(examples)) if (fs.statSync(path.join(examples, s)).isDirectory()) fs.cpSync(path.join(examples, s), path.join(app, "examples", s), { recursive: true })
  /* frameworks/test/vue/fixes/<slug>/<example>.vue: corrected ports of examples the bench converted
     wrongly (toast: useState(() => createToaster()) became ref(() => createToaster())). */
  const fixes = path.join(fw, "test/vue/fixes")
  if (fs.existsSync(fixes)) fs.cpSync(fixes, path.join(app, "examples"), { recursive: true })
}

export function sync() {
  syncVue()
  for (const f of ["svelte"]) {
    const dest = path.join(fw, "test", f, "src/kf")
    fs.rmSync(dest, { recursive: true, force: true })
    for (const s of [...testSlugs, "lib"]) fs.cpSync(path.join(fw, f, s), path.join(dest, s), { recursive: true })
    fs.copyFileSync(path.join(fw, f, "keyframery.css"), path.join(dest, "keyframery.css"))
  }
  const sdest = path.join(fw, "test/solid/src/kf")
  fs.rmSync(sdest, { recursive: true, force: true })
  fs.mkdirSync(sdest, { recursive: true })
  for (const s of testSlugs) fs.copyFileSync(path.join(fw, "solid", s + ".tsx"), path.join(sdest, s + ".tsx"))
  fs.cpSync(path.join(fw, "solid/lib"), path.join(sdest, "lib"), { recursive: true })
  fs.copyFileSync(path.join(fw, "solid/keyframery.css"), path.join(sdest, "keyframery.css"))
  fs.mkdirSync(path.join(fw, "test/web/src"), { recursive: true })
  fs.copyFileSync(path.join(fw, "web/keyframery.css"), path.join(fw, "test/web/src/keyframery.css"))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  sync()
  console.log("synced generated files into frameworks/test/*/src")
}
