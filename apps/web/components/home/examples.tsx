import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { CutOnActionLoop, DissolveLoop, RackFocusLoop } from "@/components/cuts/loops"

const EXAMPLES = [
  {
    number: "01",
    title: "Dialogs that follow your action",
    body: "Open a dialog from the button you pressed. Close it and it returns to where it started.",
    setup: "Automatic with <Cuts />",
    docs: "/docs/components/dialog",
    name: "Dialog",
    Loop: RackFocusLoop,
  },
  {
    number: "02",
    title: "Lists that keep their place",
    body: "New items arrive from your action. Removed rows fold away, while the rest move into place.",
    setup: "Add the ListCut helper",
    docs: "/docs/helpers/list-cut",
    name: "ListCut",
    Loop: CutOnActionLoop,
  },
  {
    number: "03",
    title: "Loading that feels considered",
    body: "Quick responses skip the skeleton. When you do need one, it dissolves into the real content.",
    setup: "Add the LoadCut helper",
    docs: "/docs/helpers/load-cut",
    name: "LoadCut",
    Loop: DissolveLoop,
  },
]

export function HomeExamples() {
  return (
    <section id="examples" aria-labelledby="examples-title" className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pt-20 md:pt-28">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-[640px]">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Made for the moments between</p>
          <h2 id="examples-title" className="mt-4 text-[32px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance md:text-[44px]">
            Small details. A different feel.
          </h2>
          <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-pretty text-muted-foreground">
            Dialogs move automatically with <code className="font-mono text-[15px] text-foreground">{"<Cuts />"}</code>. Add a small helper for lists and loading in your own markup.
          </p>
        </div>
        <Link href="/cuts" className="inline-flex shrink-0 items-center gap-1.5 rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50">
          All examples <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <div className="mt-9 grid gap-4 lg:grid-cols-3">
        {EXAMPLES.map(({ number, title, body, setup, docs, name, Loop }) => (
          <article key={number} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_3px_12px_-8px_color-mix(in_oklch,var(--foreground)_20%,transparent)]">
            <div className="relative isolate border-b bg-linear-to-b from-muted/80 to-background">
              <span aria-hidden="true" className="absolute top-4 left-4 z-10 font-mono text-[10px] text-muted-foreground">{number} / LIVE</span>
              <div className="stage-grid mx-3 mt-3 rounded-t-xl border-x border-t [&>div]:h-60 [&>div]:px-3 [&>div]:pt-10 [&_[data-slot=dialog-content]]:max-w-full">
                <Loop bare />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="font-mono text-[11px] text-muted-foreground">{setup}</p>
              <h3 className="mt-3 max-w-[23ch] text-xl leading-snug font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
              <Link href={docs} className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-sm pt-6 text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50">
                {name} docs <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
