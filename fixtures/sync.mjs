// Re-copies the shared fixture code, re-installs @keyframery/cuts from the local registry,
// and rebuilds the stock twins (same app, no Keyframery).
import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import { withRegistry } from "./registry-server.mjs"
import { SHADCN_CLI } from "./tested.mjs"

const HERE = path.dirname(new URL(import.meta.url).pathname)
const CLI = `shadcn@${SHADCN_CLI}`
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, npm_config_user_agent: "npm/11.8.0 node/v24" } })
const skip = (src) => !/[/\\](node_modules|\.next)([/\\]|$)/.test(src)

await withRegistry(async () => {
  for (const base of ["base", "radix"]) {
    const app = path.join(HERE, `next-${base}`)
    if (!fs.existsSync(path.join(app, "node_modules"))) sh("npm ci", app)
    for (const dir of ["shared/common", `shared/variants/${base}`, "shared/variants/cuts"]) fs.cpSync(path.join(HERE, dir), app, { recursive: true })
    const items = JSON.parse(fs.readFileSync(path.join(HERE, "../registry/registry.json"), "utf8")).items.map((i) => `@keyframery/${i.name}`)
    sh(`npx -y ${CLI} add ${items.join(" ")} -y -o`, app)

    const stock = path.join(HERE, `next-${base}-stock`)
    fs.mkdirSync(stock, { recursive: true })
    for (const entry of fs.readdirSync(stock)) if (entry !== "node_modules") fs.rmSync(path.join(stock, entry), { recursive: true, force: true })
    fs.cpSync(app, stock, { recursive: true, filter: skip })
    fs.rmSync(path.join(stock, "components/keyframery"), { recursive: true, force: true })
    fs.rmSync(path.join(stock, "lib/keyframery"), { recursive: true, force: true })
    // the stock twin must not ship anything only the Keyframery variant has (helper pages, demos)
    const cutsOnly = (dir, rel = "") =>
      fs.readdirSync(path.join(dir, rel), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? cutsOnly(dir, path.join(rel, e.name)) : [path.join(rel, e.name)]))
    for (const rel of cutsOnly(path.join(HERE, "shared/variants/cuts"))) fs.rmSync(path.join(stock, rel), { force: true })
    for (const dir of ["app/helpers", "app/match", "app/list-perf", "components/kf-fixture/demos"]) fs.rmSync(path.join(stock, dir), { recursive: true, force: true })
    fs.cpSync(path.join(HERE, "shared/variants/stock"), stock, { recursive: true })
    if (!fs.existsSync(path.join(stock, "node_modules"))) sh("npm ci", stock)
    console.log(`synced next-${base} and next-${base}-stock`)
  }
})
