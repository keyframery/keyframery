// Check the public demo controls against their real prop defaults and theming contract.
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

const root = path.resolve(import.meta.dirname, "..")
const failures = []
const results = []
const literal = (node) => {
  if (!node) return undefined
  const text = ts.transpileModule(`const value = (${node.getText()});`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  return new Function(`${text};return value`)()
}
for (const file of fs.readdirSync(path.join(root, "src/components/ui")).filter((name) => name.endsWith(".tsx"))) {
  const slug = file.slice(0, -4)
  const code = fs.readFileSync(path.join(root, "src/demos", file), "utf8")
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const control = source.statements.filter(ts.isVariableStatement).flatMap((statement) => [...statement.declarationList.declarations]).find((decl) => decl.name.getText() === "controls")
  try {
    assert.ok(control, "No controls exported")
    const controls = literal(control.initializer)
    const fn = source.statements.find((statement) => ts.isFunctionDeclaration(statement) && statement.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.DefaultKeyword))
    assert.ok(fn && ts.isObjectBindingPattern(fn.parameters[0]?.name), "Demo must accept the control props")
    const params = new Map(fn.parameters[0].name.elements.map((element) => [element.name.getText(), element]))
    assert.ok(Object.keys(controls).length >= 10, `Only ${Object.keys(controls).length} controls (expected at least 10)`)
    const colors = Object.entries(controls).filter(([, value]) => value.type === "color")
    assert.ok(colors.length > 0, "No color control")
    for (const [name, value] of Object.entries(controls)) {
      assert.ok(params.has(name), `Control ${name} has no matching prop`)
      assert.deepEqual(literal(params.get(name).initializer), value.default, `Default differs for ${name}`)
      if (value.type === "color") assert.equal(value.default, "", `${name} overrides the theme by default`)
      assert.ok(!["speed", "motion"].includes(name), `${name} duplicates shared motion controls`)
      if (value.type === "slider") assert.ok(value.min <= value.default && value.default <= value.max, `${name} is outside its range`)
      if (value.type === "select") assert.ok(value.options.includes(value.default), `${name} default is not an option`)
    }
    const metadata = JSON.parse(fs.readFileSync(path.join(root, "content/pending", `${slug}.json`), "utf8"))
    assert.ok(metadata.cssVars?.length >= 3, "Fewer than three documented theming variables")
    const styled = fs.readFileSync(path.join(root, "src/components/ui", file), "utf8")
    for (const [name] of metadata.cssVars) assert.ok(styled.includes(name), `Documented ${name} is absent from the styled component`)
    results.push({ slug, controls: Object.keys(controls).length, colors: colors.length, variables: metadata.cssVars.length })
  } catch (error) { failures.push(`${slug}: ${error.message}`) }
}
if (process.argv.includes("--json")) console.log(JSON.stringify({ results, failures }, null, 2))
else {
  if (failures.length) console.error(failures.join("\n"))
  console.log(`Customization: ${results.length} components passed; ${failures.length} failed.`)
}
if (failures.length) process.exitCode = 1
