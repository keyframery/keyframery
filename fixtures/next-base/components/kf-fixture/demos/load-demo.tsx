"use client"

import * as React from "react"

import { LoadCut } from "@/components/keyframery/load-cut"
import { Button } from "@/components/ui/button"

export function LoadDemo() {
  const [loading, setLoading] = React.useState(false)
  const [version, setVersion] = React.useState(0)
  const load = (ms: number) => {
    setLoading(true)
    setTimeout(() => {
      setVersion((v) => v + 1)
      setLoading(false)
    }, ms)
  }
  const flip = () => {
    load(700) // skeleton up at 300, data at 700, dissolve starts at 700…
    setTimeout(() => load(500), 760) // …and loading starts again mid-dissolve
  }
  return (
    <section className="grid max-w-xl gap-3" data-testid="load-demo">
      <h2 className="font-medium">LoadCut</h2>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" data-testid="load-fast" onClick={() => load(120)}>Fast load</Button>
        <Button variant="outline" data-testid="load-edge" onClick={() => load(350)}>Just after the hold</Button>
        <Button variant="outline" data-testid="load-slow" onClick={() => load(900)}>Slow load</Button>
        <Button variant="outline" data-testid="load-flip" onClick={flip}>Load again mid-dissolve</Button>
      </div>
      <LoadCut loading={loading} skeleton={<div data-testid="load-skeleton" className="h-16 rounded-md bg-muted" />}>
        <div data-testid="load-content" className="rounded-md border p-4">
          Report #{version}
          <div className="mt-2 h-24 rounded bg-muted/50" />
        </div>
      </LoadCut>
      <p className="text-sm text-muted-foreground" data-testid="below-load">Text below the loader.</p>
    </section>
  )
}
