#!/usr/bin/env node
/* Compiles every Vue example in frameworks/bench/examples/vue with Vue's own SFC compiler (script setup + template,
   TypeScript expressions included) and lists the ones that fail. Fast; no browser.
   Usage: node scripts/frameworks/bench-check-examples.mjs [slug ...] */
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const require = createRequire(path.join(root, "frameworks/bench/vue/package.json"))
const { parse, compileScript } = require("vue/compiler-sfc")
const dir = path.join(root, "frameworks/bench/examples/vue")
const only = process.argv.slice(2)
let ok = 0
const bad = []
for (const slug of fs.readdirSync(dir).sort()) {
  if (!fs.statSync(path.join(dir, slug)).isDirectory() || (only.length && !only.includes(slug))) continue
  for (const f of fs.readdirSync(path.join(dir, slug)).filter((f) => f.endsWith(".vue")).sort()) {
    const file = path.join(dir, slug, f)
    const src = fs.readFileSync(file, "utf8")
    const { descriptor, errors } = parse(src, { filename: file })
    const errs = errors.map((e) => e.message)
    if (!errs.length) {
      try {
        compileScript(descriptor, { id: "x", inlineTemplate: true })
      } catch (e) {
        errs.push(e.message.split("\n")[0])
      }
    }
    if (/TODO/.test(src)) errs.push("has a TODO")
    if (errs.length) bad.push([`${slug}/${f}`, errs])
    else ok++
  }
}
console.log(`examples: ${ok} compile, ${bad.length} fail`)
for (const [id, e] of bad) console.log(`  ${id}: ${e.join(" | ").slice(0, 300)}`)
process.exitCode = bad.length ? 1 : 0
