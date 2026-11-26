import Link from "next/link"

import { frameworks } from "@site/lib/frameworks"
import { type UiFramework, uiFrameworks } from "@site/lib/ui-frameworks"
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

function Mark({ framework, className }: { framework: Pick<UiFramework, "viewBox" | "paths">; className?: string }) {
  return (
    <svg role="img" aria-hidden viewBox={framework.viewBox} xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
      {framework.paths.map((d) => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </svg>
  )
}

/** The UI framework you build with, at the top of /docs/installation. The current one is marked; a supported
    one links to its guide; one we don't support yet says so and isn't a link. */
export function UiFrameworkPicker({ current = "react" }: { current?: string }) {
  return (
    <nav aria-label="UI framework" className="not-prose mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {uiFrameworks.map((framework) => {
        const isCurrent = framework.slug === current
        const body = (
          <>
            <Mark framework={framework} className="size-7" />
            <span className="mt-2.5 text-[13.5px] font-medium">{framework.name}</span>
            {!framework.supported && <span className="mt-1 text-[11.5px] text-muted-foreground">Coming soon</span>}
          </>
        )
        const layout = "flex min-h-28 flex-col items-center justify-center px-3 py-5 text-center max-sm:last:col-span-2"
        if (!framework.supported)
          return (
            <div key={framework.slug} aria-disabled="true" className={cn(tile, layout, "cursor-default bg-muted/50 text-foreground/45 hover:bg-muted/50")}>
              {body}
            </div>
          )
        return (
          <Link
            key={framework.slug}
            href={framework.slug === "react" ? "/docs/installation" : `/docs/installation/${framework.slug}`}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(tile, layout, isCurrent && "bg-foreground text-background hover:bg-foreground/90")}
          >
            {body}
          </Link>
        )
      })}
    </nav>
  )
}
