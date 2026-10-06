// Runs `fn` with the local registry on :4400, starting it if it isn't already up.
import { spawn } from "node:child_process"
import path from "node:path"

const SERVE = path.join(path.dirname(new URL(import.meta.url).pathname), "../registry/scripts/serve.mjs")
const up = () => fetch("http://localhost:4400/r/cuts.json").then((r) => r.ok, () => false)

export async function withRegistry(fn) {
  if (await up()) return fn()
  const child = spawn(process.execPath, [SERVE], { stdio: "ignore" })
  for (let i = 0; i < 50 && !(await up()); i++) await new Promise((r) => setTimeout(r, 100))
  try {
    return await fn()
  } finally {
    child.kill()
  }
}
