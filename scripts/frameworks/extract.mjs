#!/usr/bin/env node
/* Keyframery multi-framework extractor (stage 1).

   Reads src/components/primitives/<slug>.tsx and src/components/ui/<slug>.tsx with the TypeScript
   compiler API and evaluates each exported part the way React would render it with no props from the
   user: the ui wrapper is inlined into the primitive wrapper, which is inlined into the UI SDK part.
   The result per exported part is a small render tree:

     { t: "part", name, module, slot, class, attrs, behaviors, children }   a UI SDK part
     { t: "el", tag, class, attrs, children }                               an extra element we render
     { t: "slot", fallback }                                                the user's content
     { t: "if", state, then, else }                                         content that depends on part state
     { t: "text", value }

   The class on each node is the final string: primitive classes then ui classes, merged with
   tailwind-merge exactly like `cn` (clsx + twMerge). Anything the static evaluation cannot carry
   (classes that depend on props or state, JS behaviour, children copied with React.Children, the
   speed prop) is listed under `lost`.

   Output: frameworks/classes/<slug>.json and frameworks/classes/_summary.json.

   Usage: node scripts/frameworks/extract.mjs [slug ...]   (no slug = all 55 native components) */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const src = path.join(root, "src")
const outDir = path.join(root, "frameworks/classes")
const sdkDist = path.join(root, "node_modules/@ui-sdk/react/dist")
const sdkDocs = path.join(root, "node_modules/@ui-sdk/react/docs/components")

const cn = (...a) => twMerge(clsx(a))
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase()

/* ---------- the 55 native components ---------- */

export function nativeSlugs() {
  return fs
    .readdirSync(path.join(src, "components/primitives"))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.slice(0, -4))
    .filter((s) => fs.readFileSync(path.join(src, "components/primitives", s + ".tsx"), "utf8").includes(`"@ui-sdk/react/${s}"`))
    .sort()
}

/* Every data-slot UI SDK documents, to check the kebab-case guess for each part. */
const documentedSlots = new Set()
for (const f of fs.readdirSync(sdkDocs)) {
  for (const m of fs.readFileSync(path.join(sdkDocs, f), "utf8").matchAll(/data-slot="([a-z0-9-]+)"/g)) documentedSlots.add(m[1])
}

/* Names each @ui-sdk/react/<module> exports (from its .d.ts), to find which module a part comes from. */
const moduleExports = new Map()
function exportsOf(mod) {
  if (moduleExports.has(mod)) return moduleExports.get(mod)
  const file = path.join(sdkDist, mod.replace("@ui-sdk/react/", "") + ".d.ts")
  const names = new Set()
  if (fs.existsSync(file)) {
    const text = fs.readFileSync(file, "utf8")
    for (const m of text.matchAll(/export\s*\{([^}]*)\}/g))
      for (const part of m[1].split(",")) {
        const name = part.trim().split(/\s+as\s+/).pop()?.replace(/^type\s+/, "").trim()
        if (name) names.add(name)
      }
    for (const m of text.matchAll(/export declare (?:const|function|class) (\w+)/g)) names.add(m[1])
  }
  moduleExports.set(mod, names)
  return names
}

/* ---------- files ---------- */

const files = new Map()
function loadFile(file) {
  if (files.has(file)) return files.get(file)
  if (!fs.existsSync(file)) return null
  const text = fs.readFileSync(file, "utf8")
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const info = { file, sf, text, decls: new Map(), imports: new Map(), starExports: [], namedExports: [] }
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) {
      const mod = st.moduleSpecifier.text
      const b = st.importClause?.namedBindings
      if (b && ts.isNamedImports(b))
        for (const el of b.elements) info.imports.set(el.name.text, { module: mod, name: (el.propertyName ?? el.name).text })
      if (b && ts.isNamespaceImport(b)) info.imports.set(b.name.text, { module: mod, namespace: true })
    } else if (ts.isFunctionDeclaration(st) && st.name) {
      info.decls.set(st.name.text, { kind: "fn", node: st })
      if (st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) info.namedExports.push({ name: st.name.text, local: st.name.text })
    } else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations)
        if (ts.isIdentifier(d.name) && d.initializer) {
          const init = d.initializer
          if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) info.decls.set(d.name.text, { kind: "fn", node: init })
          else info.decls.set(d.name.text, { kind: "const", node: init })
        }
    } else if (ts.isExportDeclaration(st)) {
      const mod = st.moduleSpecifier?.text
      if (!st.exportClause && mod) info.starExports.push(mod)
      else if (st.exportClause && ts.isNamedExports(st.exportClause))
        for (const el of st.exportClause.elements) {
          if (el.isTypeOnly || st.isTypeOnly) continue
          info.namedExports.push({ name: el.name.text, local: (el.propertyName ?? el.name).text, module: mod })
        }
    }
  }
  files.set(file, info)
  return info
}

function resolveImportPath(spec) {
  if (spec.startsWith("@/")) return path.join(src, spec.slice(2)) + ".tsx"
  return null
}

/* ---------- values ---------- */

const SLOT = (fallback = null, scoped = false) => ({ __slot: true, fallback, scoped })
const isSlot = (v) => v && typeof v === "object" && v.__slot
const isNode = (v) => v && typeof v === "object" && typeof v.t === "string"
const UNKNOWN = (src, why) => ({ __unknown: true, src, why })
const isUnknown = (v) => v && typeof v === "object" && v.__unknown

class Ctx {
  constructor(part) {
    this.part = part
    this.lost = []
    this.styles = new Map()
    this.behaviors = []
  }
  lose(kind, detail) {
    if (!this.lost.some((l) => l.kind === kind && l.detail === detail)) this.lost.push({ kind, detail })
  }
}

