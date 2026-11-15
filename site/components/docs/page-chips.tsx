import { entry } from "@site/lib/catalog"
import { cn } from "@/lib/utils"

/** A component page's facts at a glance, under its description: which moves it uses, what it is built on. */
export function PageChips({ slug }: { slug: string }) {
  const e = entry(slug)
  if (!e) return null
  const moves = [...new Set(e.moves.map(([m]) => m))].slice(0, 4)
  const chips: { text: string; href?: string; on?: boolean }[] = [
    ...moves.map((m) => ({ text: m, href: "#what-moves", on: true })),
    e.sdk ? { text: `Built on UI SDK ${e.sdk}`, href: `https://ui-sdk.dev/docs/components/${e.sdk}` } : { text: "Plain elements" },
    { text: "Plain CSS", href: "/docs/motion-styles#how-it-works" },
  ]
  const chip = "inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[13px] text-foreground"
  return (
    <ul aria-label="At a glance" className="not-prose flex flex-wrap gap-2">
      {chips.map(({ text, href, on }) => {
        const body = (
          <>
            <span aria-hidden="true" className={cn("size-1.5 rounded-full", on ? "bg-cut" : "bg-muted-foreground/40")} />
            {text}
          </>
        )
        return (
          <li key={text}>
            {href ? (
              <a href={href} className={cn(chip, "outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring")}>
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
