// `node scripts/repair-class-names.mjs primitives` (or ui).
// Only changes cn calls whose className prop actually accepts a state callback.
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

const root = path.resolve(import.meta.dirname, "..")
const layer = process.argv[2]
if (!["primitives", "ui"].includes(layer)) throw new Error("Expected primitives or ui")
const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile)
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
const program = ts.createProgram(parsed.fileNames, parsed.options)
const checker = program.getTypeChecker()
let calls = 0
let files = 0
for (const source of program.getSourceFiles()) {
  if (!source.fileName.includes(`/src/components/${layer}/`)) continue
  const replacements = []
  let needsHelper = false
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(source) === "cn") {
      const argument = node.arguments.find((arg) => {
        const value = ts.isAsExpression(arg) ? arg.expression : arg
        if (!ts.isIdentifier(value) || value.text !== "className") return false
        const type = checker.getTypeAtLocation(value)
        return (type.isUnion() ? type.types : [type]).some((part) => checker.getSignaturesOfType(part, ts.SignatureKind.Call).length)
      })
      if (argument) {
        if (node.arguments.at(-1) !== argument) throw new Error(`className must be the last argument: ${source.fileName}`)
        let replacement = "className"
        if (node.arguments.length > 1) {
          const previous = node.arguments.at(-2)
          const base = source.text.slice(node.expression.end + 1, previous.end)
          const line = source.text.lastIndexOf("\n", node.getStart()) + 1
          const indent = source.text.slice(line, node.getStart()).match(/^\s*/)[0]
          const body = base.split("\n").filter((part) => part.trim())
          const margin = Math.min(...body.map((part) => part.match(/^\s*/)[0].length))
          const nested = body.map((part) => `${indent}    ${part.slice(margin)}`).join("\n")
          replacement = node.arguments.length === 2
            ? `withClass(cn(${base.trim()}), className)`
            : `withClass(\n${indent}  cn(\n${nested},\n${indent}  ),\n${indent}  className,\n${indent})`
          needsHelper = true
        }
        replacements.push({ start: node.getStart(), end: node.end, text: replacement })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  if (!replacements.length) continue
  let code = source.text
  for (const edit of replacements.sort((a, b) => b.start - a.start)) code = code.slice(0, edit.start) + edit.text + code.slice(edit.end)
  if (needsHelper && !/function withClass[<(]/.test(code)) {
    const helper = "\n\n/* UI SDK accepts a class name or a function of state; keep both working. */\nfunction withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {\n  return typeof className === \"function\" ? (state: S) => cn(base, className(state)) : cn(base, className)\n}"
    const imports = source.statements.filter(ts.isImportDeclaration)
    const position = imports.at(-1)?.end
    if (!position) throw new Error(`No import insertion point: ${source.fileName}`)
    code = code.slice(0, position) + helper + code.slice(position)
  }
  fs.writeFileSync(source.fileName, code)
  calls += replacements.length
  files++
}
console.log(`${layer}: repaired ${calls} merges in ${files} files`)