class Env {
  constructor(file, parent = null, vars = new Map()) {
    this.file = file
    this.parent = parent
    this.vars = vars
  }
  get(name) {
    if (this.vars.has(name)) return { found: true, value: this.vars.get(name) }
    return this.parent ? this.parent.get(name) : { found: false }
  }
  child(vars) {
    return new Env(this.file, this, vars)
  }
}

const short = (node) => node.getText().replace(/\s+/g, " ").slice(0, 160)

/* Does an expression read a prop, a parameter of the component, or the part's state? */
function readsDynamic(node, env) {
  let hit = null
  const visit = (n) => {
    if (hit) return
    if (ts.isIdentifier(n)) {
      const r = env.get(n.text)
      if (r.found && r.value && typeof r.value === "object" && (r.value.__param || r.value.__props || r.value.__state || r.value.__hook))
        hit = n.text
    }
    ts.forEachChild(n, visit)
  }
  visit(node)
  return hit
}

/* ---------- evaluation ---------- */

function unwrapParam(v) {
  return v && typeof v === "object" && v.__param ? v.value : v
}

function evalExpr(node, env, ctx) {
  if (!node) return undefined
  switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      return node.text
    case ts.SyntaxKind.NumericLiteral:
      return Number(node.text)
    case ts.SyntaxKind.TrueKeyword:
      return true
    case ts.SyntaxKind.FalseKeyword:
      return false
    case ts.SyntaxKind.NullKeyword:
      return null
    case ts.SyntaxKind.UndefinedKeyword:
      return undefined
  }
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node) || ts.isSatisfiesExpression?.(node))
    return evalExpr(node.expression, env, ctx)
  if (ts.isTemplateExpression(node)) {
    let s = node.head.text
    for (const span of node.templateSpans) {
      const v = unwrapParam(evalExpr(span.expression, env, ctx))
      if (isUnknown(v)) return UNKNOWN(short(node), "template")
      s += String(v ?? "") + span.literal.text
    }
    return s
  }
  if (ts.isIdentifier(node)) {
    if (node.text === "undefined") return undefined
    const r = env.get(node.text)
    if (r.found) return r.value
    const info = env.file
    const d = info.decls.get(node.text)
    if (d?.kind === "const") {
      const v = evalExpr(d.node, new Env(info), ctx)
      return v
    }
    if (d?.kind === "fn") return { __fn: d.node, env: new Env(info), name: node.text }
    const imp = info.imports.get(node.text)
    if (imp) return { __import: imp, file: info }
    return UNKNOWN(node.text, "identifier")
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map((e) => evalExpr(e, env, ctx))
  if (ts.isObjectLiteralExpression(node)) {
    const o = {}
    for (const p of node.properties) {
      if (ts.isPropertyAssignment(p)) o[p.name.getText().replace(/^["']|["']$/g, "")] = evalExpr(p.initializer, env, ctx)
      else return UNKNOWN(short(node), "object")
    }
    return o
  }
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) {
    const v = unwrapParam(evalExpr(node.operand, env, ctx))
    if (isUnknown(v)) return UNKNOWN(short(node), "not")
    return !v
  }
  if (ts.isTypeOfExpression(node)) {
    const v = unwrapParam(evalExpr(node.expression, env, ctx))
    if (isSlot(v)) return "slot"
    if (v && v.__fn) return "function"
    if (isUnknown(v)) return UNKNOWN(short(node), "typeof")
    return typeof v
  }
  if (ts.isConditionalExpression(node)) {
    const stateRef = stateCondition(node.condition, env)
    if (stateRef) {
      return { t: "if", state: stateRef, then: toChildren(evalExpr(node.whenTrue, env, ctx), ctx), else: toChildren(evalExpr(node.whenFalse, env, ctx), ctx) }
    }
    /* `cond && !children ? <Default /> : children`: the user's content with a default, when cond holds. */
    let whenFalse = node.whenFalse
    while (ts.isParenthesizedExpression(whenFalse)) whenFalse = whenFalse.expression
    if (ts.isIdentifier(whenFalse) && isSlot(unwrapParam(env.get(whenFalse.text).value)) && /!\s*children\b|\bchildren\s*===?\s*(undefined|null)\b/.test(node.condition.getText())) {
      const probe = env.child(new Map([[whenFalse.text, undefined]]))
      const c = unwrapParam(evalExpr(node.condition, probe, ctx))
      const slot = unwrapParam(env.get(whenFalse.text).value)
      if (c === true) return SLOT(toChildren(evalExpr(node.whenTrue, env, ctx), ctx), slot.scoped)
      return slot
    }
    const dyn = readsDynamic(node.condition, env)
    const c = unwrapParam(evalExpr(node.condition, env, ctx))
    if (isUnknown(c)) {
      ctx.lose("conditional", `${short(node)} (condition unknown; false branch kept)`)
      return evalExpr(node.whenFalse, env, ctx)
    }
    if (dyn && !isSlotTypeCheck(node.condition)) ctx.lose("conditional", `${short(node.condition)} ? … : … (default props: ${c ? "first" : "second"} branch kept)`)
    return evalExpr(c ? node.whenTrue : node.whenFalse, env, ctx)
  }
  if (ts.isBinaryExpression(node)) {
    const op = node.operatorToken.kind
    if (op === ts.SyntaxKind.AmpersandAmpersandToken || op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) {
      const leftRaw = evalExpr(node.left, env, ctx)
      const left = unwrapParam(leftRaw)
      if (op === ts.SyntaxKind.QuestionQuestionToken) {
        if (isSlot(left)) {
          /* `children ?? <Default />`: the user's content, with a default when there is none. */
          const fb = evalExpr(node.right, env, ctx)
          return SLOT(toChildren(fb, ctx), left.scoped)
        }
        if (left === undefined || left === null) return evalExpr(node.right, env, ctx)
        return leftRaw
      }
      const dyn = readsDynamic(node.left, env)
      if (isUnknown(left)) {
        ctx.lose("conditional", `${short(node)} (condition unknown; dropped)`)
        return op === ts.SyntaxKind.AmpersandAmpersandToken ? undefined : evalExpr(node.right, env, ctx)
      }
      if (dyn && !(leftRaw && leftRaw.__hook)) ctx.lose("conditional", `${short(node).slice(0, 120)} (default props: ${(op === ts.SyntaxKind.AmpersandAmpersandToken) === !!left ? "kept" : "dropped"})`)
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) return left ? evalExpr(node.right, env, ctx) : left
      return left ? leftRaw : evalExpr(node.right, env, ctx)
    }
    if (op === ts.SyntaxKind.EqualsEqualsEqualsToken || op === ts.SyntaxKind.ExclamationEqualsEqualsToken) {
      const a = unwrapParam(evalExpr(node.left, env, ctx))
      const b = unwrapParam(evalExpr(node.right, env, ctx))
      if (isUnknown(a) || isUnknown(b)) return UNKNOWN(short(node), "compare")
      return op === ts.SyntaxKind.EqualsEqualsEqualsToken ? a === b : a !== b
    }
    if (op === ts.SyntaxKind.PlusToken) {
      const a = unwrapParam(evalExpr(node.left, env, ctx))
      const b = unwrapParam(evalExpr(node.right, env, ctx))
      if (isUnknown(a) || isUnknown(b)) return UNKNOWN(short(node), "plus")
      return a + b
    }
    return UNKNOWN(short(node), "binary")
  }
  if (ts.isPropertyAccessExpression(node)) {
    const obj = unwrapParam(evalExpr(node.expression, env, ctx))
    const key = node.name.text
    if (obj && obj.__props) return obj.values[key]
    if (obj && obj.__state) return { __stateRef: key, __state: true }
    if (Array.isArray(obj) && key === "join") return { __join: obj }
    if (obj && obj.__import) return UNKNOWN(short(node), "namespace")
    if (obj && typeof obj === "object" && !obj.__unknown && key in obj) return obj[key]
    return UNKNOWN(short(node), "property")
  }
  if (ts.isElementAccessExpression(node)) {
    const obj = unwrapParam(evalExpr(node.expression, env, ctx))
    const key = unwrapParam(evalExpr(node.argumentExpression, env, ctx))
    const dyn = readsDynamic(node.argumentExpression, env)
    if (obj && typeof obj === "object" && !isUnknown(obj) && (typeof key === "string" || typeof key === "number")) {
      if (dyn) ctx.lose("conditional", `${short(node)} (default props: ${JSON.stringify(key)})`)
      return obj[key]
    }
    return UNKNOWN(short(node), "element access")
  }
  if (ts.isCallExpression(node)) return evalCall(node, env, ctx)
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return { __fn: node, env, name: "(inline)" }
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) return evalJsx(node, env, ctx)
  return UNKNOWN(short(node), ts.SyntaxKind[node.kind])
}

