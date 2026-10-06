/* Theme page settings: defaults, URL encoding, and the code to copy. No imports, so unit tests load it directly. */

export const GROUPS = {
  dialog: ["rack-focus", "punch-in", "fade", "none"],
  sheet: ["slide-sink", "slide", "fade", "none"],
  drawer: ["slide-sink", "none"],
  tabs: ["j-cut", "whip", "fade", "none"],
  toast: ["cut-on-action", "none"],
} as const
export type Group = keyof typeof GROUPS

export const EASES: Record<string, { label: string; value: string }> = {
  keyframery: { label: "Keyframery", value: "cubic-bezier(0.22, 1, 0.36, 1)" },
  snappy: { label: "Snappy", value: "cubic-bezier(0.2, 0.9, 0.1, 1)" },
  gentle: { label: "Gentle", value: "cubic-bezier(0.4, 0, 0.2, 1)" },
  ease: { label: "CSS ease", value: "ease" },
}
export const EXIT_EASES: Record<string, { label: string; value: string }> = {
  keyframery: { label: "Keyframery", value: "cubic-bezier(0.5, 0, 0.75, 0)" },
  quick: { label: "Quick", value: "cubic-bezier(0.4, 0, 1, 1)" },
  ease: { label: "CSS ease", value: "ease" },
}

/** The seven variables: numeric ones have a range; eases are preset keys. */
export const VARS = {
  pace: { label: "Pace", min: 0.5, max: 3, step: 0.1, unit: "", css: "--kf-pace" },
  ease: { label: "Easing in", presets: EASES, css: "--kf-ease" },
  easeExit: { label: "Easing out", presets: EXIT_EASES, css: "--kf-ease-exit" },
  travel: { label: "Travel", min: 0, max: 1, step: 0.05, unit: "", css: "--kf-travel" },
  blur: { label: "Blur", min: 0, max: 20, step: 1, unit: "px", css: "--kf-blur" },
  depth: { label: "Depth", min: 0.8, max: 1, step: 0.01, unit: "", css: "--kf-depth" },
  hold: { label: "Skeleton hold", min: 0, max: 1000, step: 50, unit: "ms", css: "--kf-hold" },
} as const
export type Var = keyof typeof VARS

export type ThemeSettings = { menus: Record<Group, string>; vars: Record<Var, number | string> }

export const DEFAULTS: ThemeSettings = {
  menus: { dialog: "rack-focus", sheet: "slide-sink", drawer: "slide-sink", tabs: "j-cut", toast: "cut-on-action" },
  vars: { pace: 1, ease: "keyframery", easeExit: "keyframery", travel: 0.35, blur: 8, depth: 0.94, hold: 300 },
}

const groups = Object.keys(GROUPS) as Group[]
const vars = Object.keys(VARS) as Var[]

export function encode(s: ThemeSettings): string {
  const q = new URLSearchParams()
  for (const g of groups) if (s.menus[g] !== DEFAULTS.menus[g]) q.set(g, s.menus[g])
  for (const v of vars) if (s.vars[v] !== DEFAULTS.vars[v]) q.set(v, String(s.vars[v]))
  return q.toString()
}

export function decode(query: string): ThemeSettings {
  const q = new URLSearchParams(query)
  const out: ThemeSettings = { menus: { ...DEFAULTS.menus }, vars: { ...DEFAULTS.vars } }
  for (const g of groups) {
    const v = q.get(g)
    if (v && (GROUPS[g] as readonly string[]).includes(v)) out.menus[g] = v
  }
  for (const v of vars) {
    const raw = q.get(v)
    if (raw === null) continue
    const def = VARS[v]
    if ("presets" in def) {
      if (raw in def.presets) out.vars[v] = raw
    } else {
      const n = Number(raw)
      if (Number.isFinite(n) && n >= def.min && n <= def.max) out.vars[v] = n
    }
  }
  return out
}

/** The CSS value of one variable. */
export function cssValue(v: Var, value: number | string): string {
  const def = VARS[v]
  if ("presets" in def) return def.presets[String(value)]?.value ?? String(value)
  return `${value}${def.unit}`
}

export function toCode(s: ThemeSettings): { jsx: string; css: string } {
  const props = groups.filter((g) => s.menus[g] !== DEFAULTS.menus[g]).map((g) => `${g}="${s.menus[g]}"`)
  if (s.vars.pace !== DEFAULTS.vars.pace) props.push(`pace={${s.vars.pace}}`)
  const jsx = props.length ? `<Cuts ${props.join(" ")} />` : "<Cuts />"
  const lines = vars.filter((v) => v !== "pace" && s.vars[v] !== DEFAULTS.vars[v]).map((v) => `  ${VARS[v].css}: ${cssValue(v, s.vars[v])};`)
  return { jsx, css: lines.length ? `:root {\n${lines.join("\n")}\n}` : "" }
}
