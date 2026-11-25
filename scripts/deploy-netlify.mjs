// Deploys keyframery.com's Netlify copy from this machine: node scripts/deploy-netlify.mjs [--prod] "message"
//
// Netlify's CLI does not pass the site's settings into a local build, and Netlify's edge functions (where
// proxy.ts runs there) get no settings at run time, so next.config.ts writes DATABASE_URL into the server code
// on Netlify builds. This loads .env.netlify (git-ignored, the same values as Netlify's settings) for the build.
import fs from "node:fs"
import { spawnSync } from "node:child_process"

const env = { ...process.env, NETLIFY: "true" }
for (const line of fs.readFileSync(".env.netlify", "utf8").split("\n").filter(Boolean)) {
  const i = line.indexOf("=")
  env[line.slice(0, i)] = line.slice(i + 1)
}
const args = process.argv.slice(2)
const prod = args.includes("--prod")
const message = args.filter((a) => a !== "--prod").join(" ") || "keyframery.com"
const cli = ["-y", "netlify-cli@27.20.1", "deploy", ...(prod ? ["--prod"] : ["--context", "deploy-preview"]), "--message", message]
process.exit(spawnSync("npx", cli, { env, stdio: "inherit" }).status ?? 1)
