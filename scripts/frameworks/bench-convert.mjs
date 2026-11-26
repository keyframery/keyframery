#!/usr/bin/env node
/* JSX → Vue converter for Keyframery's examples (the bench's Vue ports, also shown on the docs pages).

   Reads src/examples/<slug>/<example>.tsx and writes frameworks/bench/examples/vue/<slug>/<example>.vue:
   the same content, props and structure, written against the Vue API (frameworks/VUE.md and UI SDK's Vue docs):
   kebab-case props, `class` for className, `v-model:<prop>` for controlled pairs, `v-slot="{ state }"` for
   render-prop children, `#render="{ props }"` for `render={<El />}`, `v-for` for `.map`, `v-if` for `&&` and
   ternaries, `ref()` for useState. Whatever it can't carry cleanly is listed in
   frameworks/bench/examples/vue/_convert.json under `todo` (and the file is still written, so a person can
   finish it by hand).

   Existing files are never overwritten unless you pass --force, and the ones listed in _convert.json `hand`
   (finished by hand) never are.

   Usage: node scripts/frameworks/bench-convert.mjs [--force] [--dry] [slug | slug/example ...] */

import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const ts = require("typescript")
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const srcDir = path.join(root, "src/examples")
const outDir = path.join(root, "frameworks/bench/examples/vue")

const args = process.argv.slice(2)
const force = args.includes("--force")
const dry = args.includes("--dry")
const only = args.filter((a) => !a.startsWith("--"))

/* ---------- naming ---------- */

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase()
const htmlAttr = {
  className: "class",
  htmlFor: "for",
  tabIndex: "tabindex",
  readOnly: "readonly",
  autoFocus: "autofocus",
  autoComplete: "autocomplete",
  maxLength: "maxlength",
  minLength: "minlength",
  spellCheck: "spellcheck",
  inputMode: "inputmode",
  colSpan: "colspan",
  rowSpan: "rowspan",
  dateTime: "datetime",
  srcSet: "srcset",
  crossOrigin: "crossorigin",
  encType: "enctype",
  noValidate: "novalidate",
  contentEditable: "contenteditable",
  enterKeyHint: "enterkeyhint",
  autoCapitalize: "autocapitalize",
  autoCorrect: "autocorrect",
  referrerPolicy: "referrerpolicy",
  viewBox: "viewBox",
  preserveAspectRatio: "preserveAspectRatio",
  defaultValue: "value",
  defaultChecked: "checked",
}
const domOnly = new Set(["tabIndex", "spellCheck", "htmlFor", "colSpan", "rowSpan", "autoFocus", "srcSet", "crossOrigin", "dateTime", "encType", "noValidate", "contentEditable", "enterKeyHint", "autoCapitalize", "autoCorrect", "referrerPolicy"])
const isComponentTag = (t) => /^[A-Z]/.test(t) || t.includes(".")
/* Does the Vue component for module <mod> (UI SDK's Vue part, or our own SFCs in frameworks/vue/<mod>) declare
   the prop <name>? A declared prop takes Vue's kebab-case name (read-only → readOnly); an undeclared one falls
   through to the element as a plain attribute, so it must keep its real HTML name (maxlength, not max-length). */
const sdkDts = path.join(root, "frameworks/bench/vue/node_modules/@ui-sdk/vue/dist")
const declCache = new Map()
function declares(mod, name) {
  if (!mod) return false
  const key = `${mod}\0${name}`
  if (declCache.has(key)) return declCache.get(key)
  const files = []
  /* Our SFCs for the module, and the UI SDK modules they render (InputGroupInput renders UI SDK's Input). */
  const own = path.join(root, "frameworks/vue", mod)
  const mods = new Set([mod])
  if (fs.existsSync(own))
    for (const f of fs.readdirSync(own).filter((f) => f.endsWith(".vue"))) {
      const t = fs.readFileSync(path.join(own, f), "utf8")
      files.push((t.match(/defineProps[\s\S]*?\)\s*\n/) ?? [""])[0])
      for (const m of t.matchAll(/from "@ui-sdk\/vue\/([\w-]+)"/g)) mods.add(m[1])
      /* …or another Keyframery part (InputGroupInput renders our Input): ask that module too. */
      for (const m of t.matchAll(/from "@\/components\/keyframery\/([\w-]+)"/g)) if (m[1] !== mod && !declCache.has(`${m[1]}\0${name}`) && (declCache.set(key, false), declares(m[1], name))) files.push(`${name}:`)
    }
  for (const mod of mods) {
  const dts = path.join(sdkDts, `${mod}.d.ts`)
  if (fs.existsSync(dts)) {
    const t = fs.readFileSync(dts, "utf8")
    files.push(t)
    /* Shared prop sets it imports (text-control, toggle-props…), one level deep. */
    for (const m of t.matchAll(/from "\.\/([\w-]+)\.js"/g)) {
      const f = path.join(sdkDts, `${m[1]}.d.ts`)
      if (fs.existsSync(f) && !/^(create-parts|use-primitive|primitive)$/.test(m[1])) files.push(fs.readFileSync(f, "utf8"))
    }
  }
  }
  const re = new RegExp(`(^|[\\s{,;])${name}\\??:`, "m")
  const hit = files.some((t) => re.test(t))
  declCache.set(key, hit)
  return hit
}
function attrName(name, component, mod) {
  if (name === "className") return "class"
  if (name.startsWith("aria-") || name.startsWith("data-")) return name
  /* Plain DOM attributes the part doesn't declare fall through to the element: keep their HTML names. */
  if (component && htmlAttr[name] && name !== "defaultValue" && name !== "defaultChecked" && (domOnly.has(name) || !declares(mod, name))) return htmlAttr[name]
  if (component) return kebab(name)
  if (htmlAttr[name]) return htmlAttr[name]
  if (/^(stroke|fill|clip|stop|font|text|dominant|color)[A-Z]/.test(name)) return kebab(name)
  return name.toLowerCase() === name ? name : kebab(name)
}

