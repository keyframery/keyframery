import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import ts from "typescript"

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8")
const compile = (path, dependencies = {}) => {
  const { outputText } = ts.transpileModule(read(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } })
  const exports = {}
  new Function("exports", "require", outputText)(exports, (name) => {
    if (!(name in dependencies)) throw new Error(`unexpected import ${name}`)
    return dependencies[name]
  })
  return exports
}

const codec = compile("../../site/lib/preset.ts")
const theming = JSON.parse(read("../../content/theming.json"))
const tokens = compile("../../site/lib/preset-tokens.ts", { "./preset": codec, "../../content/theming.json": { __esModule: true, default: theming } })
const { DEFAULT_PRESET, PRESET_FIELDS, START_PRESET, decodePreset, encodePreset, randomPreset, isPresetCode } = codec

/* A small deterministic generator, so the random round trips are the same on every run. */
function seeded(seed) {
  let state = seed
  return () => ((state = (state * 1664525 + 1013904223) % 4294967296) / 4294967296)
}

test("the default preset is k0, and every field's default is its first value", () => {
  assert.equal(encodePreset(DEFAULT_PRESET), "k0")
  assert.deepEqual(decodePreset("k0"), DEFAULT_PRESET)
  for (const field of PRESET_FIELDS) assert.equal(DEFAULT_PRESET[field.key], field.values[0])
})

test("every value of every field round-trips on its own", () => {
  for (const field of PRESET_FIELDS)
    for (const value of field.values) {
      const preset = { ...DEFAULT_PRESET, [field.key]: value }
      assert.deepEqual(decodePreset(encodePreset(preset)), preset, `${field.key}=${value}`)
    }
})

test("random presets round-trip, and codes stay short", () => {
  const random = seeded(7)
  for (let i = 0; i < 2000; i++) {
    const preset = Object.fromEntries(PRESET_FIELDS.map((f) => [f.key, f.values[Math.floor(random() * f.values.length)]]))
    const code = encodePreset(preset)
    assert.match(code, /^k[0-9A-Za-z]{1,7}$/)
    assert.deepEqual(decodePreset(code), preset)
  }
  for (let i = 0; i < 200; i++) assert.ok(isPresetCode(encodePreset(randomPreset(seeded(i)))))
})

test("codes are stable: a preset shared today decodes the same forever", () => {
  /* Pinned. If one of these changes, the field order, sizes or lists were edited in a breaking way. */
  assert.equal(encodePreset({ base: "stone", theme: "cobalt", motion: "calm" }), "k18OWX")
  assert.equal(encodePreset({ ...DEFAULT_PRESET, reduced: "gentle", bounce: "bouncy", speed: "1.5", motion: "playful" }), "kSljJNQ")
  assert.deepEqual(decodePreset("k18OWX"), { ...DEFAULT_PRESET, base: "stone", theme: "cobalt", motion: "calm" })
})

test("invalid codes are rejected", () => {
  for (const bad of [undefined, null, 42, "", "k", "b0", "K0", "k00", "k-1", "k0!", "kzzzzzzzzzzz", "k" + "z".repeat(7)]) assert.equal(decodePreset(bad), null, String(bad))
  /* Index 15 in the 4-bit base field: no such base colour. */
  assert.equal(decodePreset("kF"), null)
  assert.throws(() => encodePreset({ theme: "purple" }))
})

