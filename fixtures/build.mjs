// Production-builds the fixtures. --cuts-only skips the stock twins.
// Afterwards it stops any `next start` still serving the old build on the fixture ports: a running
// server keeps the old manifest in memory, so pages would load chunks that no longer exist.
import { execSync } from "node:child_process"
import path from "node:path"

const HERE = path.dirname(new URL(import.meta.url).pathname)
const APPS = { "next-base": 4401, "next-radix": 4402, "next-base-stock": 4403, "next-radix-stock": 4404 }
const apps = process.argv.includes("--cuts-only") ? ["next-base", "next-radix"] : Object.keys(APPS)
for (const app of apps) {
  execSync("npm run build", { cwd: path.join(HERE, app), stdio: "inherit" })
  try {
    execSync(`lsof -ti tcp:${APPS[app]} -sTCP:LISTEN | xargs kill`, { stdio: "ignore", shell: "/bin/sh" })
  } catch {
    // nothing was listening
  }
}