/* `typeof children === "function"`: only the shape of the user's content, not a prop. */
function isSlotTypeCheck(cond) {
  return ts.isBinaryExpression(cond) && ts.isTypeOfExpression(cond.left)
}

/* `state.indeterminate ? a : b` inside a function of the part's state. */
function stateCondition(cond, env) {
  let n = cond
  let negate = false
  while (ts.isPrefixUnaryExpression(n) && n.operator === ts.SyntaxKind.ExclamationToken) {
    negate = !negate
    n = n.operand
  }
  if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression)) {
    const r = env.get(n.expression.text)
    if (r.found && r.value && r.value.__state) return { key: n.name.text, negate }
  }
  return null
}

function calleeName(node) {
  const c = node.expression
  if (ts.isIdentifier(c)) return c.text
  if (ts.isPropertyAccessExpression(c)) return c.getText()
  return null
}

function evalCall(node, env, ctx) {
  const name = calleeName(node)
  const args = node.arguments
  if (name === "cn" || name === "clsx" || name === "twMerge" || name === "cx") {
    const vals = args.map((a) => evalExpr(a, env, ctx))
    return classOf(vals, ctx, short(node))
  }
  if (name === "withClass") {
    const base = evalExpr(args[0], env, ctx)
    const theirs = unwrapParam(evalExpr(args[1], env, ctx))
    if (theirs && theirs.__fn) ctx.lose("class-function", `${short(args[1])}: class as a function of state`)
    return classOf([base, typeof theirs === "string" ? theirs : undefined], ctx, short(node))
  }
  if (name === "mapChildren") {
    const children = evalExpr(args[0], env, ctx)
    const fn = evalExpr(args[1], env, ctx)
    return callFn(fn, [children], ctx)
  }
  if (name === "React.Children.map" || name === "Children.map") {
    const content = evalExpr(args[0], env, ctx)
    const fnNode = args[1]
    /* If the callback can hand a child back unchanged, the user's content still renders (only the
       wrapping is lost). Otherwise it is a copy of the content, which we cannot make. */
    const passthrough = fnNode && /[:?]\s*child\s*[),]?\s*$|return child\b|:\s*child\b/.test(fnNode.getText())
    if (isSlot(content) && passthrough) {
      ctx.lose("children-transform", `${short(node)}: React.Children.map rewrites some children; they render unchanged`)
      return content
    }
    ctx.lose("children-copy", `${short(node)}: a copy of the user's content (React.Children.map); not rendered`)
    return undefined
  }
  if (name === "useSpeedStyle" || name === "withSpeed") {
    ctx.lose("speed-prop", "the speed prop (sets --kf-speed through React context for portalled parts); set --kf-speed in CSS instead")
    return undefined
  }
  if (name && /^(React\.)?use[A-Z]/.test(name)) return { __hook: name }
  if (name && name.endsWith(".join")) {
    const obj = unwrapParam(evalExpr(node.expression.expression, env, ctx))
    const sep = args[0] ? evalExpr(args[0], env, ctx) : ","
    if (Array.isArray(obj) && obj.every((x) => typeof x === "string")) return obj.join(sep)
    return UNKNOWN(short(node), "join")
  }
  if (name && name.endsWith(".map") && ts.isPropertyAccessExpression(node.expression)) {
    const obj = unwrapParam(evalExpr(node.expression.expression, env, ctx))
    const fn = evalExpr(args[0], env, ctx)
    if (Array.isArray(obj) && fn?.__fn) return obj.map((x, i) => callFn(fn, [x, i], ctx))
    return UNKNOWN(short(node), "map")
  }
  /* A call on the user's content (children(state)): still the user's content, as a function of state. */
  if (ts.isIdentifier(node.expression)) {
    const r = env.get(node.expression.text)
    if (r.found && isSlot(unwrapParam(r.value))) return SLOT(null, true)
  }
  const fn = evalExpr(node.expression, env, ctx)
  if (fn && fn.__fn) return callFn(fn, args.map((a) => evalExpr(a, env, ctx)), ctx)
  return UNKNOWN(short(node), "call " + name)
}

