import { entryOf, MENUS } from "@/lib/knobs"
import { cn } from "@/lib/utils"

/** A component page's facts at a glance, under its description: what kind of motion it gets, what it takes to
 *  get it, and where it runs. Each links to the section that explains it. */
export function PageChips({ slug }: { slug: string }) {
  const entry = entryOf(slug)
  if (!entry) return null
  const menu = entry.menu ? MENUS[entry.menu] : undefined
  const automatic = entry.moves.some((m) => m[3] === "automatic") || entry.kind === "cut" || entry.kind === "tuned"
  const kind =
    entry.kind === "still"
      ? "Still: nothing moves"
      : menu
        ? `Cut: ${menu.cuts[0].name}`
        : entry.kind === "tuned"
          ? "Tuned: shadcn's motion, retimed"
          : entry.kind === "helper"
            ? `Helper: ${entry.part}`
            : "Response: reacts when you use it"
  const setup = entry.kind === "still" ? "Nothing to install" : automatic ? "Automatic with <Cuts />" : `Wrap it in <${entry.part}>`
  const chips = [
    { text: kind, href: entry.kind === "still" ? undefined : "#which-cut-it-uses", on: entry.kind !== "still" },
    { text: setup, href: "#install" },
    { text: "Base UI and Radix", href: "/docs/base-ui-vs-radix" },
  ]
  return (
    <ul aria-label="At a glance" className="not-prose flex flex-wrap gap-2">
      {chips.map(({ text, href, on }) => {
        const body = (
          <>
            <span aria-hidden="true" className={cn("size-1.5 rounded-full", on ? "bg-cut" : "bg-muted-foreground/40")} />
            {text}
          </>
        )
        const chip = "inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[13px] text-foreground"
        return (
          <li key={text}>
            {href ? (
              <a href={href} className={cn(chip, "outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50")}>
                {body}
              </a>
            ) : (
              <span className={chip}>{body}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