/* The tokens the components ship with, read from src/index.css. */
function shipped(selector) {
  const css = read("../../src/index.css")
  const body = css.match(new RegExp(`(?:^|\\n)${selector.replace(".", "\\.")} \\{([^}]+)\\}`))[1]
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

test("the default preset's tokens equal src/index.css exactly", () => {
  const { light, dark } = tokens.presetTokens(DEFAULT_PRESET)
  assert.deepEqual(light, shipped(":root"))
  assert.deepEqual(dark, shipped(".dark"))
})

test("Create's start preset (Subtle, what ships) writes no motion, corner or reduced-motion rules", () => {
  assert.deepEqual(tokens.radiusVars(START_PRESET), {})
  assert.deepEqual(tokens.presetMotion(START_PRESET).vars, {})
  const item = tokens.presetRegistryItem(START_PRESET, "https://keyframery.com")
  assert.equal(item.css, undefined)
  assert.deepEqual(item.registryDependencies, ["https://keyframery.com/r/motion.json"])
})

test("k0 still means Springy: it now writes Springy's motion, since Subtle ships", () => {
  assert.equal(encodePreset(DEFAULT_PRESET), "k0")
  assert.equal(DEFAULT_PRESET.motion, "springy")
  const vars = tokens.presetRegistryItem(DEFAULT_PRESET, "https://keyframery.com").css["@layer base"][":root:not([data-motion])"]
  assert.equal(vars["--kf-speed"], "1")
  assert.equal(vars["--kf-flourish"], "1")
  assert.equal(vars["--ease-spring"], tokens.STYLES.springy.spring)
  assert.equal(vars["--ease-pop"], tokens.STYLES.springy.pop)
})

test("the motion styles match src/index.css", () => {
  const css = read("../../src/index.css")
  for (const [name, style] of Object.entries(tokens.STYLES)) {
    const body = css.match(new RegExp(`\\[data-motion="${name}"\\]\\s*\\{([^}]+)\\}`))[1]
    const vars = Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
    assert.equal(Number(vars["--kf-speed"]), style.speed, name)
    assert.equal(Number(vars["--kf-flourish"]), style.flourish, name)
    assert.equal(vars["--ease-spring"], style.spring, name)
    assert.equal(vars["--ease-pop"], style.pop, name)
  }
})

test("every preset has full light and dark sets in oklch", () => {
  const random = seeded(3)
  for (let i = 0; i < 300; i++) {
    const preset = Object.fromEntries(PRESET_FIELDS.map((f) => [f.key, f.values[Math.floor(random() * f.values.length)]]))
    const { light, dark } = tokens.presetTokens(preset)
    for (const name of Object.keys(shipped(":root"))) assert.ok(light[name], `light ${name}`)
    for (const name of Object.keys(shipped(".dark"))) assert.ok(dark[name], `dark ${name}`)
    for (const n of [1, 2, 3, 4, 5]) assert.ok(light[`chart-${n}`] && dark[`chart-${n}`])
    for (const [name, value] of [...Object.entries(light), ...Object.entries(dark)])
      if (name !== "radius") assert.match(value, /^oklch\(\d(\.\d+)? \d(\.\d+)? \d+(\.\d+)?( \/ [\d.]+)?\)$/, `${name}: ${value}`)
  }
})

test("bounce curves start at 0, end at 1 and overshoot about as much as asked", () => {
  for (const overshoot of [0, 0.02, 0.08, 0.14, 0.3]) {
    const points = tokens.springEasing(overshoot).slice(7, -1).split(", ").map(Number)
    assert.equal(points[0], 0)
    assert.equal(points.at(-1), 1)
    const peak = Math.max(...points) - 1
    assert.ok(Math.abs(peak - overshoot) < 0.03, `${overshoot}: peak ${peak}`)
  }
})

test("a calm, faster preset writes its default style on :root:not([data-motion])", () => {
  const preset = { ...DEFAULT_PRESET, motion: "calm", speed: "1.5", reduced: "gentle", radius: "1", font: "figtree" }
  const item = tokens.presetRegistryItem(preset, "http://localhost:4640")
  assert.equal(item.type, "registry:theme")
  assert.equal(item.css["@layer base"][":root:not([data-motion])"]["--kf-speed"], "0.9")
  assert.equal(item.css["@layer base"][":root"]["--dialog-radius"], "29px")
  assert.ok(item.css["@media (prefers-reduced-motion: reduce)"])
  assert.ok(item.registryDependencies.includes("http://localhost:4640/r/font-figtree.json"))
  assert.equal(tokens.fontItem("figtree").font.import, "Figtree")
  assert.equal(tokens.fontItem("inherit"), null)
  /* Pills stay pills. */
  assert.equal(tokens.radiusVars(preset)["--switch-radius"], undefined)
})
