/* The six kinds of change and the cut for each: what the MCP list_kinds tool serves. Snippets are copied from
   the helper docs; tests check every docs path exists. No imports, so unit tests load it directly. */

export type Kind = {
  kind: string
  example: string
  cut: string
  /** null: automatic once <Cuts /> is in the root layout. */
  helper: string | null
  covers: string
  install: string
  snippet: string
  /** Docs path under /docs. */
  docs: string
}

export const KINDS: Kind[] = [
  {
    kind: "Something opens on top",
    example: "a dialog, alert dialog, command menu, sheet, drawer, menu or toast",
    cut: "rack focus for dialogs (grows out of the button you pressed), slide and sink for sheets and drawers, cut on action for toasts",
    helper: null,
    covers:
      "dialog, alert-dialog, command, sheet, drawer, sonner and Base UI toast. Popover, dropdown-menu, context-menu, menubar, select, combobox, hover-card, tooltip, navigation-menu, accordion and collapsible are retimed to match.",
    install: "npx shadcn add @keyframery/cuts",
    snippet: 'import { Cuts } from "@/components/keyframery/cuts"\n\n// once, in the root layout, after {children}\n<Cuts />',
    docs: "components/dialog",
  },
  {
    kind: "You switch to a neighbour",
    example: "a tab",
    cut: "J-cut: the indicator whips across first and the new panel follows a beat later, while the height eases",
    helper: null,
    covers: "tabs",
    install: "npx shadcn add @keyframery/cuts",
    snippet: "// nothing to add: <Cuts /> handles shadcn Tabs",
    docs: "components/tabs",
  },
  {
    kind: "A thing opens into its bigger self",
    example: "a card becomes its detail view, on the same page or on a new route",
    cut: "match cut",
    helper: "MatchCut",
    covers: "cards, rows and tiles that open into a detail view",
    install: "npx shadcn add @keyframery/match-cut",
    snippet:
      'import { MatchCut } from "@/components/keyframery/match-cut"\n\n// app/orders/page.tsx\n<MatchCut id={`order-${order.id}`}>\n  <OrderCard order={order} />\n</MatchCut>\n\n// app/orders/[id]/page.tsx: the same id\n<MatchCut id={`order-${order.id}`}>\n  <OrderDetail order={order} />\n</MatchCut>',
    docs: "helpers/match-cut",
  },
  {
    kind: "A list changes",
    example: "a message is sent, a row is archived, items are reordered",
    cut: "cut on action (an added item flies from what you pressed), L-cut (a removed item folds away), glide (reorders)",
    helper: "ListCut",
    covers: "chat threads, inboxes, kanban columns, table rows",
    install: "npx shadcn add @keyframery/list-cut",
    snippet:
      'import { ListCut } from "@/components/keyframery/list-cut"\n\n<ListCut as="ul" className="space-y-2">\n  {messages.map((m) => (\n    <ListCut.Item key={m.id} id={m.id} as="li">\n      {m.text}\n    </ListCut.Item>\n  ))}\n</ListCut>',
    docs: "helpers/list-cut",
  },
  {
    kind: "A value changes in place",
    example: "a price, a count, a status",
    cut: "punch-in: the value rolls to its new digits",
    helper: "ValueCut",
    covers: "numbers, prices, counters, badges and short status text",
    install: "npx shadcn add @keyframery/value-cut",
    snippet: 'import { ValueCut } from "@/components/keyframery/value-cut"\n\n<ValueCut value={price} format={{ style: "currency", currency: "USD" }} locale="en-US" />',
    docs: "helpers/value-cut",
  },
  {
    kind: "A placeholder becomes real",
    example: "a skeleton turns into a chart",
    cut: "dissolve, with no skeleton at all if the data arrives within 300 ms",
    helper: "LoadCut",
    covers: "anything that shows a skeleton while loading",
    install: "npx shadcn add @keyframery/load-cut",
    snippet:
      'import { LoadCut } from "@/components/keyframery/load-cut"\nimport { Skeleton } from "@/components/ui/skeleton"\n\n<LoadCut loading={isLoading} skeleton={<Skeleton className="h-32" />}>\n  <RevenueChart data={data} />\n</LoadCut>',
    docs: "helpers/load-cut",
  },
]

export function kindsMarkdown(site = "https://keyframery.com"): string {
  const parts = KINDS.map((k, i) =>
    [
      `## ${i + 1}. ${k.kind}`,
      `- Example: ${k.example}`,
      `- Cut: ${k.cut}`,
      `- How: ${k.helper ? `wrap it in <${k.helper}>` : "automatic with <Cuts />"}`,
      `- Covers: ${k.covers}`,
      `- Install: \`${k.install}\``,
      `- Docs: ${site}/docs/${k.docs}`,
      "",
      "```tsx",
      k.snippet,
      "```",
    ].join("\n"),
  )
  return [
    "# The six kinds of change",
    "",
    "Every change on a screen is one of these six. The first two are automatic once <Cuts /> is in the root layout. The other four take one helper each. Never hand-write enter or exit animations for shadcn components, and don't animate static ones (buttons, inputs, labels).",
    "",
    ...parts.flatMap((p) => [p, ""]),
  ].join("\n")
}