function classOf(vals, ctx, where) {
  const flat = []
  const walk = (v) => {
    v = unwrapParam(v)
    if (v == null || v === false || v === true) return
    if (typeof v === "string" || typeof v === "number") flat.push(String(v))
    else if (Array.isArray(v)) v.forEach(walk)
    else if (isUnknown(v)) ctx.lose("class-unknown", `${v.src} in ${where.slice(0, 80)}`)
    else if (v && typeof v === "object" && !v.__fn) for (const [k, c] of Object.entries(v)) c && flat.push(k)
  }
  vals.forEach(walk)
  return cn(flat.join(" "))
}

/* Calls a local function (a component or a helper) with values for its parameters. */
function callFn(fn, argVals, ctx, propsForComponent) {
  const node = fn.__fn
  const vars = new Map()
  node.parameters.forEach((p, i) => {
    const arg = argVals[i]
    if (ts.isIdentifier(p.name)) {
      vars.set(p.name.text, arg)
    } else if (ts.isObjectBindingPattern(p.name)) {
      const given = arg && arg.__props ? arg.values : {}
      const used = new Set()
      for (const el of p.name.elements) {
        if (el.dotDotDotToken) {
          const rest = {}
          for (const [k, v] of Object.entries(given)) if (!used.has(k)) rest[k] = v
          vars.set(el.name.text, { __props: true, values: rest, top: !!(arg && arg.top) })
          continue
        }
        const key = (el.propertyName ?? el.name).getText()
        used.add(key)
        let v = given[key]
        if (v === undefined && el.initializer) v = evalExpr(el.initializer, fn.env, ctx)
        /* Remember which names are props, so conditions on them are reported. */
        if (key === "children" || key === "className") vars.set(el.name.text, v)
        else vars.set(el.name.text, { __param: key, value: v })
      }
    }
  })
  const env = fn.env.child(vars)
  if (ts.isBlock(node.body)) return evalBlock(node.body, env, ctx)
  return evalExpr(node.body, env, ctx)
}

function evalBlock(block, env, ctx) {
  for (const st of block.statements) {
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isArrayBindingPattern(d.name) && d.initializer && ts.isCallExpression(d.initializer)) {
          const hook = calleeName(d.initializer)
          if (/useState$/.test(hook ?? "")) {
            const [a, b] = d.name.elements
            const initial = evalExpr(d.initializer.arguments[0], env, ctx)
            if (a && ts.isBindingElement(a)) env.vars.set(a.name.text, { __hook: "state", name: a.name.text, initial })
            if (b && ts.isBindingElement(b)) env.vars.set(b.name.text, { __hook: "setter", of: a?.name?.text })
            continue
          }
        }
        if (ts.isIdentifier(d.name) && d.initializer) {
          const v = evalExpr(d.initializer, env, ctx)
          if (v && v.__hook) ctx.lose("js", `${short(d)}`)
          env.vars.set(d.name.text, v)
        } else ctx.lose("js", short(d))
      }
    } else if (ts.isExpressionStatement(st)) {
      readEffect(st.expression, env, ctx)
    } else if (ts.isReturnStatement(st)) {
      return evalExpr(st.expression, env, ctx)
    } else if (ts.isIfStatement(st)) {
      ctx.lose("js", `early branch: ${short(st)}`)
    } else if (ts.isFunctionDeclaration(st)) {
      env.vars.set(st.name.text, { __fn: st, env, name: st.name.text })
    }
  }
  return undefined
}

/* The one effect pattern we carry: `useEffect(() => { const t = setTimeout(() => setX(true), N); return … }, [])`,
   which holds transitions until UI SDK has measured. Every other effect is reported as lost. */
function readEffect(expr, env, ctx) {
  if (!ts.isCallExpression(expr)) return
  const name = calleeName(expr)
  const text = expr.getText()
  if (/useEffect$|useLayoutEffect$/.test(name ?? "")) {
    const m = text.match(/setTimeout\(\s*\(\)\s*=>\s*(\w+)\(true\)\s*,\s*(\d+)\s*\)/)
    const deps = expr.arguments[1]
    if (m && deps && ts.isArrayLiteralExpression(deps) && deps.elements.length === 0) {
      const setter = env.get(m[1])
      const stateName = setter.found ? setter.value.of : null
      if (stateName) {
        ctx.behaviors.push({ kind: "ready-after", state: stateName, ms: Number(m[2]) })
        return
      }
    }
    ctx.lose("js", `${name}: ${text.replace(/\s+/g, " ").slice(0, 140)}`)
    return
  }
  ctx.lose("js", text.replace(/\s+/g, " ").slice(0, 140))
}

/* ---------- JSX ---------- */

