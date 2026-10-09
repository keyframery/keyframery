/* What a reader can change on each component, and the exact code for it. lib/coverage.json is the one source:
   its "menus" (the cuts a dialog, sheet, drawer, tabs or toast can take) and each component's kind, menu and
   part. The playground on every component page and the generated docs both read this, so they say the same. */

import coverage from "./coverage.json"

export type Cut = { id: string; name: string; says: string }
export type Menu = { label: string; cuts: Cut[] }
export type Kind = "cut" | "tuned" | "response" | "helper" | "still"
/** `try`: what to do in the component's demo to see it move, in a few plain words. */
export type Entry = {
  slug: string
  name: string
  kind: Kind
  menu?: string
  part?: string | null
  summary: string
  try?: string
  /** [when, what you see, timing, how]: how is "automatic", "add-on", "own" or "helper:<Name>". */
  moves: [string, string, string, string][]
}

export const MENUS = coverage.menus as Record<string, Menu>
const ENTRIES = coverage.components as unknown as Entry[]

export function entryOf(slug: string): Entry | undefined {
  return ENTRIES.find((e) => e.slug === slug)
}

/** Duration multipliers, in words: pace scales every duration, so a bigger number is slower. */
export const SPEEDS = [
  { id: "slower", name: "Slower", pace: 1.6 },
  { id: "normal", name: "Normal", pace: 1 },
  { id: "faster", name: "Faster", pace: 0.6 },
] as const

export type Choice = { cut?: string; pace: number; off: boolean }

export type Snippet = { comment: string; code: string }

/** The lines to copy for a choice: one for the whole app (in the root layout) and one for just this component. */
export function snippetsFor(entry: Entry, choice: Choice): Snippet[] {
  const menu = entry.menu ? MENUS[entry.menu] : undefined
  const part = entry.part ?? null
  const helper = entry.kind === "helper" ? part : null
  const pace = choice.pace === 1 ? null : choice.pace
  const cut = menu && choice.cut && choice.cut !== menu.cuts[0].id ? choice.cut : null
  const out: Snippet[] = []

  if (choice.off) {
    if (helper) return [{ comment: "Turn it off for this one", code: `<${helper} cut="none">…</${helper}>` }]
    if (menu) out.push({ comment: `In your root layout: no motion on ${menu.label}`, code: `<Cuts ${entry.menu}="none" />` })
    if (entry.kind === "response") out.push({ comment: "In your root layout: no responses anywhere (cuts keep playing)", code: `<Cuts responses="none" />` })
    if (part) out.push({ comment: `Or on just this one`, code: `<${part} data-cut="none" />` })
    return out
  }
  if (!cut && !pace) return []

  if (helper) return [{ comment: "On this one", code: `<${helper} pace={${pace}}>…</${helper}>` }]
  const layout = [cut && `${entry.menu}="${cut}"`, pace && `pace={${pace}}`].filter(Boolean).join(" ")
  out.push({
    comment: pace ? "In your root layout (pace changes every motion in your app)" : `In your root layout: all ${menu!.label}`,
    code: `<Cuts ${layout} />`,
  })
  if (part) {
    const attrs = [cut && `data-cut="${cut}"`, pace && `data-cut-pace="${pace}"`].filter(Boolean).join(" ")
    out.push({ comment: "Or on just this one", code: `<${part} ${attrs} />` })
  }
  return out
}
