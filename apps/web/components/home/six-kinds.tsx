import Link from "next/link"

const KINDS = [
  { cut: "Rack focus", kind: "Something opens on top", where: "Dialog, alert dialog, command, sheet, menus, toast", href: "/cuts#rack-focus" },
  { cut: "J-cut and whip", kind: "You switch to a neighbour", where: "Tabs", href: "/cuts#j-cut" },
  { cut: "Match cut", kind: "A thing opens into its bigger self", where: "MatchCut: a card becomes its page", href: "/cuts#match-cut" },
  { cut: "Cut on action", kind: "A list changes", where: "ListCut: messages, inboxes, kanban, tables", href: "/cuts#cut-on-action" },
  { cut: "Punch-in", kind: "A value changes in place", where: "ValueCut: prices, counts, statuses", href: "/cuts#punch-in" },
  { cut: "Dissolve", kind: "A placeholder becomes real", where: "LoadCut: skeleton to content", href: "/cuts#dissolve" },
]

export function SixKinds() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-14">
      <h2 className="text-[28px] font-semibold tracking-[-0.02em]">A screen changes in six ways</h2>
      <p className="mt-3 max-w-[60ch] text-muted-foreground">Keyframery has one cut for each. The first two happen inside shadcn and need no code. The other four are a component each.</p>
      <dl className="mt-8 divide-y border-y">
        {KINDS.map((k) => (
          <div key={k.cut} className="grid gap-1 py-4 md:grid-cols-[1fr_1.4fr_1.6fr] md:items-baseline md:gap-6">
            <dt className="text-lg font-semibold tracking-tight">
              <Link href={k.href} className="underline-offset-4 hover:underline">{k.cut}</Link>
            </dt>
            <dd>{k.kind}</dd>
            <dd className="text-muted-foreground">{k.where}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
