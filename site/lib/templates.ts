/* The landing page templates: what the docs, the preview route and the sitemap know about each one.
   A template's code lives in src/templates/<slug>/. No imports, so scripts can load this file too. */

export type Template = {
  slug: string
  name: string
  /** What kind of page it is, for the list and the page title. */
  kind: string
  price: "Free" | "Pro"
  description: string
  /** The sections, top to bottom. */
  sections: string[]
  /** What a visitor can operate. */
  interactions: string[]
  /** Short facts shown as chips under the title. */
  facts: string[]
}

export const templates: Template[] = [
  {
    slug: "round",
    name: "Round",
    kind: "App landing page",
    price: "Free",
    description:
      "A landing page people can operate. It loads by splitting a bill, the hero is a ring you divide by dragging, the scroll settles the debts on a screen-wide odometer, and one switch re-prices every figure on the page.",
    sections: ["Loading sequence", "Hero with the live ring", "Statement and bill", "Settle, pinned to the scroll", "Numbers and quotes", "Pricing and questions", "Last call and footer"],
    interactions: ["Drag a line on the ring", "Add or drop a friend", "Set the tip", "Tap who shared each item", "Scroll to settle", "Switch currency and billing"],
    facts: ["Free", "7 sections", "6 things to operate", "UI SDK controls", "Motion + plain CSS", "Phone to desktop"],
  },
]

export const template = (slug: string) => templates.find((candidate) => candidate.slug === slug)

/** The prompt behind "Copy for your coding agent" on a template's page. */
export function templatePrompt(slug: string, site = "https://keyframery.com"): string {
  const item = template(slug)
  if (!item) return ""
  return [
    `Add the "${item.name}" landing page from Keyframery to this project, then make it ours.`,
    "",
    `1. Install it: npx shadcn@latest add @keyframery/${item.slug}`,
    `   If the CLI answers Unknown registry "@keyframery", run this once and install again: npx shadcn@latest registry add "@keyframery=${site}/r/{name}.json"`,
    `   It needs React 19, Tailwind CSS v4 and a components.json. It installs the UI SDK controls it uses and the "motion" package.`,
    "",
    `2. Render it on a route: import { RoundLanding } from "@/components/${item.slug}/round" and return <RoundLanding /> from the page.`,
    "",
    "3. Make it ours without breaking how it moves:",
    `   - Copy, people, bills, prices and questions are all in components/${item.slug}/data.ts. Change them there.`,
    `   - Colours are the six --rnd-* values at the top of components/${item.slug}/round.css. Each section picks a tone with data-tone.`,
    "   - Swap the photos in public/round/ for ours and keep the file names, or change the paths in data.ts.",
    "   - Keep the order of the sheets and the data-reveal, data-tone and rnd-* class names: the scroll and the loading sequence read them.",
    "",
    "Rules:",
    "- Do not replace the UI SDK controls (slider, toggles, segmented control, accordion, buttons) with plain elements.",
    "- Do not hand-edit durations. Every CSS duration is multiplied by --kf-speed; set data-motion on <html> (calm, snappy, playful) to change the feel.",
    "- Keep the reduced-motion rules: with reduced motion on, the loading sequence is skipped and nothing moves.",
    "",
    `Live preview: ${site}/templates/${item.slug}`,
    `Docs: ${site}/docs/templates/${item.slug}.mdx`,
  ].join("\n")
}
