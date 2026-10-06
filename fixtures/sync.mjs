// Re-copies the shared fixture code, re-installs @keyframery/cuts from the local registry,
// and rebuilds the stock twins (same app, no Keyframery).
import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import { withRegistry } from "./registry-server.mjs"

const HERE = path.dirname(new URL(import.meta.url).pathname)
const CLI = "shadcn@4.21.3"
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, npm_config_user_agent: "npm/11.8.0 node/v24" } })
const skip = (src) => !/[/\\](node_modules|\.next)([/\\]|$)/.test(src)

await withRegistry(async () => {
  for (const base of ["base", "radix"]) {
    const app = path.join(HERE, `next-${base}`)
    if (!fs.existsSync(path.join(app, "node_modules"))) sh("npm ci", app)
    for (const dir of ["shared/common", `shared/variants/${base}`, "shared/variants/cuts"]) fs.cpSync(path.join(HERE, dir), app, { recursive: true })
    sh(`npx -y ${CLI} add @keyframery/cuts -y -o`, app)

    const stock = path.join(HERE, `next-${base}-stock`)
    fs.mkdirSync(stock, { recursive: true })
    for (const entry of fs.readdirSync(stock)) if (entry !== "node_modules") fs.rmSync(path.join(stock, entry), { recursive: true, force: true })
    fs.cpSync(app, stock, { recursive: true, filter: skip })
    fs.rmSync(path.join(stock, "components/keyframery"), { recursive: true, force: true })
    fs.rmSync(path.join(stock, "lib/keyframery"), { recursive: true, force: true })
    fs.cpSync(path.join(HERE, "shared/variants/stock"), stock, { recursive: true })
    if (!fs.existsSync(path.join(stock, "node_modules"))) sh("npm ci", stock)
    console.log(`synced next-${base} and next-${base}-stock`)
  }
})
