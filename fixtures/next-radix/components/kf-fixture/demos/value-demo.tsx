"use client"

import * as React from "react"

import { ValueCut } from "@/components/keyframery/value-cut"
import { Button } from "@/components/ui/button"

export function ValueDemo() {
  const [n, setN] = React.useState(1284)
  const [paid, setPaid] = React.useState(false)
  return (
    <section className="grid gap-3" data-testid="value-demo">
      <h2 className="font-medium">ValueCut</h2>
      <p className="text-3xl font-semibold" data-testid="value-number">
        <ValueCut value={n} locale="en-US" />
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" data-testid="value-inc" onClick={() => setN((v) => v + 1)}>+1</Button>
        <Button variant="outline" data-testid="value-dec" onClick={() => setN((v) => v - 1)}>−1</Button>
        <Button variant="outline" data-testid="value-jump" onClick={() => setN((v) => v + 9000)}>+9,000</Button>
      </div>
      <p data-testid="value-status">
        <ValueCut value={paid ? "Paid" : "Pending"} announce />
      </p>
      <Button variant="outline" className="w-fit" data-testid="value-toggle" onClick={() => setPaid((p) => !p)}>
        Toggle status
      </Button>
    </section>
  )
}
