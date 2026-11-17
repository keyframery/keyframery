import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import ts from "typescript"
import { createPreviewSource } from "../lib/preview-source.mjs"

const root = path.resolve(import.meta.dirname, "../..")
const module = { exports: {} }
const { outputText } = ts.transpileModule(fs.readFileSync(path.join(root, "site/lib/preview-code.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } })
new Function("exports", outputText)(module.exports)
const { previewCode } = module.exports
const read = (slug) => fs.readFileSync(path.join(root, "src/demos", `${slug}.tsx`), "utf8")
const sourceOf = (slug) => createPreviewSource(read(slug), `${slug}.tsx`)
function controlsOf(slug) {
  const source = ts.createSourceFile("demo.tsx", read(slug), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const control = source.statements.filter(ts.isVariableStatement).flatMap((node) => [...node.declarationList.declarations]).find((node) => node.name.getText() === "controls")
  const expression = ts.transpileModule(`const value = ${control.initializer.getText()}`, {}).outputText
  return new Function(`${expression}; return value`)()
}
function configuredValues(controls) {
  return Object.fromEntries(Object.entries(controls).map(([key, control]) => [key,
    control.type === "switch" ? !control.default : control.type === "slider" ? control.max : control.type === "select" ? control.options.find((option) => option !== control.default) : control.type === "color" ? "#2563eb" : 'A "quoted" label with <tags> and \\ slashes',
  ]))
}

test("every component maps its controls to the real installable example", () => {
  for (const file of fs.readdirSync(path.join(root, "src/components/ui")).filter((file) => file.endsWith(".tsx"))) {
    const slug = file.slice(0, -4)
    const source = sourceOf(slug)
    const controls = controlsOf(slug)
    for (const name of Object.keys(controls)) assert.ok(source.bindings[name], `${slug}.${name}: missing live code binding`)
    assert.match(source.code, /^"use client"/)
    assert.ok(!/export const (play|meta|controls)\b/.test(source.code), `${slug}: site-only exports remain`)
    assert.ok(!source.code.includes('"@/components/ui/'), `${slug}: imports are not installable`)
    const code = previewCode(source, configuredValues(controls), 0.5)
    const parsed = ts.createSourceFile(`${slug}.tsx`, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    assert.deepEqual(parsed.parseDiagnostics, [], `${slug}: configured code is invalid TSX`)
    assert.match(code, /<KeyframerySpeed speed=\{0\.5\}>/)
  }
})

test("text, boolean and numeric edits change their defaults without touching the demo content", () => {
  const source = sourceOf("kbd")
  const code = previewCode(source, { title: 'Trip "A"\n<safe>', held: true, size: 32 })
  assert.ok(code.includes('title = "Trip \\"A\\"\\n<safe>"'))
  assert.ok(code.includes("held = true"))
  assert.ok(code.includes("size = 32"))
  assert.match(code, /Command palette/)
  assert.ok(!code.includes("KeyframerySpeed"))
  assert.equal(previewCode(source, {}), source.code)
})

test("invalid and unknown values cannot insert executable code or corrupt a template", () => {
  const source = sourceOf("kbd")
  assert.equal(previewCode(source, { absent: "throw new Error()", size: Number.NaN }, -1), source.code)
  const code = previewCode(source, { title: '\"); throw new Error("injected"); //' }, Number.POSITIVE_INFINITY)
  const parsed = ts.createSourceFile("safe.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  assert.deepEqual(parsed.parseDiagnostics, [])
  assert.ok(!code.includes("KeyframerySpeed"))
})

test("configured examples typecheck against the actual component APIs", () => {
  const virtual = new Map()
  for (const slug of fs.readdirSync(path.join(root, "src/components/ui")).filter((file) => file.endsWith(".tsx")).map((file) => file.slice(0, -4))) {
    const code = previewCode(sourceOf(slug), configuredValues(controlsOf(slug)), 0.4)
      .replaceAll('"@/components/keyframery/primitives/', '"@/components/primitives/')
      .replaceAll('"@/components/keyframery/core/', '"@/components/core/')
      .replaceAll('"@/components/keyframery/', '"@/components/ui/')
    virtual.set(path.join(root, "src", `__configured-${slug}.tsx`), code)
  }
  const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  const host = ts.createCompilerHost(parsed.options)
  const original = host.getSourceFile.bind(host)
  host.getSourceFile = (file, version, ...args) => virtual.has(file) ? ts.createSourceFile(file, virtual.get(file), version, true, ts.ScriptKind.TSX) : original(file, version, ...args)
  const program = ts.createProgram([...virtual.keys()], parsed.options, host)
  const errors = ts.getPreEmitDiagnostics(program).filter((diagnostic) => diagnostic.file && virtual.has(diagnostic.file.fileName))
  assert.equal(errors.length, 0, ts.formatDiagnosticsWithColorAndContext(errors, { getCurrentDirectory: () => root, getCanonicalFileName: (file) => file, getNewLine: () => "\n" }))
})


test("Markdown and AI exports retain the runnable example without playground metadata", () => {
  const module = { exports: {} }
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(root, "site/lib/doc-markdown.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } })
  new Function("exports", outputText)(module.exports)
  const source = sourceOf("kbd")
  const markdown = module.exports.cleanDocMarkdown(`<ComponentPreview slug="kbd" source={${JSON.stringify(source)}} />`)
  assert.ok(markdown.startsWith("```tsx\n"))
  assert.ok(markdown.includes(source.code))
  assert.ok(!markdown.includes('"importOffset"'))
})