function toChildren(v, ctx) {
  const out = []
  const walk = (x) => {
    x = unwrapParam(x)
    if (x == null || x === false || x === true) return
    if (Array.isArray(x)) return x.forEach(walk)
    if (typeof x === "string" || typeof x === "number") return out.push({ t: "text", value: String(x) })
    if (isSlot(x)) return out.push({ t: "slot", fallback: x.fallback ?? null, scoped: !!x.scoped })
    if (isNode(x)) return out.push(x)
    if (x.__fn) {
      /* A function of the part's state as content: evaluate it with a symbolic state. */
      const body = callFn(x, [{ __state: true }], ctx)
      const kids = toChildren(body, ctx)
      if (!kids.length) return
      return out.push({ t: "stateFn", children: kids })
    }
    if (isUnknown(x)) {
      ctx.lose("children-unknown", x.src)
      return
    }
  }
  walk(v)
  return out
}

function jsxTagName(node) {
  const tag = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName
  return tag.getText()
}

function jsxAttributes(node) {
  return ts.isJsxElement(node) ? node.openingElement.attributes : node.attributes
}

function evalJsx(node, env, ctx) {
  if (ts.isJsxFragment(node)) return node.children.flatMap((c) => jsxChild(c, env, ctx))
  const tag = jsxTagName(node)
  const attrs = {}
  let spread = null
  let spreadTop = false
  for (const a of jsxAttributes(node).properties) {
    if (ts.isJsxSpreadAttribute(a)) {
      const v = evalExpr(a.expression, env, ctx)
      if (v && v.__props) {
        spread = { ...(spread ?? {}), ...v.values }
        if (v.top) spreadTop = true
      } else if (v && typeof v === "object" && !Array.isArray(v) && !isUnknown(v) && !isSlot(v) && !isNode(v) && Object.values(v).every((x) => ["string", "number", "boolean"].includes(typeof x))) {
        /* A const object of plain attributes (an icon's svg attributes). */
        spread = { ...(spread ?? {}), ...v }
      } else ctx.lose("js", `spread ${short(a)}`)
      continue
    }
    const key = a.name.getText()
    if (!a.initializer) attrs[key] = true
    else if (ts.isStringLiteral(a.initializer)) attrs[key] = a.initializer.text
    else if (ts.isJsxExpression(a.initializer)) attrs[key] = evalExpr(a.initializer.expression, env, ctx)
  }
  let children
  if (ts.isJsxElement(node)) {
    const kids = node.children.flatMap((c) => jsxChild(c, env, ctx))
    if (kids.length) children = kids.length === 1 ? kids[0] : kids
  }
  if (children === undefined && attrs.children !== undefined) children = attrs.children
  delete attrs.children

  /* <style href="kf-…">: CSS the component needs once on the page. */
  if (tag === "style") {
    const css = (Array.isArray(children) ? children : [children]).map((c) => unwrapParam(c)).map((c) => (c && c.t === "text" ? c.value : typeof c === "string" ? c : "")).join("")
    ctx.styles.set(attrs.href ?? `style-${ctx.styles.size}`, css)
    return []
  }

  if (/^[a-z]/.test(tag)) {
    const props = { ...(spread ?? {}), ...attrs }
    if (props.children !== undefined && children === undefined) children = props.children
    delete props.children
    const cls = props.className
    delete props.className
    if (cls && cls.__fn) ctx.lose("class-function", `<${tag}> class is a function of state`)
    const el = { t: "el", tag, class: typeof cls === "string" ? cls : "", attrs: cleanAttrs(props, ctx, tag), children: toChildren(children, ctx) }
    if (spreadTop) el.receivesProps = true
    return el
  }

  const target = resolveComponent(tag, env)
  const props = { ...attrs }
  if (spread) Object.assign(props, spread, attrs)
  if (children !== undefined) props.children = children
  if (target.kind === "transparent") return toChildren(props.children, ctx)
  if (target.kind === "fn") {
    const childCtxEnv = target.env
    const result = callFn({ __fn: target.node, env: childCtxEnv, name: tag }, [{ __props: true, values: props, top: spreadTop }], ctx)
    /* Remember that the user's props reach this node. */
    return result
  }
  if (target.kind === "sdk") {
    const p = { ...props }
    const kids = p.children
    delete p.children
    const cls = p.className
    delete p.className
    if (cls && cls.__fn) ctx.lose("class-function", `${tag}: class is a function of state`)
    const slot = kebab(target.name)
    const n = {
      t: "part",
      name: target.name,
      module: target.module,
      slot,
      slotDocumented: documentedSlots.has(slot),
      class: typeof cls === "string" ? cls : "",
      attrs: cleanAttrs(p, ctx, target.name),
      children: toChildren(kids, ctx),
    }
    if (spreadTop) n.receivesProps = true
    return n
  }
  ctx.lose("element", `<${tag}> (${target.why ?? "unresolved"})`)
  return []
}

function jsxChild(c, env, ctx) {
  if (ts.isJsxText(c)) {
    const t = c.text.replace(/\s+/g, " ")
    return t.trim() ? [{ t: "text", value: t.trim() }] : []
  }
  if (ts.isJsxExpression(c)) {
    if (!c.expression) return []
    const v = evalExpr(c.expression, env, ctx)
    return [v]
  }
  return [evalJsx(c, env, ctx)]
}

/* Attributes we can carry: plain values. State-driven ones are noted as behaviour. */
/* Props of the exported part that pick a look (variant, size): set while extracting one part. */
let variantParams = new Set()

