import Link from "next/link"

import { MatchCut } from "@/components/keyframery/match-cut"

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }]
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main className="p-8">
      <MatchCut id={`route-${id}`} className="max-w-2xl rounded-2xl border p-8" data-testid="route-detail">
        <h1 className="text-lg font-semibold">Order #{id}</h1>
        <div className="h-60" />
        <Link href="/match" data-testid="route-back">Back to orders</Link>
      </MatchCut>
    </main>
  )
}
