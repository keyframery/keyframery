import { LoadDemo } from "@/components/kf-fixture/demos/load-demo"
import { ValueDemo } from "@/components/kf-fixture/demos/value-demo"

export default function Page() {
  return (
    <main className="grid min-h-dvh gap-12 bg-background p-8">
      <h1 className="text-lg font-semibold">Keyframery helpers</h1>
      <ValueDemo />
      <LoadDemo />
    </main>
  )
}
