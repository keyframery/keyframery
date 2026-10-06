import Link from "next/link"

import { MatchCut } from "@/components/keyframery/match-cut"

export default function Page() {
  return (
    <main className="grid gap-6 p-8">
      <h1 className="text-lg font-semibold">Orders</h1>
      <div className="grid max-w-2xl grid-cols-3 gap-3">
        {[1, 2, 3].map((n) => (
          <MatchCut key={n} id={`route-${n}`} className="rounded-xl border p-4" data-testid={`route-card-${n}`}>
            <Link href={`/match/${n}`} data-testid={`route-open-${n}`}>Order #{n}</Link>
          </MatchCut>
        ))}
      </div>
    </main>
  )
}
