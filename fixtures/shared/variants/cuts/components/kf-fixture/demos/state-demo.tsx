"use client"

import * as React from "react"

import { StateCut } from "@/components/keyframery/state-cut"
import { Button } from "@/components/ui/button"

export function StateDemo() {
  const [view, setView] = React.useState("empty")
  const [cut, setCut] = React.useState<"fade" | "slide" | "none">("fade")
  const [off, setOff] = React.useState(false)
  const [mounted, setMounted] = React.useState(true)
  const [edits, setEdits] = React.useState(0)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const clearTimers = React.useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])
  React.useEffect(() => clearTimers, [clearTimers])
  const change = (next: string) => {
    clearTimers()
    setView(next)
  }
  const interrupt = () => {
    clearTimers()
    setView("success")
    timers.current = [setTimeout(() => setView("error"), 30), setTimeout(() => setView("empty"), 60)]
  }
  return (
    <section className="grid max-w-xl gap-3" data-testid="state-demo">
      <h2 className="font-medium">StateCut</h2>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" data-testid="state-empty" onClick={() => change("empty")}>Empty</Button>
        <Button variant="outline" data-testid="state-success" onClick={() => change("success")}>Success</Button>
        <Button variant="outline" data-testid="state-error" onClick={() => change("error")}>Error</Button>
        <Button variant="outline" data-testid="state-interrupt" onClick={interrupt}>Rapid switches</Button>
        <Button variant="outline" data-testid="state-toggle" onClick={() => setMounted((value) => !value)}>Toggle helper</Button>
        <Button variant="outline" data-testid="state-opt-out" onClick={() => setOff((value) => !value)}>Ancestor opt-out</Button>
        {(["fade", "slide", "none"] as const).map((kind) => (
          <Button key={kind} variant="outline" data-testid={`state-cut-${kind}`} onClick={() => setCut(kind)}>{kind}</Button>
        ))}
      </div>
      <div data-cut={off ? "none" : undefined}>
        {mounted && (
          <StateCut state={view} cut={cut}>
            <div className="rounded-md border p-4" data-testid="state-view">
              <h3 data-testid="state-heading">{view === "empty" ? "No records yet" : view === "success" ? "Record saved" : "Save failed"}</h3>
              {view === "success" && <div className="my-3 h-24 rounded bg-muted/50" />}
              <label htmlFor="state-note">Record note</label>
              <input id="state-note" data-testid="state-note" className="ml-2 rounded border px-2" defaultValue={`${view} note`} />
              <button type="button" data-testid="state-edit" className="ml-2 underline" onClick={() => setEdits((value) => value + 1)}>Edit note</button>
              <p data-testid="state-edits">Edits: {edits}</p>
            </div>
          </StateCut>
        )}
      </div>
      <p className="text-sm text-muted-foreground" data-testid="below-state">Text below the state.</p>
    </section>
  )
}
