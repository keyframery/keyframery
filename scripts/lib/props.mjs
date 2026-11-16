// Reads every part's props from the component types, for the API reference on each docs page.
//
// A part's props come from three places. Keyframery's own (variant, size, speed, mobileBreakpoint…)
// are documented in this repo; UI SDK's carry its JSDoc and @defaultValue tags; and the plain
// element props (onClick, aria-*, …) come from React and are left out, with a line saying which
// element the part renders. Defaults for our own props are read from the destructuring default.
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

/* Props every part takes, said once on the page instead of in every table. */
const COMMON = new Set(["className", "style", "render", "children", "ref", "key", "id", "debug"])

export function readProps(root, slugs) {
  const cfg = ts.getParsedCommandLineOfConfigFile(path.join(root, "tsconfig.json"), {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic() {},
  })
  const files = slugs.map((s) => path.join(root, "src/components/ui", `${s}.tsx`))
  const program = ts.createProgram(files, cfg.options)
  const checker = program.getTypeChecker()
  const out = {}

  for (const [i, file] of files.entries()) {
    const slug = slugs[i]
    const sf = program.getSourceFile(file)
    const mod = checker.getSymbolAtLocation(sf)
    const primitive = program.getSourceFile(path.join(root, "src/components/primitives", `${slug}.tsx`))
    const parts = []
    const hooks = []

    for (const exp of checker.getExportsOfModule(mod)) {
      const name = exp.name
      const type = checker.getTypeOfSymbolAtLocation(exp, sf)
      const sig = type.getCallSignatures()[0]
      if (/^use[A-Z]/.test(name) && sig) {
        hooks.push(readHook(checker, sf, name, sig))
        continue
      }
      if (!/^[A-Z]/.test(name) || !sig) continue
      const param = sig.parameters[0]
      if (!param) {
        parts.push({ name, props: [], element: null })
        continue
      }
      const propsType = checker.getTypeOfSymbolAtLocation(param, sf)
      const defaults = { ...defaultsOf(primitive, name), ...defaultsOf(sf, localName(sf, name)) }
      const props = []
      let domProps = 0
      for (const prop of propsType.getProperties()) {
        // A prop that went through Omit<> or a union is a copy: follow it back to the original.
        const p = prop.declarations?.length ? prop : (checker.getRootSymbols(prop).find((r) => r.declarations?.length) ?? prop)
        const decl = p.declarations?.[0]
        const from = decl?.getSourceFile().fileName ?? ""
        if (from.includes("/@types/react/")) {
          domNames.add(p.name)
          domProps++
          continue
        }
        if (COMMON.has(p.name)) continue
        const own = !from.includes("node_modules")
        const doc = ts.displayPartsToString(p.getDocumentationComment(checker)).replace(/\s+/g, " ").trim()
        const t = checker.getTypeOfSymbolAtLocation(prop, sf)
        const tags = Object.fromEntries(p.getJsDocTags(checker).map((tag) => [tag.name, ts.displayPartsToString(tag.text)]))
        props.push({
          name: p.name,
          type: typeText(checker, t, sf),
          full: fullTypeText(checker, t, sf),
          default: defaults[p.name] ?? tags.defaultValue ?? tags.default ?? null,
          description: doc,
          required: !(prop.flags & ts.SymbolFlags.Optional),
          own,
        })
      }
      // speed sorts first: it is the one prop every component shares.
      props.sort((a, b) => (b.name === "speed") - (a.name === "speed") || b.own - a.own)
      parts.push({ name, props, element: domProps ? elementOf(checker, propsType, sf) : null, domProps })
    }
    out[slug] = { parts, hooks }
  }

  /* Descriptions the types lack come from content/prop-docs.json (null hides the prop). Some UI SDK
     types inline every DOM attribute without docs (Tabs): any left undescribed are element props. */
  const extra = JSON.parse(fs.readFileSync(path.join(root, "content/prop-docs.json"), "utf8"))
  for (const { parts } of Object.values(out))
    for (const part of parts) {
      const before = part.props.length
      part.props = part.props.filter((p) => {
        const key = `${part.name}.${p.name}`
        const given = key in extra ? extra[key] : p.description ? undefined : extra[p.name]
        if (given === null) return false
        if (given) p.description = given
        return p.description || (p.own && !domNames.has(p.name))
      })
      if (part.props.length < before && !part.element) part.element = "div"
    }
  return out
}

