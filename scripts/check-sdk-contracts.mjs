// Run with `node scripts/check-sdk-contracts.mjs` (add --styled for styled runtime cases).
// --primitives-only limits the export audit when working on that layer independently.
// Uses the actual UI SDK and React server renderer; no browser or additional test dependency.
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import ts from "typescript"
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

const root = path.resolve(import.meta.dirname, "..")
const require = createRequire(import.meta.url)
const cache = new Map()

// Transpile local TS modules in memory so imports exercise the same wrappers shipped to users.
function loadLocal(file) {
  if (cache.has(file)) return cache.get(file).exports
  const module = { exports: {} }
  cache.set(file, module)
  const source = fs.readFileSync(file, "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    fileName: file,
  })
  const localRequire = (specifier) => {
    if (!specifier.startsWith("@/")) return require(specifier)
    const base = path.join(root, "src", specifier.slice(2))
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
    assert.ok(resolved, `Unresolved local import: ${specifier}`)
    return loadLocal(resolved)
  }
  new Function("require", "module", "exports", outputText)(localRequire, module, module.exports)
  return module.exports
}

const failures = []
let checks = 0
function check(name, run) {
  try {
    run()
    checks++
  } catch (error) {
    failures.push(`${name}: ${error.message}`)
  }
}

for (const layer of process.argv.includes("--styled") ? ["primitives", "ui"] : ["primitives"]) {
  const component = (slug) => loadLocal(path.join(root, "src/components", layer, `${slug}.tsx`))
  const { Button } = component("button")
  check(`${layer}: button callbacks receive disabled state and render preserves its element`, () => {
    const seen = []
    const html = renderToStaticMarkup(React.createElement(Button, {
      disabled: true,
      render: React.createElement("a", { href: "/trips" }),
      className: (state) => { seen.push(state.disabled); return state.disabled ? "callback-disabled" : "callback-enabled" },
      style: (state) => ({ opacity: state.disabled ? 0.4 : 1 }),
    }, (state) => state.disabled ? "Unavailable" : "Book trip"))
    assert.ok(seen.length > 0, "className callback was never called")
    assert.ok(seen.every(Boolean), "className received incorrect disabled state")
    assert.match(html, /<a\b[^>]*href="\/trips"/)
    assert.match(html, /class="[^"]*callback-disabled/)
    assert.match(html, /opacity:0\.4/)
    assert.match(html, /Unavailable/)
  })
  check(`${layer}: tabs and tab callbacks receive selection state`, () => {
    const { Tabs, TabsList, TabsTab, TabsPanel } = component("tabs")
    const html = renderToStaticMarkup(React.createElement(Tabs, { defaultValue: "rail" },
      React.createElement(TabsList, { className: () => "callback-list" },
        React.createElement(TabsTab, { value: "rail", className: (state) => state.selected ? "callback-selected" : "callback-idle" }, "Rail"),
        React.createElement(TabsTab, { value: "air", className: (state) => state.selected ? "callback-selected" : "callback-idle" }, "Air")),
      React.createElement(TabsPanel, { value: "rail", className: () => "callback-panel" }, "Train times")))
    for (const marker of ["callback-list", "callback-selected", "callback-idle", "callback-panel"]) assert.ok(html.includes(marker), `Missing ${marker}`)
  })
  check(`${layer}: plain string classes still override base Tailwind classes`, () => {
    const html = renderToStaticMarkup(React.createElement(Button, { className: "relative absolute consumer-class" }, "Book trip"))
    const classes = html.match(/class="([^"]+)"/)?.[1].split(" ") ?? []
    assert.ok(classes.includes("absolute"))
    assert.ok(!classes.includes("relative"), "Base relative position won over consumer absolute")
    assert.ok(classes.includes("consumer-class"))
  })
  check(`${layer}: core-built message callback classes receive message state`, () => {
    const { Message, MessageContent } = component("message")
    const html = renderToStaticMarkup(React.createElement(Message, { className: () => "callback-message" },
      React.createElement(MessageContent, { className: () => "callback-content" }, "Your booking is ready")))
    assert.match(html, /callback-message/)
    assert.match(html, /callback-content/)
  })
  check(`${layer}: breadcrumb core parts preserve callbacks and custom rendering`, () => {
    const { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink } = component("breadcrumb")
    const html = renderToStaticMarkup(React.createElement(Breadcrumb, { className: () => "callback-breadcrumb" },
      React.createElement(BreadcrumbList, null, React.createElement(BreadcrumbItem, { className: () => "callback-item" },
        React.createElement(BreadcrumbLink, { render: React.createElement("a", { href: "/trips" }), className: () => "callback-link" }, "Trips")))))
    for (const marker of ["callback-breadcrumb", "callback-item", "callback-link"]) assert.ok(html.includes(marker), `Missing ${marker}`)
    assert.match(html, /href="\/trips"/)
  })
  check(`${layer}: message scroller resolves children against its own primitive state`, () => {
    const { MessageScroller } = component("message-scroller")
    const html = renderToStaticMarkup(React.createElement(MessageScroller, { defaultUnread: 3 },
      (state) => React.createElement("span", null, `${state.unread} unread messages`)))
    assert.match(html, /3 unread messages/)
  })
}

