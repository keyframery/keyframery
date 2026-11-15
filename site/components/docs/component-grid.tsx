import Link from "next/link"

import { groups } from "@site/lib/catalog"

/** Every component, grouped by what it does. */
export function ComponentGrid() {
  return (
    <div className="not-prose mt-8 space-y-10">
      {groups.map(({ group, items }) => (
        <section key={group} aria-label={group}>
          <h2 className="mb-3 text-[13px] font-medium text-muted-foreground">
            {group} <span className="tabular-nums opacity-60">{items.length}</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((e) => (
              <Link
                key={e.slug}
                href={`/docs/components/${e.slug}`}
                className="group rounded-xl border bg-card p-4 outline-none transition-[translate,box-shadow,border-color] duration-[calc(260ms*var(--kf-speed,1))] ease-spring hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_10px_30px_-18px_rgb(0_0_0/0.35)] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[14.5px] font-semibold">{e.name}</span>
                  <span className="flex gap-1">
                    {[...new Set(e.moves.map(([m]) => m))].slice(0, 2).map((m) => (
                      <span key={m} className="rounded-full bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                        {m}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="mt-1.5 line-clamp-2 block text-[13px] leading-relaxed text-muted-foreground">{e.description}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
