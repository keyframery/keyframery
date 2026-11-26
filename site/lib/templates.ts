/* The templates: what the docs, the preview route and the sitemap know about each one.
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
  /** Has addresses of its own under /templates/<slug>/… (an admin). A landing page has none. */
  pages?: boolean
  /** The registry item's title. Defaults to "<Name> landing page". */
  registryTitle?: string
  /** Still being built: it has a preview route, but no docs page, card or sitemap entry yet. */
  draft?: boolean
}

const all: Template[] = [
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
  {
    slug: "backroom",
    name: "Backroom",
    kind: "Store admin",
    price: "Free",
    description:
      "A complete store admin, built from UI SDK components end to end. Orders you can fulfil and refund, products, customers, discounts, an inbox, apps, settings and sign-in, all working on a sample store, in light and dark, phone to desktop. AI agents can read and use every page through UI SDK's agent bridge.",
    sections: [
      "Sidebar shell, command menu and notifications",
      "Dashboard: overview and analytics",
      "Orders, an order, and a new order",
      "Products and a product",
      "Customers and a customer",
      "Discounts",
      "Inbox",
      "Apps, notifications and help",
      "Settings: store, account, appearance, team and billing",
      "Sign in, two-step code, sign up and password reset",
      "Error pages",
    ],
    interactions: [
      "Search everything with ⌘K",
      "Fulfil, refund and cancel an order",
      "Create an order in four steps",
      "Edit a product and its variants",
      "Reply to a customer with a saved reply",
      "Create, pause and import discounts",
      "Connect an app",
      "Change theme, density, direction and motion",
    ],
    facts: ["Free", "Store admin", "35 pages", "UI SDK end to end", "Agent ready", "Light and dark", "Phone to desktop"],
    pages: true,
    registryTitle: "Backroom store admin",
  },
]

/** The published templates: the docs list, the cards and the sitemap. */
export const templates: Template[] = all.filter((item) => !item.draft)

/** Any template by its slug, drafts included, for the preview route. */
export const template = (slug: string) => all.find((candidate) => candidate.slug === slug)

/** The prompt behind "Copy for your coding agent" on a template's page. */
export function templatePrompt(slug: string, site = "https://keyframery.com"): string {
  const item = template(slug)
  if (!item) return ""
  const install = [
    `1. Install it: npx shadcn@latest add @keyframery/${item.slug}`,
    `   If the CLI answers Unknown registry "@keyframery", run this once and install again: npx shadcn@latest registry add "@keyframery=${site}/r/{name}.json"`,
  ]
  const links = ["", `Live preview: ${site}/templates/${item.slug}`, `Docs: ${site}/docs/templates/${item.slug}.mdx`]
  if (item.pages) {
    return [
      `Add the "${item.name}" ${item.kind.toLowerCase()} from Keyframery to this project, then make it ours.`,
      "",
      ...install,
      `   It needs React 19, Tailwind CSS v4 and a components.json. It installs every UI SDK control it uses.`,
      "",
      `2. Give it one catch-all route. In Next.js: app/admin/[[...path]]/page.tsx that returns <Backroom basePath="/admin" /> from "@/components/${item.slug}/${item.slug}". It owns every address under basePath through the History API.`,
      "",
      "3. Make it ours:",
      `   - The sample store (orders, products, customers, team) is in components/${item.slug}/data.ts; inbox, discounts and apps are in extras.ts. Replace them with our data, or load ours into the store in store.tsx.`,
      `   - Pages and the sidebar are listed in routes.tsx. Add a page there and it appears in the sidebar, the command menu and the breadcrumbs.`,
      `   - Every change goes through an action in store.tsx. Swap an action's body for a call to our API and the page keeps working.`,
      `   - The sign-in in auth.tsx is a stand-in. Wire it to our own auth before going live.`,
      "",
      "Rules:",
      "- Every control is a UI SDK component. Do not replace them with plain elements: the keyboard, screen-reader and agent behaviour come from them.",
      "- Keep data-agent-confirm on destructive actions, so an AI agent has to ask the person before it refunds or deletes.",
      "- Do not hand-edit durations. It is quiet by default (Subtle); set data-motion on <html> (springy, calm, snappy, playful) to change the feel.",
      ...links,
    ].join("\n")
  }
  return [
    `Add the "${item.name}" landing page from Keyframery to this project, then make it ours.`,
    "",
    ...install,
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
    "- Do not hand-edit durations. Every CSS duration is multiplied by --kf-speed; set data-motion on <html> (springy, calm, snappy, playful) to change the feel; --kf-flourish (0 to 1) scales stretches, pops and entrances.",
    "- Keep the reduced-motion rules: with reduced motion on, the loading sequence is skipped and nothing moves.",
    ...links,
  ].join("\n")
}