check("customization slider labels reach native range inputs", () => {
  const { Customize } = loadLocal(path.join(root, "src/lib/customize.tsx"))
  const html = renderToStaticMarkup(React.createElement(Customize, {
    controls: { gap: { type: "slider", label: "Content gap", min: 0, max: 20, default: 8 } },
    values: { gap: 8 }, speed: 1, onChange() {}, onSpeedChange() {}, onReset() {},
  }))
  const inputs = html.match(/<input\b[^>]*>/g) ?? []
  for (const name of ["Content gap", "Animation speed"]) {
    assert.ok(inputs.some((input) => input.includes('type="range"') && input.includes(`aria-label="${name}"`)), `Missing native slider label: ${name}`)
  }
})

const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile)
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
const program = ts.createProgram(parsed.fileNames, parsed.options)
const checker = program.getTypeChecker()
check("wrapper merges preserve every callback-capable className", () => {
  const unsafe = []
  for (const source of program.getSourceFiles()) {
    if (!source.fileName.includes("/src/components/primitives/") && !(process.argv.includes("--styled") && source.fileName.includes("/src/components/ui/"))) continue
    const visit = (node) => {
      if (ts.isCallExpression(node) && node.expression.getText(source) === "cn") {
        for (const argument of node.arguments) {
          const value = ts.isAsExpression(argument) ? argument.expression : argument
          if (!ts.isIdentifier(value) || value.text !== "className") continue
          const type = checker.getTypeAtLocation(value)
          if ((type.isUnion() ? type.types : [type]).some((part) => checker.getSignaturesOfType(part, ts.SignatureKind.Call).length)) {
            unsafe.push(`${path.relative(root, source.fileName)}:${source.getLineAndCharacterOfPosition(value.getStart()).line + 1}`)
          }
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  assert.ok(unsafe.length === 0, `Callback className passed directly to cn:\n${unsafe.join("\n")}`)
})

const sdkPackage = JSON.parse(fs.readFileSync(path.join(root, "node_modules/@ui-sdk/react/package.json"), "utf8"))
const utilities = new Set(["async-options", "color", "date", "gesture", "image", "number", "overlays", "primitive", "shortcuts", "text-match", "agent", "observe", "history", "package.json"])
function sdkBacked(file, visited = new Set()) {
  if (visited.has(file)) return false
  visited.add(file)
  const code = fs.readFileSync(file, "utf8")
  if (/\bdefinePrimitive\s*\(/.test(code) && /from "@ui-sdk\/core"/.test(code)) return true
  for (const [, specifier] of code.matchAll(/(?:from|import)\s*"([^"]+)"/g)) {
    if (specifier.startsWith("@ui-sdk/react/") && !utilities.has(specifier.split("/").at(-1))) return true
    if (!specifier.startsWith("@/components/")) continue
    const base = path.join(root, "src", specifier.slice(2))
    const local = [`${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(candidate))
    if (local && sdkBacked(local, visited)) return true
  }
  return false
}
let components = 0
for (const filename of fs.readdirSync(path.join(root, "src/components/ui"))) {
  if (!filename.endsWith(".tsx")) continue
  components++
  check(`${filename}: component reaches UI SDK behavior or a core primitive`, () => {
    const primitive = path.join(root, "src/components/primitives", filename)
    assert.ok(fs.existsSync(primitive), `Missing animated primitive: ${filename}`)
    assert.ok(sdkBacked(primitive), `No UI SDK component or definePrimitive reachable from ${filename}`)
  })
}
check("theme variables never replace UI SDK layout output variables", () => {
  for (const file of fs.readdirSync(path.join(root, "content/pending"))) {
    if (!file.endsWith(".json")) continue
    const slug = file.slice(0, -5)
    const docs = path.join(root, "node_modules/@ui-sdk/react/docs/components", `${slug}.md`)
    if (!fs.existsSync(docs)) continue
    const native = new Set([...fs.readFileSync(docs, "utf8").matchAll(/^- `(--[\w-]+)`:/gm)].map((match) => match[1]))
    const metadata = JSON.parse(fs.readFileSync(path.join(root, "content/pending", file), "utf8"))
    for (const [name] of metadata.cssVars ?? []) assert.ok(!native.has(name), `${slug} theme variable ${name} shadows SDK geometry`)
  }
})
let sdkComponents = 0
for (const key of Object.keys(sdkPackage.exports)) {
  const slug = key.slice(2)
  if (utilities.has(slug)) continue
  sdkComponents++
  for (const layer of process.argv.includes("--primitives-only") ? ["primitives"] : ["primitives", "ui"]) check(`${layer}: ${slug} preserves all SDK exports`, () => {
    const wrapped = program.getSourceFile(path.join(root, "src/components", layer, `${slug}.tsx`))
    assert.ok(wrapped, `Missing ${layer}/${slug}.tsx`)
    const sdk = program.getSourceFiles().find((source) => source.fileName.endsWith(`/@ui-sdk/react/dist/${slug}.d.ts`))
    assert.ok(sdk, `SDK module ${slug} is not reachable`)
    const exportsOf = (source) => checker.getExportsOfModule(checker.getSymbolAtLocation(source)).map((symbol) => symbol.name)
    const exported = new Set(exportsOf(wrapped))
    const missing = exportsOf(sdk).filter((name) => !exported.has(name))
    assert.ok(missing.length === 0, `Missing SDK exports in ${layer}/${slug}: ${missing.join(", ")}`)
  })
}

if (failures.length) {
  console.error(failures.join("\n\n"))
  console.error(`\n${failures.length} failed; ${checks} passed.`)
  process.exitCode = 1
} else console.log(`SDK contracts: ${checks} checks passed; all ${components} components use UI SDK behavior; all ${sdkComponents} SDK components preserve their exports.`)
