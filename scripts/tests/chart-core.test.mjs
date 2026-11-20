import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import ts from "typescript"

/* The chart's geometry is plain functions, so it runs here with UI SDK's core stubbed out. */
const source = fs.readFileSync(new URL("../../src/components/core/chart.ts", import.meta.url), "utf8")
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } })
const core = {}
const stub = new Proxy(function () {}, { get: () => stub, apply: () => stub })
new Function("exports", "require", outputText)(core, (name) => {
  if (name !== "@ui-sdk/core") throw new Error(`unexpected import ${name}`)
  return stub
})

const inputs = (over) => ({
  data: [], config: {}, categoryKey: "name", type: "donut", stacked: false, orientation: "vertical", curve: "smooth",
  categoryGap: 0.3, innerRadius: 0.6, padAngle: 1.5, dots: false, formatValue: String, formatTick: String, formatCategory: String,
  hiddenSeries: [], width: 320, height: 180, ...over,
})

const devices = [
  { device: "mobile", sessions: 60 },
  { device: "desktop", sessions: 30 },
  { device: "tablet", sessions: 10 },
]

test("a donut finds its value column when the config only labels the slices", () => {
  const layout = core.chartLayout(inputs({ data: devices, categoryKey: "device", config: { mobile: { label: "Phone" }, desktop: { label: "Desktop" }, tablet: { label: "Tablet" } } }))
  assert.equal(layout.total, 100)
  assert.equal(layout.series[0].key, "sessions")
  assert.equal(layout.sliceKeys.length, 3)
})

test("a donut still takes the value column the config names", () => {
  const data = devices.map((row) => ({ ...row, orders: row.sessions / 10 }))
  const layout = core.chartLayout(inputs({ data, categoryKey: "device", config: { orders: { label: "Orders" }, mobile: { label: "Phone" } } }))
  assert.equal(layout.series[0].key, "orders")
  assert.equal(layout.series[0].label, "Orders")
  assert.equal(layout.total, 10)
})

test("a donut with no numbers stays empty instead of throwing", () => {
  const layout = core.chartLayout(inputs({ data: [{ device: "mobile" }], categoryKey: "device", config: {} }))
  assert.equal(layout.total, 0)
})
