// Install check: a shadcn monorepo (init --monorepo) gets @keyframery/cuts in its app and still builds.
import { execSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { withRegistry } from "./registry-server.mjs"

const CLI = `shadcn@${process.env.SHADCN_VERSION ?? "4.21.3"}`
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: "inherit" })

function find(dir, name) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const hit = find(p, name)
      if (hit) return hit
    } else if (entry.name === name) return p
  }
  return null
}

await withRegistry(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kf-mono-"))
  sh(`npx -y ${CLI} init -t next -b base -p nova -n mono --monorepo -y`, tmp)
  const root = path.join(tmp, "mono")
  const web = path.join(root, "apps/web")
  sh(`npx -y ${CLI} add http://localhost:4400/r/cuts.json -y -o -c ${web}`, root)
  const cuts = find(root, "cuts.tsx")
  if (!cuts) throw new Error("cuts.tsx was not installed anywhere in the monorepo")
  const layout = path.join(web, "app/layout.tsx")
  let s = fs.readFileSync(layout, "utf8")
  s = `import { Cuts } from "@/components/keyframery/cuts"\n${s}`.replace("</body>", "<Cuts /></body>")
  fs.writeFileSync(layout, s)
  sh(fs.existsSync(path.join(root, "pnpm-lock.yaml")) ? "pnpm build" : "npm run build", root)
  console.log(`monorepo check ok (cuts.tsx at ${path.relative(root, cuts)})`)
})
