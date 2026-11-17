// Build a small edit map once, so the browser can update real example source without a TS compiler.
import ts from "typescript"

export function createPreviewSource(code, filename = "example.tsx") {
  const original = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const siteExports = new Set(["play", "meta", "controls"])
  const declarations = original.statements.filter(ts.isVariableStatement).flatMap((node) => [...node.declarationList.declarations])
  const control = declarations.find((node) => node.name.getText(original) === "controls")?.initializer
  const object = control && ts.isAsExpression(control) ? control.expression : control
  const options = new Map()
  if (object && ts.isObjectLiteralExpression(object)) {
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer)) continue
      const list = property.initializer.properties.find((item) => ts.isPropertyAssignment(item) && item.name.getText(original) === "options")?.initializer
      if (list && ts.isArrayLiteralExpression(list)) options.set(property.name.getText(original), list.elements.map((item) => item.getText(original)).join(" | "))
    }
  }
  const edits = []
  for (const node of original.statements) {
    if (ts.isVariableStatement(node) && node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) && node.declarationList.declarations.every((declaration) => siteExports.has(declaration.name.getText(original))))
      edits.push({ start: node.getFullStart(), end: node.end, text: "" })
    if (ts.isTypeAliasDeclaration(node)) {
      const reference = /^\(typeof controls\.([\w$]+)\.options\)\[number\]$/.exec(node.type.getText(original))
      if (reference) {
        const union = options.get(reference[1])
        if (!union) throw new Error(`${filename}: unresolved control option type ${reference[1]}`)
        edits.push({ start: node.type.getStart(original), end: node.type.end, text: union })
      }
    }
  }
  for (const edit of edits.sort((a, b) => b.start - a.start)) code = code.slice(0, edit.start) + edit.text + code.slice(edit.end)
  code = code
    .replaceAll('"@/components/primitives/', '"@/components/keyframery/primitives/')
    .replace(/"@\/components\/core\/([a-z0-9-]+)"/g, '"@/components/keyframery/core/$1-core"')
    .replaceAll('"@/components/ui/', '"@/components/keyframery/')
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  if (!/^['"]use client['"]/.test(code)) code = '"use client"\n\n' + code
  const source = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const component = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword))
  if (!component?.body) throw new Error(`${filename}: expected a default example component`)
  const bindings = {}
  const parameter = component.parameters[0]
  if (parameter && ts.isObjectBindingPattern(parameter.name)) {
    for (const element of parameter.name.elements) {
      if (ts.isIdentifier(element.name) && element.initializer)
        bindings[element.name.text] = [element.initializer.getStart(source), element.initializer.end]
    }
  }
  const returned = component.body.statements.find((statement) => ts.isReturnStatement(statement) && statement.expression)?.expression
  if (!returned) throw new Error(`${filename}: expected a returned preview element`)
  return {
    code,
    bindings,
    root: [returned.getStart(source), returned.end],
    importOffset: source.statements.filter(ts.isImportDeclaration).at(-1)?.end ?? source.statements[0].end,
  }
}
