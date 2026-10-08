import Link from "next/link"

import { CutOnActionLoop, DissolveLoop, JCutLoop, MatchCutLoop, PunchInLoop, RackFocusLoop } from "@/components/cuts/loops"

import { StateCutLoop } from "./state-cut-loop"

const KINDS = [
  {
    title: "Dialogs open from their button",
    body: "Dialogs and the command palette grow out of the button you clicked and go back into it. Sheets slide in while the page steps back. Toasts fly from the button that made them.",
    how: "Automatic",
    docs: "/docs/components/dialog",
    name: "Dialog",
    Loop: RackFocusLoop,
  },
  {
    title: "Tabs slide instead of snapping",
    body: "The indicator moves first and the new panel follows a beat later, while the height eases to fit.",
    how: "Automatic",
    docs: "/docs/components/tabs",
    name: "Tabs",
    Loop: JCutLoop,
  },
  {
    title: "A card opens into its page",
    body: "The card grows into its detail view, on the same page or on a new route, and shrinks back when you return.",
    how: "<MatchCut>",
    docs: "/docs/helpers/match-cut",
    name: "MatchCut",
    Loop: MatchCutLoop,
  },
  {
    title: "New items come from where they started",
    body: "A sent message flies out of the Send button. Removed rows fold away. Reordered rows glide to their new place.",
    how: "<ListCut>",
    docs: "/docs/helpers/list-cut",
    name: "ListCut",
    Loop: CutOnActionLoop,
  },
  {
    title: "Numbers roll to their new value",
    body: "Prices, counts and totals change digit by digit instead of flickering.",
    how: "<ValueCut>",
    docs: "/docs/helpers/value-cut",
    name: "ValueCut",
    Loop: PunchInLoop,
  },
  {
    title: "Loading states settle in",
    body: "Skeletons dissolve into the real content. If the data arrives within 300 ms, no skeleton shows at all.",
    how: "<LoadCut>",
    docs: "/docs/helpers/load-cut",
    name: "LoadCut",
    Loop: DissolveLoop,
  },
  {
    title: "Content changes keep their context",
    body: "Empty, success and error content fade or slide into place, while the container eases to its new height.",
    how: "<StateCut>",
    docs: "/docs/helpers/state-cut",
    name: "StateCut",
    Loop: StateCutLoop,
  },
]

export function SixKinds() {
  return (
    <section aria-labelledby="kinds-title" className="mx-auto w-full max-w-[1200px] px-4 pt-24 md:pt-36">
      <div className="max-w-[640px]">
        <h2 id="kinds-title" className="text-[30px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance md:text-[38px]">
          Seven kinds of change, one cut each
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
          The first two are automatic once <code className="font-mono text-[15px] text-foreground">{"<Cuts />"}</code> is in your layout. The other five
          take one small component each, and all seven follow your motion theme.
        </p>
      </div>
      {/* The two automatic groups take the wide top row; the five helpers share the row below. */}
      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-10">
        {KINDS.map(({ title, body, how, docs, name, Loop }) => (
          <article key={title} className={`flex flex-col bg-background ${how === "Automatic" ? "lg:col-span-5" : "lg:col-span-2"}`}>
            <div className="border-b bg-stage">
              <Loop bare />
            </div>
            <div className="flex flex-1 flex-col p-5 md:p-6">
              <h3 className="text-[17px] leading-snug font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
                {how === "Automatic" ? (
                  <span className="text-muted-foreground">Automatic with {"<Cuts />"}</span>
                ) : (
                  <code className="rounded-md border bg-card px-1.5 py-0.5 font-mono text-[13px]">{how}</code>
                )}
                <Link href={docs} aria-label={`${name} docs`} className="font-medium underline-offset-4 hover:underline">
                  Docs
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
