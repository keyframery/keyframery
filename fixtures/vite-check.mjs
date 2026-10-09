// Install check: a fresh shadcn Vite app (src/ layout) gets @keyframery/cuts, builds, and ships our CSS.
import { execSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { withRegistry } from "./registry-server.mjs"
import { SHADCN_CLI } from "./tested.mjs"

const CLI = `shadcn@${SHADCN_CLI}`
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, npm_config_user_agent: "npm/11.8.0 node/v24" } })
const APP = `import { Cuts } from "@/components/keyframery/cuts"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function App() {
  return (
    <main className="p-8">
      <Dialog>
        <DialogTrigger render={<Button />}>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Vite</DialogTitle>
          <DialogDescription>Install check.</DialogDescription>
        </DialogContent>
      </Dialog>
      <Cuts />
    </main>
  )
}
`

await withRegistry(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kf-vite-"))
  sh(`npx -y ${CLI} init -t vite -b base -p nova -n vite-check --no-monorepo -y`, tmp)
  const app = path.join(tmp, "vite-check")
  sh(`npx -y ${CLI} add dialog http://localhost:4400/r/cuts.json -y -o`, app)
  if (!fs.existsSync(path.join(app, "src/components/keyframery/cuts.tsx"))) throw new Error("cuts.tsx did not land in src/components/keyframery")
  fs.writeFileSync(path.join(app, "src/App.tsx"), APP)
  sh("npm run build", app)
  const assets = path.join(app, "dist/assets")
  const css = fs.readdirSync(assets).filter((f) => f.endsWith(".css")).map((f) => fs.readFileSync(path.join(assets, f), "utf8")).join("\n")
  for (const needle of ["kf-rack-in", "data-kf"]) if (!css.includes(needle)) throw new Error(`the Vite build is missing "${needle}"`)
  console.log("vite check ok")
})
