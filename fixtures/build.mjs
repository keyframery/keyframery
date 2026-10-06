// Production-builds the fixtures. --cuts-only skips the stock twins (they don't change when the registry does).
import { execSync } from "node:child_process"
import path from "node:path"

const HERE = path.dirname(new URL(import.meta.url).pathname)
const apps = process.argv.includes("--cuts-only") ? ["next-base", "next-radix"] : ["next-base", "next-radix", "next-base-stock", "next-radix-stock"]
for (const app of apps) execSync("npm run build", { cwd: path.join(HERE, app), stdio: "inherit" })
