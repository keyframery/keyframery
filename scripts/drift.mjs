// Has shadcn changed anything Keyframery isn't tested against? `pnpm drift` checks:
//   1. each fixture app's shadcn files against what the live registry gives today, through the pinned CLI and, when
//      a newer CLI is out, through that one too (the CLI's own --dry-run, so its transforms apply);
//   2. the registry's component list against apps/web/lib/coverage.json;
//   3. the packages whose DOM Keyframery reads against their newest release on npm.
// Exit 0: nothing untested. 1: something to re-test (docs/deploy.md, "shadcn drift"). 2: the check itself failed.
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import { FIXTURES, SHADCN_CLI, tested } from "../fixtures/tested.mjs"

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
/** Packages that render the DOM Keyframery reads: a new release can rename an attribute or reshape a part. */
const MARKUP = ["@base-ui/react", "radix-ui", "sonner", "vaul", "cmdk"]

/** Reads `shadcn add --dry-run` output: each file it would write, and how it compares with the local copy. */
export function parseDryRun(output) {
  const lines = output.replace(/\x1b\[[0-9;]*m/g, "").split("\n")
  const head = lines.findIndex((l) => /^├ Files \(\d+\)/.test(l))
  if (head < 0) throw new Error("the CLI's --dry-run output has no file list")
  const count = Number(/\((\d+)\)/.exec(lines[head])[1])
  const files = []
  for (const line of lines.slice(head + 1)) {
    if (/^[├└]/.test(line)) break
    const m = /^│ ([=~+]) (\S+)/.exec(line)
    if (m) files.push({ path: m[2], status: { "=": "same", "~": "changed", "+": "new" }[m[1]] })
  }
  if (files.length !== count) throw new Error(`the CLI listed ${count} files, but ${files.length} could be read`)
  return files
}

async function json(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  return res.json()
}

const latest = async (name) => (await json(`https://registry.npmjs.org/${name.replace("/", "%2F")}/latest`)).version

function dryRun(cli, dir, names) {
  const run = spawnSync("npx", ["-y", `shadcn@${cli}`, "add", ...names, "--dry-run"], {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, npm_config_user_agent: "npm/11.8.0 node/v24" },
  })
  if (run.status !== 0) throw new Error(`shadcn@${cli} add --dry-run failed in ${path.basename(dir)}:\n${run.stderr || run.stdout}`)
  return parseDryRun(`${run.stdout}\n${run.stderr}`).filter((f) => f.status !== "same")
}

async function main() {
  const t = tested()
  const problems = []
  const ok = (line) => console.log(`  ✓ ${line}`)
  const flag = (line) => {
    problems.push(line)
    console.log(`  ✗ ${line}`)
  }
  const files = (list) => list.map((f) => `${f.path} (${f.status})`).join(", ")
  console.log(`shadcn drift check: the fixtures are tested with shadcn CLI ${SHADCN_CLI}`)

  const newestCli = await latest("shadcn")
  const covered = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, "apps/web/lib/coverage.json"), "utf8")).components.map((c) => c.slug))
  const inRegistry = new Set()
  for (const { style, dir } of FIXTURES) {
    const names = (await json(`https://ui.shadcn.com/r/styles/${style}/registry.json`)).items.filter((i) => i.type === "registry:ui").map((i) => i.name)
    names.forEach((n) => inRegistry.add(n))
    const changed = dryRun(SHADCN_CLI, dir, names)
    if (changed.length) flag(`${style}: ${changed.length} file(s) differ from the live registry: ${files(changed)}`)
    else ok(`${style}: all ${names.length} components match the live registry`)
    if (newestCli !== SHADCN_CLI) {
      const withNewest = dryRun(newestCli, dir, names)
      if (withNewest.length) flag(`${style}: shadcn CLI ${newestCli} writes ${withNewest.length} file(s) differently: ${files(withNewest)}`)
      else ok(`${style}: shadcn CLI ${newestCli} writes the same files`)
    }
  }
  if (newestCli === SHADCN_CLI) ok(`shadcn CLI ${SHADCN_CLI} is the newest`)
  else console.log(`  ℹ shadcn CLI ${newestCli} is out. Its files match, so it's safe to pin it in fixtures/tested.json and re-run pnpm check.`)

  const uncovered = [...inRegistry].filter((n) => !covered.has(n))
  const gone = [...covered].filter((n) => !inRegistry.has(n))
  if (uncovered.length) flag(`components in shadcn's registry that coverage.json doesn't list: ${uncovered.join(", ")}`)
  if (gone.length) flag(`coverage.json lists components shadcn's registry no longer has: ${gone.join(", ")}`)
  if (!uncovered.length && !gone.length) ok(`shadcn's ${inRegistry.size} components are all in coverage.json`)

  for (const p of t.packages) {
    const newest = await latest(p.name)
    if (newest === p.version) continue
    if (MARKUP.includes(p.name)) flag(`npm has ${p.name} ${newest}; the fixtures run ${p.version}`)
    else console.log(`  ℹ npm has ${p.name} ${newest}; the fixtures run ${p.version} (it doesn't render the parts Keyframery reads)`)
  }
  if (!problems.some((p) => p.startsWith("npm has"))) ok(`the fixtures run npm's newest ${MARKUP.join(", ")}`)

  if (problems.length) {
    console.log(`\n${problems.length} change(s) the fixtures don't cover yet. To re-test, see docs/deploy.md, "shadcn drift".`)
    process.exitCode = 1
  } else console.log("\nNothing in shadcn that the fixtures don't cover.")
}

if (process.argv[1] === new URL(import.meta.url).pathname)
  main().catch((err) => {
    console.error(`shadcn drift check failed to run: ${err.message}`)
    process.exitCode = 2
  })
