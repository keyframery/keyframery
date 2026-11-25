import assert from "node:assert/strict"
import fs from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"
import ts from "typescript"

/* The table's core with UI SDK's real core, no DOM: a parent's options go in, the derived state comes out. */
const require = createRequire(import.meta.url)
const source = fs.readFileSync(new URL("../../src/components/core/data-table.ts", import.meta.url), "utf8")
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } })
const file = new URL("./.data-table-core.tmp.mjs", import.meta.url)
fs.writeFileSync(file, outputText.replace(/from "@ui-sdk\/core"/g, `from ${JSON.stringify(require.resolve("@ui-sdk/core").replace(/\\/g, "/"))}`))
const { dataTable } = await import(file.href)
fs.rmSync(file)

const rows = Array.from({ length: 30 }, (_, i) => ({ id: `r${i}`, amount: (i * 37) % 100 }))
const columns = [{ id: "amount", header: "Amount", accessor: (r) => r.amount }]
const options = (sort) => ({ id: "t", data: rows, columns, getRowId: (r) => r.id, sort, pageSize: 10 })

test("an equal sort passed as a new object on every render does not reorder the rows", () => {
  const table = dataTable(options({ id: "amount", direction: "descending" }))
  const epoch = table.get().epoch
  for (let i = 0; i < 5; i++) table.setOptions(options({ id: "amount", direction: "descending" }))
  assert.equal(table.get().epoch, epoch)
})

test("a different column or direction still reorders them", () => {
  const table = dataTable(options({ id: "amount", direction: "descending" }))
  const epoch = table.get().epoch
  table.setOptions(options({ id: "amount", direction: "ascending" }))
  assert.equal(table.get().epoch, epoch + 1)
  assert.equal(table.get().sort.direction, "ascending")
  table.setOptions(options(null))
  assert.equal(table.get().epoch, epoch + 2)
})
