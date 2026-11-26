"use client"

import { ArrowUpRight, Search } from "lucide-react"
import Link from "next/link"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input, InputClear, InputGroup } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ComponentEntry = {
  slug: string
  name: string
  group: string
  description: string
  sdk: string | null
  core: boolean
  moves: [string, string][]
}

/** The catalog stays on the server; only the small, serializable browsing index crosses over. */
export function ComponentBrowser({ entries, groups }: { entries: ComponentEntry[]; groups: string[] }) {
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState("All")
  const search = query.trim().toLowerCase()
  const filtered = entries.filter((entry) =>
    (selected === "All" || entry.group === selected) &&
    `${entry.name} ${entry.description} ${entry.group} ${entry.moves.map(([move]) => move).join(" ")}`.toLowerCase().includes(search),
  )

  return (
    <div className="not-prose mt-8 space-y-7">
      <div className="space-y-4 border-y py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InputGroup className="max-w-md">
            <Search aria-hidden="true" />
            <Input type="search" aria-label="Search components" placeholder="Search components, motion, or use case…" value={query} onValueChange={setQuery} />
            <InputClear aria-label="Clear component search" />
          </InputGroup>
          <p role="status" className="text-[12px] text-muted-foreground tabular-nums">
            {filtered.length} of {entries.length} components
          </p>
        </div>
        <div role="group" aria-label="Filter components by category" className="flex flex-wrap gap-1.5">
          {["All", ...groups].map((group) => (
            <Button
              key={group}
              size="sm"
              variant="ghost"
              aria-pressed={selected === group}
              onClick={() => setSelected(group)}
              className={cn("rounded-full px-3 text-muted-foreground", selected === group && "bg-foreground text-background hover:bg-foreground hover:text-background")}
            >
              {group}
            </Button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm font-medium">No components found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different name or browse every category.</p>
          <Button variant="ghost" className="mt-4" onClick={() => { setQuery(""); setSelected("All") }}>Clear filters</Button>
        </div>
      ) : groups.map((group) => {
        const items = filtered.filter((entry) => entry.group === group)
        if (!items.length) return null
        return (
          <section key={group} id={group.toLowerCase().replace(/\s+/g, "-")} aria-label={group} className="scroll-mt-24 space-y-3">
            <h2 className="flex items-center gap-2 text-[14px] font-medium">
              {group} <span className="text-[12px] text-muted-foreground tabular-nums">{items.length}</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/docs/components/${entry.slug}`}
                  className="group flex min-w-0 flex-col rounded-xl border bg-card p-5 outline-none transition-[background-color,border-color] duration-[calc(200ms*var(--kf-speed,1))] ease-house hover:border-foreground/25 hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[15px] font-semibold tracking-tight">{entry.name}</span>
                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground/60 group-hover:text-foreground" />
                  </span>
                  <span className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{entry.description}</span>
                  <span className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-[11px] text-muted-foreground">
                    {(entry.sdk || entry.core) && <span className="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5"><span aria-hidden="true" className="size-1 rounded-full bg-cut" />UI SDK</span>}
                    {[...new Set(entry.moves.map(([move]) => move))].slice(0, 2).map((move) => <span key={move}>{move}</span>)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
