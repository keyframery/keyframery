/* Shared motion themes, legacy share links and installation output. Kept independent of the app runtime. */

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

function profile(label: string, description: string, settings: ThemeSettings) {
  Object.freeze(settings.menus)
  Object.freeze(settings.vars)
  return Object.freeze({ label, description, settings: Object.freeze(settings) })
}

/** Complete starting points. Copy menus and vars before editing a profile. */
export const PROFILES = {
  quiet: profile("Quiet", "Short fades with less movement. Keeps attention on the content.", {
    menus: { dialog: "fade", sheet: "fade", drawer: "none", tabs: "fade", toast: "none" },
    vars: { pace: 0.9, ease: "gentle", easeExit: "ease", travel: 0.15, blur: 2, depth: 0.98, hold: 300 },
  }),
  crisp: profile("Crisp", "Fast, decisive transitions for everyday app work.", {
    menus: { dialog: "punch-in", sheet: "slide", drawer: "none", tabs: "whip", toast: "cut-on-action" },
    vars: { pace: 0.8, ease: "snappy", easeExit: "quick", travel: 0.2, blur: 4, depth: 0.97, hold: 200 },
  }),
  expressive: profile("Expressive", "Action-linked entrances, background depth and sequenced tabs.", {
    menus: { ...DEFAULTS.menus },
    vars: { ...DEFAULTS.vars },
  }),
} as const
export type Profile = keyof typeof PROFILES

export function profileOf(settings: ThemeSettings): Profile | null {
  return (Object.keys(PROFILES) as Profile[]).find((key) => {
    const pick = PROFILES[key].settings
    return groups.every((g) => settings.menus[g] === pick.menus[g]) && vars.every((v) => settings.vars[v] === pick.vars[v])
  }) ?? null
}

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
      if (Object.hasOwn(def.presets, raw)) out.vars[v] = raw
    } else {
      if (!raw.trim()) continue
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

function objectAt(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path} must be an object.`)
  return value as Record<string, unknown>
}

function fields(value: Record<string, unknown>, required: readonly string[], optional: readonly string[], path: string): void {
  for (const key of Object.keys(value)) {
    if (!required.includes(key) && !optional.includes(key)) throw new Error(`Unknown field ${path}.${key}.`)
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) throw new Error(`Missing field ${path}.${key}.`)
  }
}

/** Strict imports never partly apply an invalid theme or silently inherit newer defaults. */
export function parseTheme(text: string): ThemeSettings {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("This file is not valid JSON. Import a Keyframery theme exported by the builder.")
  }
  const file = objectAt(parsed, "theme")
  fields(file, ["version", "settings"], ["name"], "theme")
  if (file.version !== 1) throw new Error("Unsupported theme version. This builder supports version 1.")
  if (Object.hasOwn(file, "name") && (typeof file.name !== "string" || !file.name.trim() || file.name.length > 80)) {
    throw new Error("theme.name must be a non-empty string of at most 80 characters.")
  }
  const settings = objectAt(file.settings, "theme.settings")
  fields(settings, ["menus", "vars"], [], "theme.settings")
  const menus = objectAt(settings.menus, "theme.settings.menus")
  const values = objectAt(settings.vars, "theme.settings.vars")
  fields(menus, groups, [], "theme.settings.menus")
  fields(values, vars, [], "theme.settings.vars")

  const out: ThemeSettings = { menus: { ...DEFAULTS.menus }, vars: { ...DEFAULTS.vars } }
  for (const g of groups) {
    const value = menus[g]
    if (typeof value !== "string" || !(GROUPS[g] as readonly string[]).includes(value)) {
      throw new Error(`theme.settings.menus.${g} must be one of: ${GROUPS[g].join(", ")}.`)
    }
    out.menus[g] = value
  }
  for (const v of vars) {
    const value = values[v]
    const def = VARS[v]
    if ("presets" in def) {
      if (typeof value !== "string" || !Object.hasOwn(def.presets, value)) {
        throw new Error(`theme.settings.vars.${v} must be one of: ${Object.keys(def.presets).join(", ")}.`)
      }
    } else if (typeof value !== "number" || !Number.isFinite(value) || value < def.min || value > def.max) {
      throw new Error(`theme.settings.vars.${v} must be a number from ${def.min} to ${def.max}.`)
    }
    out.vars[v] = value as number | string
  }
  return out
}

/** A complete, versioned file; unlike a share URL it never relies on omitted defaults. */
export function serializeTheme(settings: ThemeSettings, name?: string): string {
  const file = { version: 1, ...(name !== undefined ? { name: name.trim() } : {}), settings }
  const text = JSON.stringify(file, null, 2)
  const validated = parseTheme(text)
  return JSON.stringify({ ...file, settings: validated }, null, 2)
}

/** Complete Next.js handoff, with equivalent mounting locations for other React apps. */
export function toInstall(settings: ThemeSettings): string {
  const { jsx, css } = toCode(settings)
  return [
    "Start with a project that already has shadcn/ui and components.json configured.",
    "",
    "1. Install the motion layer:",
    "```bash",
    "npx shadcn add @keyframery/cuts",
    "```",
    'If the CLI answers `Unknown registry "@keyframery"`, run `npx shadcn registry add "@keyframery=https://keyframery.com/r/{name}.json"` once, then install again.',
    "",
    "2. Keep your existing root layout and render the selected Cuts configuration once after its content:",
    "```tsx",
    '// app/layout.tsx (Next.js)',
    'import type { ReactNode } from "react"',
    'import { Cuts } from "@/components/keyframery/cuts"',
    'import "./globals.css"',
    "",
    "export default function RootLayout({ children }: { children: ReactNode }) {",
    "  return (",
    '    <html lang="en">',
    "      <body>",
    "        {children}",
    `        ${jsx}`,
    "      </body>",
    "    </html>",
    "  )",
    "}",
    "```",
    "For Vite, mount the same Cuts line alongside <App /> in src/main.tsx. For React Router, mount it after <Outlet /> in app/root.tsx.",
    "",
    ...(css ? ["3. Add the selected CSS overrides to globals.css (index.css in Vite):", "```css", css, "```"] : ["3. No CSS needed: all CSS variables are at their defaults."]),
    "The installed Cuts component imports its motion stylesheet. Keep your existing app styles and layout providers.",
    "",
    "Dialogs, sheets, drawers, tabs and supported toasts animate automatically; supported menus are retimed. Custom content needs a helper.",
    "Install only the helpers your app uses:",
    "```bash",
    "npx shadcn add @keyframery/match-cut @keyframery/list-cut @keyframery/value-cut @keyframery/load-cut @keyframery/state-cut",
    "```",
    "Import helpers from @/components/keyframery/<helper-name>. StateCut takes state={status}, optional cut=\"fade\" | \"slide\" | \"none\", and current content as children.",
    "",
    "Installation and supported components: https://keyframery.com/docs/installation",
    "All motion and helpers remain free. Reduced-motion preferences are respected automatically.",
  ].join("\n")
}

