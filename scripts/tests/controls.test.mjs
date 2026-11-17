import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import ts from "typescript"

const { outputText } = ts.transpileModule(fs.readFileSync(new URL("../../src/lib/controls.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } })
const module = { exports: {} }
new Function("exports", outputText)(module.exports)
const { parseValues } = module.exports
const controls = {
  size: { type: "slider", min: 0, max: 30, step: 2, default: 10 },
  disabled: { type: "switch", default: false },
  variant: { type: "select", options: ["primary", "ghost"], default: "primary" },
  face: { type: "color", default: "" },
  title: { type: "text", default: "Book trip" },
}
test("URL values preserve defaults, constrain numeric values and ignore unknown controls", () => {
  assert.deepEqual(parseValues(controls, "size:200,variant:nope,unknown:x,face:%23e5484d,disabled:true"), { size: 30, disabled: true, variant: "primary", face: "#e5484d", title: "Book trip" })
})
test("malformed URL encoding never prevents the demo from rendering", () => {
  assert.equal(parseValues(controls, "title:%oops").title, "Book trip")
})
test("slider URL values snap to the declared step", () => {
  assert.equal(parseValues(controls, "size:13").size, 14)
})