const domEvents = new Set("click dblclick contextmenu keydown keyup keypress input change submit reset focus blur focusin focusout pointerdown pointerup pointermove pointerenter pointerleave pointercancel mousedown mouseup mousemove mouseenter mouseleave mouseover mouseout wheel scroll touchstart touchend touchmove dragstart dragend dragover dragenter dragleave drop paste copy cut load error animationend transitionend select".split(" "))

/* Controlled pairs → v-model:<prop>. */
const modelProps = { value: "onValueChange", checked: "onCheckedChange", open: "onOpenChange", pressed: "onPressedChange", query: "onQueryChange", page: "onPageChange", date: "onDateChange", month: "onMonthChange", expanded: "onExpandedChange", selected: "onSelectedChange", sizes: "onSizesChange", layout: "onLayoutChange", inputValue: "onInputValueChange", highlightedValue: "onHighlightedValueChange" }

/* ---------- conversion of one file ---------- */

function convert(file) {
  const text = fs.readFileSync(file, "utf8")
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const todo = []
  const state = new Map() // name → setter
  const setters = new Map() // setter → name
  const refs = new Set() // useRef names
  const vueImports = new Set()
  const hoisted = [] // handlers moved into the script
  const domRefs = new Set() // useRef names used as ref={…} (template refs); the rest become plain variables

  /* Leading // comments (title and description). */
  const lead = []
  for (const line of text.split("\n")) {
    if (line.startsWith("//")) lead.push(line)
    else break
  }

  const imports = []
  const tagModule = new Map() // imported component name → its module (otp-input), to know which props it declares
  const topLevel = []
  let component = null
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) {
      imports.push(st)
      const m = st.moduleSpecifier.text.match(/^(?:@\/components\/ui|@ui-sdk\/react)\/([\w-]+)$/)
      const named = st.importClause?.namedBindings
      if (m && named && ts.isNamedImports(named)) for (const el of named.elements) tagModule.set(el.name.text, m[1])
    }
    else if (ts.isFunctionDeclaration(st) && st.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) component = st
    else if (ts.isExportAssignment(st)) todo.push("export default expression")
    else topLevel.push(st)
  }
  if (!component) {
    todo.push("no `export default function`")
    return { vue: null, todo }
  }

  /* Component body: hooks, statements, the returned JSX. */
  const body = component.body.statements
  const derived = new Set() // consts computed from state: computed() in Vue
  const readsState = (n) => {
    let hit = false
    const v = (x) => {
      if (ts.isIdentifier(x) && (state.has(x.text) || derived.has(x.text)) && !(ts.isPropertyAccessExpression(x.parent) && x.parent.name === x)) hit = true
      ts.forEachChild(x, v)
    }
    v(n)
    return hit
  }
  let ret = null
  const scriptStmts = []
  for (const st of body) {
    if (ts.isReturnStatement(st)) {
      ret = st.expression
      continue
    }
    if (ts.isVariableStatement(st)) {
      const decl = st.declarationList.declarations[0]
      const init = decl.initializer
      const call = init && ts.isCallExpression(init) ? init : null
      const callee = call ? call.expression.getText(sf).replace(/^React\./, "") : ""
      if (callee === "useState" && ts.isArrayBindingPattern(decl.name)) {
        const [v, s] = decl.name.elements.map((e) => (ts.isBindingElement(e) ? e.name.getText(sf) : null))
        if (!s) {
          /* useState with no setter is a value made once (a toaster, a start time): a plain const. */
          let i0 = call.arguments[0]
          const lazy = i0 && ts.isArrowFunction(i0) && !i0.parameters.length && !ts.isBlock(i0.body)
          scriptStmts.push({ kind: "const", name: v, type: call.typeArguments?.map((t) => t.getText(sf)).join(", "), init: lazy ? i0.body : i0, call: i0 && !lazy && (ts.isArrowFunction(i0) || ts.isFunctionExpression(i0)) })
          continue
        }
        state.set(v, s)
        setters.set(s, v)
        scriptStmts.push({ kind: "state", name: v, typeArgs: call.typeArguments?.map((t) => t.getText(sf)).join(", "), init: call.arguments[0] })
        vueImports.add("ref")
        continue
      }
      if (callee === "useRef") {
        const name = decl.name.getText(sf)
        refs.add(name)
        scriptStmts.push({ kind: "ref", name, typeArgs: call.typeArguments?.map((t) => t.getText(sf)).join(", "), init: call.arguments[0] })
        continue
      }
      if (/^use[A-Z]/.test(callee) && !/^(useState|useRef)$/.test(callee)) todo.push(`hook ${callee}`)
      /* A value worked out from state each render (const all = picked.length === n) → computed(). */
      if (init && ts.isIdentifier(decl.name) && !ts.isArrowFunction(init) && !ts.isFunctionExpression(init) && readsState(init)) {
        derived.add(decl.name.text)
        scriptStmts.push({ kind: "derived", name: decl.name.text, type: decl.type?.getText(sf), init })
        continue
      }
    }
    if (ts.isExpressionStatement(st) && ts.isCallExpression(st.expression)) {
      const callee = st.expression.expression.getText(sf).replace(/^React\./, "")
      if (callee === "useEffect" || callee === "useLayoutEffect") {
        scriptStmts.push({ kind: "effect", node: st.expression })
        continue
      }
    }
    scriptStmts.push({ kind: "stmt", node: st })
  }
  if (!ret) {
    todo.push("no return statement")
    return { vue: null, todo }
  }
  while (ts.isParenthesizedExpression(ret)) ret = ret.expression

  {
    const scan = (n) => {
      if (ts.isJsxAttribute(n) && n.name.getText(sf) === "ref" && n.initializer?.expression && ts.isIdentifier(n.initializer.expression)) domRefs.add(n.initializer.expression.text)
      ts.forEachChild(n, scan)
    }
    scan(component)
  }
  const plainRefs = new Set([...refs].filter((r) => !domRefs.has(r)))

  /* ---------- expression rewriting (source splicing) ---------- */

  /* mode "script": state reads → x.value, setX(v) → x.value = v.  mode "template": setX(v) → x = v, strings in single quotes. */
  function expr(node, mode, subst = new Map()) {
    const edits = []
    const start = node.getStart(sf)
    const visit = (n) => {
      if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) {
        todo.push(`JSX inside an expression: ${n.getText(sf).slice(0, 60)}`)
        return
      }
      if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && setters.has(n.expression.text) && n.arguments.length === 1) {
        const v = setters.get(n.expression.text)
        const target = mode === "script" ? `${v}.value` : v
        let a = n.arguments[0]
        let inner
        if ((ts.isArrowFunction(a) || ts.isFunctionExpression(a)) && a.parameters.length === 1 && !ts.isBlock(a.body)) {
          const p = a.parameters[0].name.getText(sf)
          let b = a.body
          while (ts.isParenthesizedExpression(b)) b = b.expression
          inner = expr(b, mode, new Map([...subst, [p, target]]))
        } else if (ts.isArrowFunction(a) || ts.isFunctionExpression(a)) {
          todo.push(`functional setter with a block body`)
          inner = expr(a, mode, subst)
        } else inner = expr(a, mode, subst)
        /* An assignment is only bare at the top of a statement or handler; anywhere else it needs parentheses. */
        const bare = n === node || ts.isExpressionStatement(n.parent) || (ts.isArrowFunction(n.parent) && n.parent.body === n)
        edits.push([n.getStart(sf), n.getEnd(), bare ? `${target} = ${inner}` : `(${target} = ${inner})`])
        return
      }
      if (ts.isIdentifier(n)) {
        const parent = n.parent
        const isProp = parent && ((ts.isPropertyAccessExpression(parent) && parent.name === n) || (ts.isPropertyAssignment(parent) && parent.name === n) || ts.isBindingElement(parent) || ts.isParameter(parent) || ts.isTypeReferenceNode(parent))
        if (!isProp && subst.has(n.text)) {
          edits.push([n.getStart(sf), n.getEnd(), subst.get(n.text)])
          return
        }
        if (!isProp && mode === "script" && (state.has(n.text) || domRefs.has(n.text) || derived.has(n.text))) {
          if (parent && ts.isShorthandPropertyAssignment(parent)) edits.push([n.getStart(sf), n.getEnd(), `${n.text}: ${n.text}.value`])
          else edits.push([n.getStart(sf), n.getEnd(), `${n.text}.value`])
          return
        }
        if (!isProp && mode === "template" && refs.has(n.text) && parent && ts.isPropertyAccessExpression(parent) && parent.name.text === "current") {
          edits.push([n.getStart(sf), parent.getEnd(), n.text])
          return
        }
        /* A setter passed as a value (onChange={setX}) → (v) => (x = v) */
        if (!isProp && setters.has(n.text) && !(parent && ts.isCallExpression(parent) && parent.expression === n)) {
          const v = setters.get(n.text)
          edits.push([n.getStart(sf), n.getEnd(), `(v) => (${mode === "script" ? v + ".value" : v} = v)`])
          return
        }
      }
      if (ts.isPropertyAccessExpression(n) && n.name.text === "current" && ts.isIdentifier(n.expression) && refs.has(n.expression.text)) {
        const r = n.expression.text
        edits.push([n.getStart(sf), n.getEnd(), plainRefs.has(r) || mode === "template" ? r : `${r}.value`])
        return
      }
      if (mode === "template" && ts.isStringLiteral(n)) {
        const raw = n.text
        edits.push([n.getStart(sf), n.getEnd(), raw.includes("'") ? "`" + raw.replace(/`/g, "\\`") + "`" : `'${raw.replace(/\\/g, "\\\\")}'`])
        return
      }
      if (ts.isPropertyAccessExpression(n) && n.expression.getText(sf) === "React") {
        todo.push(`React.${n.name.text}`)
      }
      ts.forEachChild(n, visit)
    }
    visit(node)
    let out = node.getText(sf)
    for (const [s, e, r] of edits.sort((a, b) => b[0] - a[0])) out = out.slice(0, s - start) + r + out.slice(e - start)
    return out
  }
  const tplExpr = (node, subst) => {
    let s = expr(node, "template", subst)
    if (s.includes('"')) s = s.replace(/"/g, "&quot;")
    return s
  }

  /* ---------- JSX → template ---------- */

  const out = []
  const ind = (d) => "  ".repeat(d)

  function tagOf(n) {
    const t = (ts.isJsxElement(n) ? n.openingElement : n).tagName.getText(sf)
    return t
  }
  function attrsOf(n) {
    return (ts.isJsxElement(n) ? n.openingElement : n).attributes.properties
  }
  function childrenOf(n) {
    return ts.isJsxElement(n) || ts.isJsxFragment(n) ? [...n.children] : []
  }

  function jsxText(raw) {
    const lines = raw.split(/\r\n|\n|\r/)
    let last = 0
    lines.forEach((l, i) => {
      if (/[^ \t]/.test(l)) last = i
    })
    let s = ""
    lines.forEach((l, i) => {
      let t = l.replace(/\t/g, " ")
      if (i !== 0) t = t.replace(/^[ ]+/, "")
      if (i !== lines.length - 1) t = t.replace(/[ ]+$/, "")
      if (t) {
        if (i !== last) t += " "
        s += t
      }
    })
    return s
  }
  const escText = (s) => s.replace(/{{/g, "{ {").replace(/</g, "&lt;")

  /* Normalise children into a list of nodes: {k:"el", node, dirs:[]} | {k:"text", s} | {k:"interp", s} | {k:"slot", ...} | {k:"comment"} */
  function items(children, subst) {
    const res = []
    for (const c of children) {
      if (ts.isJsxText(c)) {
        const s = jsxText(c.text) /* .text keeps the leading whitespace getText() drops */
        if (s) res.push({ k: "text", s: escText(s) })
      } else if (ts.isJsxExpression(c)) {
        if (!c.expression) {
          const cm = c.getText(sf).match(/\/\*([\s\S]*?)\*\//)
          if (cm) res.push({ k: "comment", s: cm[1].trim() })
          continue
        }
        res.push(...exprItem(c.expression, subst, []))
      } else res.push({ k: "el", node: c, dirs: [], subst })
    }
    return res
  }

  function unparen(e) {
    while (ts.isParenthesizedExpression(e)) e = e.expression
    return e
  }
  const isJsx = (e) => ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e) || ts.isJsxFragment(e)

  /* An expression child → items, carrying v-if/v-for directives onto the element it yields. */
  function exprItem(e, subst, dirs) {
    e = unparen(e)
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [{ k: "text", s: escText(e.text) }]
    if (isJsx(e)) {
      if (ts.isJsxFragment(e)) {
        if (!dirs.length) return items(e.children, subst)
        return [{ k: "tpl", dirs, children: items(e.children, subst) }]
      }
      return [{ k: "el", node: e, dirs, subst }]
    }
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      const right = unparen(e.right)
      const cond = tplExpr(e.left, subst)
      if (isJsx(right) || ts.isConditionalExpression(right)) return exprItem(right, subst, [...dirs, `v-if="${cond}"`])
      return [{ k: "tpl", dirs: [...dirs, `v-if="${cond}"`], children: [{ k: "interp", s: tplExpr(right, subst) }] }]
    }
    if (ts.isConditionalExpression(e)) {
      const a = unparen(e.whenTrue)
      const b = unparen(e.whenFalse)
      if (isJsx(a) || isJsx(b)) {
        const cond = tplExpr(e.condition, subst)
        const left = isJsx(a) ? exprItem(a, subst, [...dirs, `v-if="${cond}"`]) : [{ k: "tpl", dirs: [...dirs, `v-if="${cond}"`], children: exprItem(a, subst, []) }]
        const isNull = b.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(b) && b.text === "undefined")
        if (isNull) return left
        const right = isJsx(b) || ts.isConditionalExpression(b) ? exprItem(b, subst, ["v-else"]) : [{ k: "tpl", dirs: ["v-else"], children: exprItem(b, subst, []) }]
        /* An else-if chain: the nested conditional's v-if becomes v-else-if. */
        if (right[0]?.dirs?.[0]?.startsWith("v-else") === false || (right[0]?.dirs?.length > 1 && right[0].dirs[0] === "v-else" && right[0].dirs[1].startsWith("v-if="))) {
          right[0].dirs = right[0].dirs.filter((d) => d !== "v-else").map((d) => d.replace(/^v-if=/, "v-else-if="))
        }
        return [...left, ...right]
      }
      return [{ k: "interp", s: tplExpr(e, subst) }]
    }
    if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && e.expression.name.text === "map") {
      const fn = unparen(e.arguments[0])
      if (fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) {
        let bodyExpr = fn.body
        if (ts.isBlock(bodyExpr)) {
          const r = bodyExpr.statements.length === 1 && ts.isReturnStatement(bodyExpr.statements[0]) ? bodyExpr.statements[0].expression : null
          if (!r) {
            todo.push(".map with a block body")
            return [{ k: "interp", s: tplExpr(e, subst) }]
          }
          bodyExpr = r
        }
        bodyExpr = unparen(bodyExpr)
        const params = fn.parameters.map((p) => p.name.getText(sf).replace(/\s+/g, " "))
        const list = tplExpr(e.expression.expression, subst)
        const head = params.length === 1 ? params[0] : `(${params.join(", ")})`
        const vfor = `v-for="${head} in ${list}"`
        subst = new Map([...subst, ["\0loop", "1"]])
        if (isJsx(bodyExpr) && !ts.isJsxFragment(bodyExpr)) return exprItem(bodyExpr, subst, [...dirs, vfor])
        if (ts.isJsxFragment(bodyExpr)) return [{ k: "tpl", dirs: [...dirs, vfor], children: items(bodyExpr.children, subst) }]
        return [{ k: "tpl", dirs: [...dirs, vfor], children: exprItem(bodyExpr, subst, []) }]
      }
    }
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return [{ k: "slotfn", fn: e, subst }]
    return [{ k: "interp", s: tplExpr(e, subst) }]
  }

  function slotHead(fn) {
    const p = fn.parameters[0]
    if (!p) return `v-slot`
    const n = p.name.getText(sf).replace(/\s+/g, " ")
    return n === "state" ? `v-slot="{ state }"` : `v-slot="{ state: ${n} }"`
  }
  function slotBody(fn, subst) {
    let b = fn.body
    if (ts.isBlock(b)) {
      const r = b.statements.length === 1 && ts.isReturnStatement(b.statements[0]) ? b.statements[0].expression : null
      if (!r) {
        todo.push("render-prop child with a block body")
        return [{ k: "interp", s: tplExpr(fn, subst) }]
      }
      b = r
    }
    return exprItem(b, subst, [])
  }

  function attrList(node, subst, extraDirs) {
    const tag = tagOf(node)
    const comp = isComponentTag(tag)
    const props = attrsOf(node)
    const res = [...extraDirs]
    let render = null
    let keyAttr = null
    const namedSlots = []
    const byName = new Map()
    for (const p of props) if (ts.isJsxAttribute(p)) byName.set(p.name.getText(sf), p)
    const consumed = new Set()
    const domEvents = new Set("click dblclick contextmenu keydown keyup keypress input change submit reset focus blur focusin focusout pointerdown pointerup pointermove pointerenter pointerleave pointercancel mousedown mouseup mousemove mouseenter mouseleave mouseover mouseout wheel scroll touchstart touchend touchmove dragstart dragend dragover dragenter dragleave drop paste copy cut load error animationend transitionend select".split(" "))

/* Controlled pairs. */
    const pairs = Object.entries(modelProps)
    for (const name of byName.keys()) {
      const ev = `on${name[0].toUpperCase()}${name.slice(1)}Change`
      if (byName.has(ev) && !modelProps[name]) pairs.push([name, ev])
    }
    for (const [prop, ev] of pairs) {
      const a = byName.get(prop)
      const h = byName.get(ev)
      if (!a || !h || !a.initializer || !h.initializer) continue
      const val = a.initializer.expression ? unparen(a.initializer.expression) : null
      const fn = h.initializer.expression ? unparen(h.initializer.expression) : null
      if (!val || !ts.isIdentifier(val) || !state.has(val.text) || !fn) continue
      const setter = state.get(val.text)
      let ok = false
      if (ts.isIdentifier(fn) && fn.text === setter) ok = true
      if ((ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && !ts.isBlock(fn.body)) {
        const b = unparen(fn.body)
        const p0 = fn.parameters[0]?.name.getText(sf)
        /* (v) => v && setX(v)  — a guard against null, which v-model carries as well. */
        const call = ts.isBinaryExpression(b) && b.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && unparen(b.left).getText(sf) === p0 ? unparen(b.right) : b
        if (ts.isCallExpression(call) && call.expression.getText(sf) === setter && call.arguments.length === 1) {
          const b2 = call
          let arg = unparen(b2.arguments[0])
          while (ts.isAsExpression(arg) || ts.isNonNullExpression(arg)) arg = unparen(arg.expression)
          if (ts.isIdentifier(arg) && arg.text === p0) ok = true
          if (ts.isBinaryExpression(arg) && arg.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken && unparen(arg.left).getText(sf) === p0) ok = true
        }
      }
      if (!ok) continue
      consumed.add(prop).add(ev)
      res.push(`v-model:${comp ? kebab(prop) : prop}="${val.text}"`)
    }
    for (const p of props) {
      if (ts.isJsxSpreadAttribute(p)) {
        res.push(`v-bind="${tplExpr(p.expression, subst)}"`)
        continue
      }
      const name = p.name.getText(sf)
      if (consumed.has(name)) continue
      const init = p.initializer
      if (name === "key") {
        keyAttr = init && ts.isStringLiteral(init) ? `key="${init.text}"` : `:key="${tplExpr(init.expression, subst)}"`
        continue
      }
      if (name === "render" && init && ts.isJsxExpression(init) && init.expression && isJsx(unparen(init.expression))) {
        render = unparen(init.expression)
        continue
      }
      /* renderToken={(token) => <X />}  →  <template #token="{ token }"><X /></template> (UI SDK's Vue slots) */
      if (/^render[A-Z]/.test(name) && init && ts.isJsxExpression(init) && init.expression && (ts.isArrowFunction(unparen(init.expression)) || ts.isFunctionExpression(unparen(init.expression)))) {
        const fn = unparen(init.expression)
        const slot = kebab(name.slice(6))
        const ps = fn.parameters.map((pp) => pp.name.getText(sf))
        namedSlots.push({ k: "tpl", dirs: [ps.length ? `#${slot}="{ ${ps.join(", ")} }"` : `#${slot}`], children: slotBody(fn, subst) })
        continue
      }
      if (name === "ref") {
        res.push(`ref="${init.expression.getText(sf)}"`)
        continue
      }
      if (/^on[A-Z]/.test(name)) {
        const ev = domEvents.has(name.slice(2).toLowerCase()) ? name.slice(2).toLowerCase() : kebab(name.slice(2))
        if (!init || !init.expression) continue
        const fn = unparen(init.expression)
        if ((ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && !ts.isBlock(fn.body)) {
          const b = unparen(fn.body)
          const p0 = fn.parameters[0]?.name.getText(sf)
          /* (e) => e.preventDefault()  →  @submit.prevent */
          if (p0 && b.getText(sf) === `${p0}.preventDefault()`) {
            res.push(`@${ev}.prevent`)
            continue
          }
          const usesParams = fn.parameters.some((pp) => new RegExp(`\\b${pp.name.getText(sf).replace(/[{}]/g, "")}\\b`).test(b.getText(sf)))
          if (!usesParams || !fn.parameters.length) {
            res.push(`@${ev}="${tplExpr(b, subst)}"`)
            continue
          }
        }
        if ((ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && ts.isBlock(fn.body)) {
          /* A handler with statements moves into <script setup> as a named function, unless it reads a v-for variable. */
          if (!subst.has("\0loop")) {
            let fname = name
            for (let i = 2; hoisted.some((h) => h.name === fname); i++) fname = `${name}${i}`
            const params = fn.parameters.map((pp) => pp.getText(sf)).join(", ")
            const lines = expr(fn.body, "script").split("\n")
            const k = lines.length > 1 ? lines[lines.length - 1].match(/^ */)[0].length : 0
            const body = lines.map((l, i) => (i === 0 ? l : l.slice(Math.min(k, l.match(/^ */)[0].length)))).join("\n")
            const isAsync = fn.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)
            hoisted.push({ name: fname, text: `${isAsync ? "async " : ""}function ${fname}(${params}) ${body}` })
            res.push(`@${ev}="${fname}"`)
            continue
          }
          todo.push(`block-body handler on ${name} inside v-for`)
        }
        res.push(`@${ev}="${tplExpr(fn, subst)}"`)
        continue
      }
      const an = attrName(name, comp, tagModule.get(tag.split(".")[0]))
      if (!init) {
        /* React writes a bare aria- or data- attribute as "true"; Vue would write "". */
        res.push(/^(aria|data)-/.test(an) ? `${an}="true"` : an)
        continue
      }
      if (ts.isStringLiteral(init)) {
        res.push(`${an}="${init.text.replace(/"/g, "&quot;")}"`)
        continue
      }
      const e = init.expression ? unparen(init.expression) : null
      if (!e) continue
      if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) {
        res.push(`${an}="${e.text.replace(/"/g, "&quot;")}"`)
        continue
      }
      if (e.kind === ts.SyntaxKind.TrueKeyword && !an.startsWith("aria-") && !an.startsWith("data-")) {
        res.push(an)
        continue
      }
      if (isJsx(e)) {
        /* fallback={<X />} → <template #fallback><X /></template>, the way UI SDK's Vue parts take content. */
        if (comp) {
          namedSlots.push({ k: "tpl", dirs: [`#${kebab(name)}`], children: exprItem(e, subst, []) })
          continue
        }
        todo.push(`JSX in prop ${name}`)
        res.push(`:${an}="/* TODO JSX */ undefined"`)
        continue
      }
      /* A function prop with statements (submit={async () => { … }}) moves into the script, named after the prop. */
      if ((ts.isArrowFunction(e) || ts.isFunctionExpression(e)) && ts.isBlock(e.body) && !subst.has("\0loop")) {
        let fname = name
        for (let i = 2; hoisted.some((h) => h.name === fname); i++) fname = `${name}${i}`
        const params = e.parameters.map((pp) => pp.getText(sf)).join(", ")
        const lines = expr(e.body, "script").split("\n")
        const k = lines.length > 1 ? lines[lines.length - 1].match(/^ */)[0].length : 0
        const body = lines.map((l, i) => (i === 0 ? l : l.slice(Math.min(k, l.match(/^ */)[0].length)))).join("\n")
        const isAsync = e.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)
        hoisted.push({ name: fname, text: `${isAsync ? "async " : ""}function ${fname}(${params}) ${body}` })
        res.push(`:${an}="${fname}"`)
        continue
      }
      if ((ts.isArrowFunction(e) || ts.isFunctionExpression(e)) && name === "className") {
        todo.push("className function")
      }
      res.push(`:${an}="${tplExpr(e, subst)}"`)
    }
    /* v-for first, then key, then v-if, then the rest. */
    const vfor = res.filter((d) => d.startsWith("v-for"))
    const vif = res.filter((d) => /^v-(if|else|else-if)\b/.test(d))
    const rest = res.filter((d) => !vfor.includes(d) && !vif.includes(d))
    return { list: [...vfor, ...(keyAttr ? [keyAttr] : []), ...vif, ...rest], render, tag, namedSlots }
  }

  const MAXW = 110
  function openTag(d, tag, attrs, selfClose) {
    const one = `${ind(d)}<${tag}${attrs.length ? " " + attrs.join(" ") : ""}${selfClose ? " />" : ">"}`
    if (one.length <= MAXW || attrs.length <= 1) return [one]
    return [`${ind(d)}<${tag}`, ...attrs.map((a) => `${ind(d + 1)}${a}`), `${ind(d)}${selfClose ? "/>" : ">"}`]
  }

  /* Inline form of a list of items, or null when an item can't be inline. */
  function inline(list) {
    let s = ""
    for (const it of list) {
      if (it.k === "text") s += it.s
      else if (it.k === "interp") s += `{{ ${it.s} }}`
      else if (it.k === "el") {
        const r = render1(it, 0)
        if (r.length !== 1) return null
        s += r[0].trim()
      } else return null
    }
    return s
  }

  function renderItems(list, d) {
    const lines = []
    const mixed = list.some((i) => i.k === "text" || i.k === "interp")
    if (mixed) {
      const s = inline(list)
      if (s != null) return [`${ind(d)}${s}`]
      /* Mixed but not inlinable: one item per line; JSX spacing is kept by the text nodes themselves. */
    }
    for (const it of list) lines.push(...render1(it, d))
    return lines
  }

  function render1(it, d) {
    if (it.k === "text") return [`${ind(d)}${it.s.trim() === "" ? "{{ ' ' }}" : it.s}`]
    if (it.k === "interp") return [`${ind(d)}{{ ${it.s} }}`]
    if (it.k === "comment") return [`${ind(d)}<!-- ${it.s} -->`]
    if (it.k === "tpl") {
      const inner = renderItems(it.children, d + 1)
      return [`${ind(d)}<template ${it.dirs.join(" ")}>`, ...inner, `${ind(d)}</template>`]
    }
    if (it.k === "slotfn") {
      todo.push("render-prop child not directly inside a component")
      return [`${ind(d)}<!-- TODO render prop -->`]
    }
    /* element */
    const node = it.node
    const { list, render, tag: rawTag, namedSlots } = attrList(node, it.subst, it.dirs)
    let tag = rawTag
    let attrs = list
    if (rawTag.includes(".") || /^[a-z]/.test(rawTag) === false && it.subst && it.subst.has(rawTag)) {
      attrs = [`:is="${tplExpr(ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName, it.subst)}"`, ...attrs]
      tag = "component"
    }
    if (rawTag === "React.Fragment" || rawTag === "Fragment") {
      todo.push("React.Fragment")
    }
    let kids = [...namedSlots, ...items(childrenOf(node), it.subst)]
    /* A single render-prop child → v-slot on the component. */
    const slotfns = kids.filter((k) => k.k === "slotfn")
    if (slotfns.length === 1 && kids.length === 1 && !render) {
      attrs = [...attrs, slotHead(slotfns[0].fn)]
      kids = slotBody(slotfns[0].fn, it.subst)
    } else if (slotfns.length) {
      kids = kids.map((k) => (k.k === "slotfn" ? { k: "tpl", dirs: [slotHead(k.fn).replace(/^v-slot/, "#default")], children: slotBody(k.fn, it.subst) } : k))
    }
    if (render) {
      /* render={<El />} → <template #render="{ props }"><El v-bind="props" …>children</El></template> */
      const r = attrList(render, it.subst, [])
      let rtag = r.tag
      let rattrs = ["v-bind=\"props\"", ...r.list]
      const rkids = [...items(childrenOf(render), it.subst), ...kids]
      const inner = rkids.length ? renderEl(d + 2, rtag, rattrs, rkids) : openTag(d + 2, rtag, rattrs, true)
      return [...openTag(d, tag, attrs, false), `${ind(d + 1)}<template #render="{ props }">`, ...inner, `${ind(d + 1)}</template>`, `${ind(d)}</${tag}>`]
    }
    if (!kids.length) return openTag(d, tag, attrs, true)
    return renderEl(d, tag, attrs, kids)
  }

  function renderEl(d, tag, attrs, kids) {
    const open = openTag(d, tag, attrs, false)
    const mixed = kids.some((k) => k.k === "text" || k.k === "interp") && kids.every((k) => k.k === "text" || k.k === "interp" || (k.k === "el" && !childrenOf(k.node).length && !k.dirs.length))
    if (open.length === 1 && mixed) {
      const s = inline(kids)
      if (s != null) {
        const line = `${open[0]}${s}</${tag}>`
        if (line.length <= MAXW || !kids.some((k) => k.k === "el")) return [line]
      }
    }
    return [...open, ...renderItems(kids, d + 1), `${ind(d)}</${tag}>`]
  }

  const tpl = render1Root(ret)
  function render1Root(e) {
    e = unparen(e)
    if (ts.isJsxFragment(e)) return renderItems(items(e.children, new Map()), 1)
    return renderItems(exprItem(e, new Map(), []), 1)
  }

  /* ---------- script ---------- */

  const importLines = { ext: [], local: [] }
  for (const im of imports) {
    const spec = im.moduleSpecifier.text
    const clause = im.importClause
    if (spec === "react") continue
    let to = spec
    if (spec === "lucide-react") to = "@lucide/vue"
    else if (spec.startsWith("@/components/ui/")) to = spec.replace("@/components/ui/", "@/components/keyframery/")
    else if (spec.startsWith("@ui-sdk/react")) to = spec.replace("@ui-sdk/react", "@ui-sdk/vue")
    else if (spec.startsWith("@/")) todo.push(`import ${spec}`)
    const line = `import ${clause.getText(sf)} from "${to}"`
    ;(to.startsWith("@/") ? importLines.local : importLines.ext).push(line)
  }
  for (const st of topLevel) {
    let hasJsx = false
    const v = (n) => {
      if (isJsx(n)) hasJsx = true
      ts.forEachChild(n, v)
    }
    v(st)
    if (hasJsx) todo.push(`top-level JSX in ${st.getText(sf).slice(0, 40)}`)
  }
  const top = topLevel.map((st) => {
    const full = st.getFullText(sf)
    return full.replace(/^\s*\n/, "").replace(/^\n+/, "")
  })

  const body2 = []
  for (const s of scriptStmts) {
    if (s.kind === "const") {
      const init = s.init ? expr(s.init, "script") : "undefined"
      body2.push(`const ${s.name}${s.type ? `: ${s.type}` : ""} = ${s.call ? `(${init})()` : init}`)
    } else if (s.kind === "derived") {
      vueImports.add("computed")
      body2.push(`const ${s.name} = computed${s.type ? `<${s.type}>` : ""}(() => ${expr(s.init, "script")})`)
    } else if (s.kind === "state") {
      /* useState(() => x) runs its initializer once: ref(x). */
      let initNode = s.init
      if (initNode && ts.isArrowFunction(initNode) && !initNode.parameters.length && !ts.isBlock(initNode.body)) initNode = initNode.body
      let init = initNode ? expr(initNode, "script") : ""
      if (s.init && (ts.isArrowFunction(s.init) || ts.isFunctionExpression(s.init)) && initNode === s.init) init = `(${init})()`
      const ta = s.typeArgs ? `<${s.typeArgs}>` : ""
      body2.push(`const ${s.name} = ref${ta}(${init})`)
    } else if (s.kind === "ref" && plainRefs.has(s.name)) {
      /* A ref that holds a value (a timer, a flag) and isn't rendered is a plain variable in Vue. */
      const init = s.init ? expr(s.init, "script") : ""
      const empty = !init || init === "undefined"
      const ta = s.typeArgs ? `: ${s.typeArgs}${empty && !/undefined/.test(s.typeArgs) ? " | undefined" : ""}` : ""
      body2.push(empty ? `let ${s.name}${ta}` : `let ${s.name}${ta} = ${init}`)
    } else if (s.kind === "ref") {
      const init = s.init ? expr(s.init, "script") : ""
      const ta = s.typeArgs ? `<${s.typeArgs}>` : ""
      body2.push(`const ${s.name} = ref${ta}(${init})`)
    } else if (s.kind === "effect") {
      const fn = s.node.arguments[0]
      const deps = s.node.arguments[1]
      const fbody = fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) ? fn.body : null
      /* useEffect(() => () => cleanup, [])  →  onBeforeUnmount(cleanup) */
      if (deps && ts.isArrayLiteralExpression(deps) && deps.elements.length === 0 && fbody && !ts.isBlock(fbody) && (ts.isArrowFunction(unparen(fbody)) || ts.isFunctionExpression(unparen(fbody)))) {
        vueImports.add("onBeforeUnmount")
        body2.push(`onBeforeUnmount(${expr(unparen(fbody), "script")})`)
      } else {
        todo.push("useEffect")
        vueImports.add("watchEffect")
        body2.push(`// TODO(bench-convert): port this effect\nwatchEffect(${fn ? expr(fn, "script") : ""})`)
      }
    } else body2.push(expr(s.node, "script"))
  }

  if (state.size || domRefs.size) vueImports.add("ref")
  if (hoisted.length) body2.push("\n" + hoisted.map((h) => h.text).join("\n\n"))
  if (vueImports.size) importLines.ext.unshift(`import { ${[...vueImports].sort().join(", ")} } from "vue"`)
  const scriptParts = [lead.join("\n"), importLines.ext.join("\n"), importLines.local.join("\n"), top.join("\n").trim(), body2.join("\n")].filter((s) => s && s.trim())
  const script = `<script setup lang="ts">\n${scriptParts.join("\n\n")}\n</script>`
  const template = `<template>\n${tpl.join("\n")}\n</template>`
  return { vue: `${script}\n\n${template}\n`, todo: [...new Set(todo)] }
}

