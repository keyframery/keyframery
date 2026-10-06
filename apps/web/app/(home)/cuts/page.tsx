import type { Metadata } from "next"
import Link from "next/link"

import { CutOnActionLoop, DissolveLoop, JCutLoop, MatchCutLoop, PunchInLoop, RackFocusLoop } from "@/components/cuts/loops"

export const metadata: Metadata = { title: "Cuts", description: "The six ways a screen changes, and the film cut Keyframery uses for each." }

const ROWS = [
  { id: "rack-focus", cut: "Rack focus", kind: "Something opens on top", film: "The camera pulls focus from the background to the subject.", ui: "A dialog grows out of the button that opened it while the page behind softens. Closing reverses it back into the button. Sheets slide in from their edge and the page steps back.", docs: "/docs/components/dialog", Loop: RackFocusLoop },
  { id: "j-cut", cut: "J-cut and whip", kind: "You switch to a neighbour", film: "The next scene's sound starts before its picture.", ui: "The tab pill whips across first, then the new panel follows a beat later. The old panel leaves on its own, and the frame resizes smoothly.", docs: "/docs/components/tabs", Loop: JCutLoop },
  { id: "match-cut", cut: "Match cut", kind: "A thing opens into its bigger self", film: "A shape in one shot matches the same shape in the next.", ui: "A card grows into its detail view, on the same page or across a route change, and shrinks back when you return.", docs: "/docs/helpers/match-cut", Loop: MatchCutLoop },
  { id: "cut-on-action", cut: "Cut on action", kind: "A list changes", film: "The cut happens mid-movement, so the motion carries across it.", ui: "A sent message flies from the Send button into the thread. A deleted row folds away first, then the rest glide up.", docs: "/docs/helpers/list-cut", Loop: CutOnActionLoop },
  { id: "punch-in", cut: "Punch-in", kind: "A value changes in place", film: "A quick push in on the same shot, for emphasis.", ui: "Only the digits that changed roll, and the number gives a small punch so the eye catches it.", docs: "/docs/helpers/value-cut", Loop: PunchInLoop },
  { id: "dissolve", cut: "Dissolve", kind: "A placeholder becomes real", film: "One shot fades into the next.", ui: "The skeleton fades into the content in the same space. If the data arrives within 300 ms, the skeleton never shows.", docs: "/docs/helpers/load-cut", Loop: DissolveLoop },
]

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-16">
      <h1 className="text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">The cuts</h1>
      <p className="mt-4 max-w-[60ch] text-lg text-muted-foreground">A screen can only change in six ways. Each one has a cut from film editing that makes the change easy to follow.</p>
      <div className="mt-12 grid gap-16">
        {ROWS.map(({ id, cut, kind, film, ui, docs, Loop }) => (
          <section key={id} id={id} className="grid scroll-mt-24 gap-6 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <p className="text-muted-foreground">{kind}</p>
              <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">{cut}</h2>
              <p className="mt-3 max-w-[52ch]"><span className="text-muted-foreground">In film: </span>{film}</p>
              <p className="mt-2 max-w-[52ch]"><span className="text-muted-foreground">In your UI: </span>{ui}</p>
              <Link href={docs} className="mt-4 inline-block text-sm underline underline-offset-4">Read the docs</Link>
            </div>
            <Loop />
          </section>
        ))}
      </div>
    </main>
  )
}
