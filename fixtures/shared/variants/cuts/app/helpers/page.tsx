import { ListDemo } from "@/components/kf-fixture/demos/list-demo"
import { LoadDemo } from "@/components/kf-fixture/demos/load-demo"
import { MatchDemo } from "@/components/kf-fixture/demos/match-demo"
import { ValueDemo } from "@/components/kf-fixture/demos/value-demo"

export default function Page() {
  return (
    <main className="grid min-h-dvh gap-12 bg-background p-8">
      <h1 className="text-lg font-semibold">Keyframery helpers</h1>
      <ValueDemo />
      <LoadDemo />
      <ListDemo />
      <MatchDemo />
    </main>
  )
}