/* `variant = "default"` in the part's parameters, and the values the file compares it with. */
function findVariants(fnNode, info) {
  const p = fnNode.parameters[0]
  if (!p || !ts.isObjectBindingPattern(p.name)) return []
  const out = []
  for (const el of p.name.elements) {
    if (el.dotDotDotToken || !el.initializer || !ts.isStringLiteral(el.initializer)) continue
    const name = el.name.text
    const values = new Set([el.initializer.text])
    for (const m of info.text.matchAll(new RegExp(`\\b${name}\\s*[!=]==\\s*"([\\w-]+)"`, "g"))) values.add(m[1])
    for (const m of info.text.matchAll(new RegExp(`(\\w+)\\[${name}\\]`, "g"))) {
      const d = info.decls.get(m[1])
      if (d?.kind === "const" && ts.isObjectLiteralExpression(d.node))
        for (const prop of d.node.properties) if (prop.name) values.add(prop.name.getText().replace(/^["']|["']$/g, ""))
    }
    if (values.size > 1) out.push({ name, default: el.initializer.text, values: [...values] })
  }
  return out
}

function cleanAttrs(props, ctx, where) {
  const out = {}
  for (let [k, v] of Object.entries(props)) {
    if (k === "key" || k === "ref" || k === "style") {
      if (k === "style" && v !== undefined) ctx.lose("style", `${where}: style attribute`)
      continue
    }
    const fromParam = v && typeof v === "object" && v.__param ? v.__param : null
    v = unwrapParam(v)
    if (v === undefined) continue
    if (fromParam && variantParams.has(fromParam) && typeof v === "string") out[k] = { param: fromParam, value: v }
    else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") out[k] = v
    else if (v && v.__hook === "state") out[k] = { state: v.name, initial: v.initial }
    else if (isUnknown(v) && /\|\|\s*undefined/.test(v.src)) out[k] = { state: v.src.split("||")[0].trim() }
    else if (v && v.__fn) ctx.lose(k === "render" ? "render-prop" : "handler", k === "render" ? `${where}: a custom render function (${short(v.__fn).slice(0, 100)})` : `${where}: ${k} is a function`)
    else ctx.lose("attr", `${where}: ${k}=${isUnknown(v) ? v.src : typeof v}`)
  }
  return out
}

function resolveComponent(tag, env) {
  const local = env.get(tag)
  if (local.found && local.value?.__fn) return { kind: "fn", node: local.value.__fn, env: local.value.env }
  const info = env.file
  const d = info.decls.get(tag)
  if (d?.kind === "fn") return { kind: "fn", node: d.node, env: new Env(info) }
  const imp = info.imports.get(tag)
  if (!imp) return { kind: "unknown", why: "not imported" }
  return resolveImported(imp.module, imp.name)
}

function resolveImported(mod, name) {
  if (mod.startsWith("@ui-sdk/react/")) return { kind: "sdk", module: mod, name }
  if (mod === "@/lib/keyframery" && name === "Speed") return { kind: "transparent" }
  const file = resolveImportPath(mod)
  if (!file) return { kind: "unknown", why: `from ${mod}` }
  const info = loadFile(file)
  if (!info) return { kind: "unknown", why: `missing ${mod}` }
  const exp = info.namedExports.find((e) => e.name === name)
  const local = exp?.local ?? name
  if (exp?.module) return resolveImported(exp.module, local)
  const d = info.decls.get(local)
  if (d?.kind === "fn") return { kind: "fn", node: d.node, env: new Env(info) }
  /* Not wrapped here: a re-export from UI SDK (or from the primitive). */
  for (const star of info.starExports) {
    if (star.startsWith("@ui-sdk/react/")) {
      if (exportsOf(star).has(name)) return { kind: "sdk", module: star, name }
    } else {
      const r = resolveImported(star, name)
      if (r.kind !== "unknown") return r
    }
  }
  return { kind: "unknown", why: `${name} not found in ${mod}` }
}

/* ---------- per component ---------- */

const flourishWords = /--kf-flourish/

function collectSlots(nodes, out, path = []) {
  for (const n of nodes ?? []) {
    if (!n || typeof n !== "object") continue
    if (n.t === "part" || n.t === "el") {
      const slot = n.t === "part" ? n.slot : n.attrs?.["data-slot"]
      if (slot && n.class) {
        out[slot] = out[slot] ? cn(out[slot], n.class) : n.class
      }
      collectSlots(n.children, out)
    } else if (n.t === "slot") collectSlots(n.fallback, out)
    else if (n.t === "if") {
      collectSlots(n.then, out)
      collectSlots(n.else, out)
    } else if (n.t === "stateFn") collectSlots(n.children, out)
  }
}

function extrasOf(nodes, out = []) {
  for (const n of nodes ?? []) {
    if (!n || typeof n !== "object") continue
    if (n.t === "el" && !n.attrs?.["data-slot"]) out.push(`<${n.tag}${n.class ? ` class="${n.class.slice(0, 40)}…"` : ""}>`)
    if (n.t === "part" || n.t === "el") extrasOf(n.children, out)
    if (n.t === "slot") extrasOf(n.fallback, out)
    if (n.t === "if") (extrasOf(n.then, out), extrasOf(n.else, out))
    if (n.t === "stateFn") extrasOf(n.children, out)
  }
  return out
}

export function extract(slug) {
  const uiFile = path.join(src, "components/ui", slug + ".tsx")
  const primFile = path.join(src, "components/primitives", slug + ".tsx")
  const ui = loadFile(uiFile)
  const prim = loadFile(primFile)
  const module = `@ui-sdk/react/${slug}`
  const result = { slug, module, parts: {}, slots: {}, styles: {}, passthrough: [], lost: [] }

  /* Which names the styled file exports (ours), excluding helpers and types. */
  const exportNames = new Set()
  for (const e of ui.namedExports) if (/^[A-Z]/.test(e.name) && !e.module) exportNames.add(e.name)
  /* Parts the primitive adds of its own (ButtonArrow, ResizableGrip, Roll), exported by the ui file
     through its import or its `export * from "@/components/primitives/<slug>"`. */
  if (ui.starExports.includes(`@/components/primitives/${slug}`) || [...exportNames].some((n) => !ui.decls.has(n)))
    for (const e of prim.namedExports) if (/^[A-Z]/.test(e.name) && !e.module && prim.decls.get(e.local)?.kind === "fn" && (!ui.decls.has(e.name) || exportNames.has(e.name)) && (exportNames.has(e.name) || ui.starExports.includes(`@/components/primitives/${slug}`))) exportNames.add(e.name)

  for (const name of [...exportNames].sort()) {
    const file = ui.decls.has(name) ? ui : prim
    const d = file.decls.get(name)
    if (!d || d.kind !== "fn") continue
    const ctx = new Ctx(name)
    const variants = findVariants(d.node, file)
    variantParams = new Set(variants.map((v) => v.name))
    let tree
    try {
      tree = callFn({ __fn: d.node, env: new Env(file), name }, [{ __props: true, values: { children: SLOT() }, top: true }], ctx)
    } catch (e) {
      ctx.lose("extractor-error", String(e?.stack ?? e).split("\n").slice(0, 3).join(" | "))
    }
    const nodes = toChildren(tree, ctx)
    if (!nodes.length) ctx.lose("not-generated", "renders from data or JS only (nothing static to carry); not generated")
    /* The user's props land on the node that received {...props}; mark it if nothing did. */
    const rootNode = findPropsNode(nodes) ?? nodes.find((n) => n.t === "part" || n.t === "el")
    if (rootNode) rootNode.receivesProps = true
    for (const [href, css] of ctx.styles) result.styles[href] = css
    const slots = {}
    collectSlots(nodes, slots)
    const extras = extrasOf(nodes)
    if (extras.length) ctx.lose("extra-elements", `renders ${extras.join(", ")} (carried by the framework wrappers; a stylesheet alone cannot add them)`)
    for (const b of ctx.behaviors) ctx.lose("js-carried", `${b.kind} ${b.state} after ${b.ms}ms (carried by the framework wrappers; CSS uses [data-activation-direction] instead)`)
    /* Each other value of a variant prop: its tree, so the wrappers can take the same prop. */
    const variantTrees = {}
    for (const v of variants) {
      variantTrees[v.name] = { default: v.default, values: {} }
      for (const value of v.values) {
        if (value === v.default) continue
        const vctx = new Ctx(name)
        const vt = toChildren(callFn({ __fn: d.node, env: new Env(file), name }, [{ __props: true, values: { children: SLOT(), [v.name]: value }, top: true }], vctx), vctx)
        const vr = findPropsNode(vt) ?? vt.find((n) => n.t === "part" || n.t === "el")
        if (vr) vr.receivesProps = true
        variantTrees[v.name].values[value] = vt
        for (const [href, css] of vctx.styles) result.styles[href] = css
      }
    }
    /* Every combination of the variant props (Button: variant × size), so a wrapper can pick the exact
       classes React's cn gives each pair. Keys join the values in the order of `matrix.props`. */
    let matrix = null
    if (variants.length) {
      matrix = { props: variants.map((v) => v.name), trees: {} }
      const combos = variants.reduce((acc, v) => acc.flatMap((c) => v.values.map((value) => [...c, value])), [[]])
      for (const combo of combos) {
        const mctx = new Ctx(name)
        const values = { children: SLOT() }
        variants.forEach((v, i) => (values[v.name] = combo[i]))
        const mt = toChildren(callFn({ __fn: d.node, env: new Env(file), name }, [{ __props: true, values, top: true }], mctx), mctx)
        const mr = findPropsNode(mt) ?? mt.find((n) => n.t === "part" || n.t === "el")
        if (mr) mr.receivesProps = true
        matrix.trees[combo.join("|")] = mt
      }
    }
    /* With your own element (`render`), some parts drop their key look for a plain focus ring
       (PopoverTrigger, DialogClose…): the root's classes then, for the wrappers' #render slot. */
    let renderClass
    if (/props\.render/.test(d.node.getText())) {
      try {
        const rctx = new Ctx(name)
        const rt = toChildren(callFn({ __fn: d.node, env: new Env(file), name }, [{ __props: true, values: { children: SLOT(), render: "render" }, top: true }], rctx), rctx)
        const rr = findPropsNode(rt) ?? rt.find((n) => n.t === "part" || n.t === "el")
        if (rr && rr.class !== rootNode?.class) renderClass = rr.class ?? ""
      } catch {}
    }
    if (variants.length) {
      ctx.lost = ctx.lost.filter((l) => !(l.kind === "conditional" && variants.some((v) => l.detail.includes(v.name))))
      ctx.lose("variants", `carried as the ${variants.map((v) => `${v.name} prop (${v.values.join(", ")})`).join(", ")}; the web stylesheet matches data-variant on the part (set it yourself on the element)`)
    }
    variantParams = new Set()
    result.parts[name] = {
      export: name,
      variants: variantTrees,
      ...(matrix ? { matrix } : {}),
      ...(renderClass !== undefined ? { renderClass } : {}),
      root: rootNode ? (rootNode.t === "part" ? { part: rootNode.name, slot: rootNode.slot, module: rootNode.module } : { element: rootNode.tag, slot: rootNode.attrs?.["data-slot"] ?? null }) : null,
      tree: nodes,
      behaviors: ctx.behaviors,
      lost: ctx.lost,
    }
    for (const [s, c] of Object.entries(slots)) result.slots[s] = result.slots[s] ? cn(result.slots[s], c) : c
  }

  /* UI SDK parts this component's module exports that we never wrap: passed through unchanged. */
  const wrapped = new Set(Object.values(result.parts).map((p) => p.root?.part).filter(Boolean))
  for (const n of exportsOf(module)) if (/^[A-Z]/.test(n) && !wrapped.has(n) && !/Props$|State$|Controller$|Data$|Options$|Item$|Reason$|Details$|Event$/.test(n) && !exportNames.has(n)) result.passthrough.push(n)

  /* The trees before any adaptation, for wrappers that can render what the adaptation removed
     (the Vue tabs render the clipped copy of the labels). */
  if (adaptations[slug]) result.original = structuredClone(result.parts)
  applyAdaptations(result)

  const kinds = {}
  for (const p of Object.values(result.parts)) for (const l of p.lost) kinds[l.kind] = (kinds[l.kind] ?? 0) + 1
  result.lostKinds = kinds
  result.flourish = Object.values(result.slots).some((c) => flourishWords.test(c))
  return result
}

/* ---------- adaptations ----------
   Hand-written, per component, for what the static extraction finds it cannot carry and what would
   otherwise look broken outside React. Each one is listed in the JSON under `adaptations`. */

function eachNode(nodes, fn) {
  for (const n of nodes ?? []) {
    if (!n || typeof n !== "object") continue
    fn(n)
    eachNode(n.children, fn)
    eachNode(n.fallback, fn)
    eachNode(n.then, fn)
    eachNode(n.else, fn)
  }
}

function addToSlot(r, slot, extra, replace = []) {
  const edit = (cls) => {
    let c = cls.split(/\s+/).filter((x) => x && !replace.includes(x)).join(" ")
    return cn(c, extra)
  }
  for (const p of Object.values(r.parts))
    eachNode(p.tree, (n) => {
      const s = n.t === "part" ? n.slot : n.attrs?.["data-slot"]
      if (s === slot) n.class = edit(n.class)
    })
  if (r.slots[slot]) r.slots[slot] = edit(r.slots[slot])
}

/* The key (indicator) carries a copy of the labels in the selected colour, built with
   React.Children.map. Without the copy the key would cover the labels, so outside React the key sits
   under the labels (-z-10 inside the list's isolated stacking context) and the selected label takes
   the selected colour itself. What is lost: the label colour wiping across as the key passes. */
function keyUnderLabels(r, { indicatorSlot, itemSlot, ink }) {
  for (const p of Object.values(r.parts))
    eachNode(p.tree, (n) => {
      if (n.t === "part" && n.slot === indicatorSlot) n.children = n.children.filter((c) => !(c.t === "el" && /overflow-hidden/.test(c.class)))
    })
  addToSlot(r, indicatorSlot, "-z-10", ["z-10"])
  addToSlot(r, itemSlot, `data-selected:text-[color:${ink}] data-checked:text-[color:${ink}] data-selected:hover:bg-transparent data-checked:hover:bg-transparent`)
  for (const p of Object.values(r.parts)) {
    p.lost = p.lost.filter((l) => l.kind !== "children-copy" && !(l.kind === "extra-elements" && /overflow-hidden/.test(l.detail)))
    if (p.tree.some((n) => n.t === "part" && n.slot !== indicatorSlot && JSON.stringify(n).includes(`"${indicatorSlot}"`)))
      p.lost.push({ kind: "adapted", detail: `the clipped copy of the labels inside the key is not rendered; the key sits under the labels and the selected label changes colour instead (no colour wipe as the key passes)` })
  }
  r.adaptations.push(`${indicatorSlot}: key under the labels (-z-10) instead of a clipped copy of the labels; ${itemSlot}: selected colour on the label itself`)
}

const adaptations = {
  tabs: (r) => keyUnderLabels(r, { indicatorSlot: "tabs-indicator", itemSlot: "tabs-tab", ink: "var(--tabs-selected-ink,var(--foreground))" }),
  "segmented-control": (r) =>
    keyUnderLabels(r, { indicatorSlot: "segmented-control-indicator", itemSlot: "segmented-control-item", ink: "var(--segmented-control-selected-ink,var(--foreground))" }),
}

function applyAdaptations(r) {
  r.adaptations = []
  adaptations[r.slug]?.(r)
}

function findPropsNode(nodes) {
  for (const n of nodes ?? []) {
    if (!n || typeof n !== "object") continue
    if ((n.t === "part" || n.t === "el") && n.receivesProps) return n
    const inner = findPropsNode(n.children ?? n.fallback ?? [])
    if (inner) return inner
  }
  return null
}

/* What a stylesheet alone (web components) and what a wrapper (vue/svelte/solid) cannot carry. */
function summarize(r) {
  const byKind = {}
  for (const p of Object.values(r.parts)) for (const l of p.lost) (byKind[l.kind] ??= []).push(`${p.export}: ${l.detail}`)
  const wrapperLoss = Object.entries(byKind).filter(([k]) => !["extra-elements", "js-carried", "variants"].includes(k))
  const cssLoss = Object.entries(byKind).filter(([k]) => k !== "variants")

  return {
    parts: Object.keys(r.parts).length,
    slots: Object.keys(r.slots).length,
    keyframes: Object.keys(r.styles),
    carriesFully: { wrappers: wrapperLoss.length === 0, css: cssLoss.length === 0 },
    lost: byKind,
  }
}

function main() {
  const args = process.argv.slice(2)
  const slugs = args.length ? args : nativeSlugs()
  fs.mkdirSync(outDir, { recursive: true })
  const summary = { generated: new Date().toISOString(), count: slugs.length, components: {} }
  for (const slug of slugs) {
    const r = extract(slug)
    fs.writeFileSync(path.join(outDir, slug + ".json"), JSON.stringify(r, null, 2) + "\n")
    summary.components[slug] = summarize(r)
  }
  if (!args.length) {
    const c = Object.values(summary.components)
    summary.totals = {
      wrappersCarryFully: c.filter((x) => x.carriesFully.wrappers).length,
      cssCarriesFully: c.filter((x) => x.carriesFully.css).length,
    }
    fs.writeFileSync(path.join(outDir, "_summary.json"), JSON.stringify(summary, null, 2) + "\n")
  }
  for (const [slug, s] of Object.entries(summary.components)) {
    const kinds = Object.entries(s.lost).map(([k, v]) => `${k}×${v.length}`).join(" ")
    console.log(`${slug.padEnd(20)} parts ${String(s.parts).padStart(2)}  slots ${String(s.slots).padStart(2)}  ${kinds || "carries fully"}`)
  }
  if (summary.totals) console.log(summary.totals)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
