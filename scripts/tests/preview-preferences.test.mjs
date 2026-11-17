import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import ts from "typescript"

const compile = (path, dependencies = {}) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } })
  const exports = {}
  new Function("exports", "require", outputText)(exports, (name) => dependencies[name])
  return exports
}
const controlsModule = compile("../../src/lib/controls.ts")
const { previewPreferencesKey, readPreviewPreferences, writePreviewPreferences } = compile("../../site/lib/preview-preferences.ts", { "@/lib/controls": controlsModule })
const controls = {
  title: { type: "text", default: "Keyboard shortcuts" },
  held: { type: "switch", default: false },
  size: { type: "slider", min: 10, max: 40, step: 2, default: 24 },
  variant: { type: "select", options: ["primary", "ghost"], default: "primary" },
  face: { type: "color", default: "" },
}

test("custom settings and speed round-trip without losing text punctuation", () => {
  const values = { title: 'Trip "A", cost: £40\n<example>', held: true, size: 30, variant: "ghost", face: "#22c55e" }
  const saved = writePreviewPreferences(values, controls, 0.4)
  assert.deepEqual(readPreviewPreferences(saved, controls), { values, speed: 0.4 })
  assert.notEqual(previewPreferencesKey("kbd"), previewPreferencesKey("tabs"))
})

test("obsolete or corrupt values do not replace current component defaults", () => {
  const saved = JSON.stringify({ values: { title: 10, held: "true", size: 99, variant: "removed-option", face: "url(unknown)", absent: "value" }, speed: "fast" })
  assert.deepEqual(readPreviewPreferences(saved, controls), { values: { size: 40 }, speed: 1 })
  assert.equal(readPreviewPreferences(JSON.stringify({ values: { size: 31 } }), controls).values.size, 32)
  for (const text of [null, "broken json", "null", "42", "[]"]) assert.deepEqual(readPreviewPreferences(text, controls), { values: {}, speed: 1 })
})

test("saved speed stays inside the actual customization range", () => {
  assert.equal(readPreviewPreferences('{"speed":100}', controls).speed, 2)
  assert.equal(readPreviewPreferences('{"speed":-1}', controls).speed, 0.4)
  assert.equal(readPreviewPreferences('{"speed":1e400}', controls).speed, 1)
})

test("reset and values equal to defaults remove saved overrides", () => {
  assert.equal(writePreviewPreferences({}, controls, 1), null)
  assert.equal(writePreviewPreferences({ title: "Keyboard shortcuts", held: false, size: 24, unknown: "old" }, controls, 1), null)
  assert.deepEqual(readPreviewPreferences('{"values":{"title":"Saved"}}', undefined), { values: {}, speed: 1 })
})