export function themeAgentPrompt(settings: ThemeSettings): string {
  return [
    "Apply this exact Keyframery motion theme to the existing shadcn/ui app. Keep its current components, providers and styling.",
    "",
    "Versioned theme configuration (use these values, not approximate animation code):",
    "```json",
    serializeTheme(settings),
    "```",
    "",
    toInstall(settings),
    "",
    "Choose helpers according to the change, and install only those needed:",
    "- MatchCut: the same object opens into its detail view; match the id in both locations. https://keyframery.com/docs/helpers/match-cut",
    "- ListCut: keyed items arrive, leave or reorder; use ListCut.Item with a stable id. https://keyframery.com/docs/helpers/list-cut",
    "- ValueCut: a number or short status changes in place. https://keyframery.com/docs/helpers/value-cut",
    "- LoadCut: asynchronous loading with a skeleton; loading controls the state, skeleton is the placeholder. https://keyframery.com/docs/helpers/load-cut",
    "- StateCut: a whole content block changes between states. Use <StateCut state={status} cut=\"fade\">{content}</StateCut>; state is a string or number, children are the current content, optional cut is fade, slide or none, with optional pace and className. https://keyframery.com/docs/helpers/state-cut",
    "",
    "Fetch the helper documentation for exact APIs. Do not replace components/ui or add an animation dependency. Do not wrap static inputs and buttons in animation helpers.",
    "Check keyboard interactions, rapid state changes and the platform reduced-motion preference after integrating.",
    "Plain-text docs: https://keyframery.com/llms-full.txt",
    "Read-only MCP tools and supported-change catalogue: https://keyframery.com/mcp (call list_kinds first).",
  ].join("\n")
}
