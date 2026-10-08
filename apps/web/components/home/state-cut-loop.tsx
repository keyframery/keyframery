"use client"

import * as React from "react"

import { StateCut } from "@/components/keyframery/state-cut"

const states = [
  { label: "No records yet", detail: "Create your first record to get started." },
  { label: "Record saved", detail: "Your changes are ready for the team." },
  { label: "Needs a review", detail: "Add a title before sharing this record. Your draft is still here." },
]

export function StateCutLoop({ bare = false }: { bare?: boolean } = {}) {
  const [state, setState] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)
  const next = React.useCallback(() => setState((value) => (value + 1) % states.length), [])

  React.useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)")
    let visible = false
    let timer: ReturnType<typeof setInterval> | undefined
    const update = () => {
      clearInterval(timer)
      if (visible && !query.matches) timer = setInterval(next, 2200)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      update()
    })
    if (ref.current) observer.observe(ref.current)
    query.addEventListener("change", update)
    return () => {
      clearInterval(timer)
      observer.disconnect()
      query.removeEventListener("change", update)
    }
  }, [next])

  return (
    <div ref={ref} className={bare ? "relative grid h-52 place-items-center overflow-hidden p-6" : "relative grid min-h-56 place-items-center overflow-hidden rounded-xl border bg-card p-6"}>
      <div className="grid w-full max-w-sm gap-3">
        <StateCut state={state}>
          <div className="rounded-lg border bg-background p-3 text-sm">
            <p className="font-medium">{states[state].label}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{states[state].detail}</p>
          </div>
        </StateCut>
        <button type="button" onClick={next} className="w-fit rounded-md border bg-background px-2.5 py-1 text-xs outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          Change status
        </button>
      </div>
    </div>
  )
}
