"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import * as React from "react"

import coverage from "@/lib/coverage.json"

/* Every shadcn component, one at a time: pick it, try it, flip to stock. The demos (45 components'
   worth of code) load only once this section is near the screen, so they never slow the hero. */

const ComponentDemo = dynamic(() => import("@/components/docs/demos/coverage").then((m) => m.ComponentDemo), {
  ssr: false,
  loading: () => <p className="text-sm text-muted-foreground">Loading the demo…</p>,
})

type Entry = (typeof coverage.components)[number]
type Kind = Entry["kind"]

const FILTERS: { kind: Kind | "all"; label: string }[] = [
  { kind: "all", label: "All" },
  { kind: "cut", label: "Cuts" },
  { kind: "tuned", label: "Tuned" },
  { kind: "response", label: "Responses" },
  { kind: "helper", label: "Helpers" },
  { kind: "still", label: "Still" },
]
const KIND_LABEL: Record<Kind, string> = { cut: "Cut", tuned: "Tuned", response: "Response", helper: "Helper", still: "Still by design" }
const HOW: Record<string, string> = { automatic: "Automatic", "add-on": "Icon moves", own: "Its own motion" }
const howOf = (how: string) => (how.startsWith("helper:") ? how.slice(7) : HOW[how])

const SORTED = [...coverage.components].sort((a, b) => a.name.localeCompare(b.name))

export function ComponentExplorer() {
  const [filter, setFilter] = React.useState<Kind | "all">("all")
  const [slug, setSlug] = React.useState("calendar")
  const [stock, setStock] = React.useState(false)
  const [near, setNear] = React.useState(false)
  const ref = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const shown = SORTED.filter((c) => filter === "all" || c.kind === filter)
  const current = coverage.components.find((c) => c.slug === slug)!
  const count = (kind: Kind | "all") => (kind === "all" ? SORTED.length : SORTED.filter((c) => c.kind === kind).length)

  return (
    <section ref={ref} aria-labelledby="explorer-title" className="mx-auto w-full max-w-[1200px] px-4 pt-24 md:pt-36" data-testid="component-explorer">
      <div className="max-w-[680px]">
        <h2 id="explorer-title" className="text-[30px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance md:text-[38px]">
          All 63 shadcn components, covered
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
          Every state change in every component has a motion, or a reason to stay still. Pick one and try it, then switch to stock to see what shadcn does on its own.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-1.5" role="group" aria-label="Filter components">
        {FILTERS.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            aria-pressed={filter === kind}
            onClick={() => setFilter(kind)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border bg-card px-3 text-sm text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
          >
            {label}
            <span className="tabular-nums">{count(kind)}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <ul aria-label="Components" className="grid max-h-56 grid-cols-2 content-start gap-1 overflow-y-auto rounded-2xl border bg-card p-2 sm:grid-cols-3 lg:max-h-[520px] lg:grid-cols-2">
          {shown.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                aria-pressed={slug === c.slug}
                onClick={() => setSlug(c.slug)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:font-medium"
              >
                <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${c.kind === "still" ? "bg-border" : "bg-(--cut)"}`} />
                <span className="truncate">{c.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3">
            <p className="text-[15px] font-semibold">{current.name}</p>
            <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{KIND_LABEL[current.kind]}</span>
            {current.kind !== "still" && (
              <div role="group" aria-label="Show it with Keyframery or stock" className="ml-auto flex gap-1 text-sm">
                {[false, true].map((s) => (
                  <button
                    key={String(s)}
                    type="button"
                    aria-pressed={stock === s}
                    onClick={() => setStock(s)}
                    className="rounded-md px-2.5 py-1 text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
                  >
                    {s ? "Stock" : "Keyframery"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div data-cut={stock ? "none" : undefined} className="stage-grid flex min-h-72 flex-1 flex-wrap items-center justify-center gap-3 p-6 md:p-8">
            {current.kind === "still" ? (
              <p className="max-w-[44ch] text-center text-sm text-muted-foreground">{current.summary}</p>
            ) : near ? (
              <ComponentDemo key={slug} slug={slug} />
            ) : null}
          </div>
          <div className="grid gap-2 border-t px-4 py-3 text-sm">
            {current.moves.length ? (
              <ul className="grid gap-1.5">
                {current.moves.map(([when, motion, , how]) => (
                  <li key={when} className="flex flex-wrap gap-x-2 text-muted-foreground">
                    <span className="text-foreground">{when}:</span>
                    {motion.charAt(0).toLowerCase() + motion.slice(1)}
                    <span className="ml-auto text-xs">{howOf(how)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nothing on screen changes, so nothing moves.</p>
            )}
            <Link href={`/docs/components/${current.slug}`} className="w-fit font-medium underline underline-offset-4">
              {current.name} docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