/* ---------- run ---------- */

const manifestPath = path.join(outDir, "_convert.json")
/* manifest.hand lists the examples finished by hand: never overwritten, even with --force. */
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : { hand: [], todo: {} }
let wrote = 0
let skipped = 0
const results = []
for (const slug of fs.readdirSync(srcDir).sort()) {
  const dir = path.join(srcDir, slug)
  if (!fs.statSync(dir).isDirectory()) continue
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith(".tsx")) continue
    const ex = f.replace(/\.tsx$/, "")
    const id = `${slug}/${ex}`
    if (only.length && !only.includes(slug) && !only.includes(id)) continue
    const target = path.join(outDir, slug, ex + ".vue")
    if (fs.existsSync(target) && (!force || (manifest.hand ?? []).includes(id))) {
      skipped++
      continue
    }
    let r
    try {
      r = convert(path.join(dir, f))
    } catch (e) {
      r = { vue: null, todo: [`converter crashed: ${e.message}`] }
    }
    results.push([id, r.todo])
    if (r.todo.length) manifest.todo[id] = r.todo
    else delete manifest.todo[id]
    if (dry) {
      console.log(`----- ${id}${r.todo.length ? `  TODO: ${r.todo.join("; ")}` : ""}\n${r.vue ?? ""}`)
      continue
    }
    if (r.vue) {
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, r.vue)
      wrote++
    }
  }
}
if (!dry) {
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n")
}
const flagged = results.filter(([, t]) => t.length)
console.log(`bench-convert: wrote ${wrote}, kept ${skipped} existing, ${flagged.length} need a hand pass`)
for (const [id, t] of flagged) console.log(`  ${id}: ${t.join("; ")}`)
