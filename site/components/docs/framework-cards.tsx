import Link from "next/link"

import { frameworks } from "@site/lib/frameworks"
import { cn } from "@/lib/utils"

/* The two card kinds on the installation pages, drawn the way shadcn's installation pages draw them:
   a soft filled tile with no border, darker on hover. */
const tile = "rounded-2xl bg-muted text-foreground no-underline outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring"

/** Every framework guide as a tile: its logo over its name. */
export function FrameworkGrid() {
  return (
    <div className="not-prose mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
      {frameworks.map((framework) => (
        <Link key={framework.slug} href={`/docs/installation/${framework.slug}`} className={cn(tile, "flex w-full flex-col items-center p-6 sm:p-10")}>
          <svg role="img" aria-hidden viewBox={framework.viewBox} xmlns="http://www.w3.org/2000/svg" className="size-10" fill="currentColor">
            {framework.paths.map((d) => (
              <path key={d.slice(0, 24)} d={d} />
            ))}
          </svg>
          <span className="mt-2 font-medium">{framework.name}</span>
        </Link>
      ))}
    </div>
  )
}

/** The ways to start, each jumping to its section on the page. */
export function StartingPoints({ items }: { items: { href: string; title: string; description: string }[] }) {
  return (
    <div className={cn("not-prose mt-6 grid gap-4 sm:gap-6", items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
      {items.map((item) => (
        <a key={item.href} href={item.href} className={cn(tile, "flex flex-col items-start gap-1 p-6 text-sm")}>
          <span className="font-medium">{item.title}</span>
          <span className="leading-relaxed text-muted-foreground">{item.description}</span>
        </a>
      ))}
    </div>
  )
}