const domNames = new Set()

/* `export { Menu as ContextMenu }`: the function is declared under its own name. */
function localName(sf, exported) {
  for (const st of sf.statements)
    if (ts.isExportDeclaration(st) && st.exportClause && ts.isNamedExports(st.exportClause))
      for (const el of st.exportClause.elements) if (el.name.text === exported) return (el.propertyName ?? el.name).text
  return exported
}

/* `function Button({ size = "md", ... })`: the default as written. */
function defaultsOf(sf, fnName) {
  const found = {}
  if (!sf) return found
  for (const st of sf.statements) {
    if (!ts.isFunctionDeclaration(st) || st.name?.text !== fnName) continue
    const p = st.parameters[0]
    if (!p || !ts.isObjectBindingPattern(p.name)) continue
    for (const el of p.name.elements)
      if (el.initializer && ts.isIdentifier(el.name)) {
        const text = el.initializer.getText(sf)
        if (text.length <= 40 && !/^[a-z]\w*$/.test(text)) found[el.name.text] = text
      }
  }
  return found
}

const SHORT = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope

function strip(text) {
  return text
    .replace(/import\("[^"]+"\)\./g, "")
    .replace(/\s*\|\s*undefined\b/g, "")
    .replace(/^undefined\s*\|\s*/, "")
    .replace(/^string \| number \| bigint \| boolean \| (React\.)?ReactElement.*$/, "ReactNode")
}

/* Short enough for a table cell: long generics fold to <…>, long functions to `function`. */
function typeText(checker, t, sf) {
  let text = strip(checker.typeToString(checker.getNonNullableType(t), sf, SHORT))
  // A local alias like ButtonVariant says less than its union: "default" | "primary" | ...
  const nn = checker.getNonNullableType(t)
  if (/^[A-Z]\w*$/.test(text) && nn.isUnion() && nn.types.every((u) => u.isStringLiteral())) {
    const full = nn.types.map((u) => JSON.stringify(u.value)).join(" | ")
    if (full.length <= 90) return full
  }
  if (text.length > 48) text = text.replace(/<[^<>]*(?:<[^<>]*>[^<>]*)*>/g, "<…>")
  if (text.length > 48 && /=>/.test(text)) text = "function"
  if (text.length > 48) text = text.slice(0, 45) + "…"
  return text
}

function fullTypeText(checker, t, sf) {
  return strip(checker.typeToString(checker.getNonNullableType(t), sf, ts.TypeFormatFlags.NoTruncation))
}

/* Which element a part renders, from the `ref` it takes: HTMLButtonElement → "button". */
function elementOf(checker, propsType, sf) {
  const ref = propsType.getProperty("ref")
  const text = ref ? checker.typeToString(checker.getTypeOfSymbolAtLocation(ref, sf)) : ""
  const m = text.match(/HTML(\w+?)Element/)
  if (!m) return "element"
  const map = { Div: "div", Span: "span", Button: "button", Input: "input", Anchor: "a", Paragraph: "p", Heading: "h2", UList: "ul", OList: "ol", LI: "li", Label: "label", TextArea: "textarea", Image: "img", FieldSet: "fieldset", Legend: "legend", Form: "form", Table: "table", TableRow: "tr", TableCell: "td", TableSection: "tbody", Output: "output", Select: "select", Progress: "progress", Meter: "meter", Dialog: "dialog", HR: "hr", Time: "time", Element: "element" }
  return map[m[1]] ?? m[1].toLowerCase()
}

function readHook(checker, sf, name, sig) {
  const ret = checker.getReturnTypeOfSignature(sig)
  const fields = ret.getProperties().map((p) => ({
    name: p.name,
    type: typeText(checker, checker.getTypeOfSymbolAtLocation(p, sf), sf),
    description: ts.displayPartsToString(p.getDocumentationComment(checker)).replace(/\s+/g, " ").trim(),
  }))
  return { name, fields }
}

export function sourceExists(root, rel) {
  return fs.existsSync(path.join(root, rel))
}
