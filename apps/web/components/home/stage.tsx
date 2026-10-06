"use client"

/* The wall and its timeline share Director's on/off state. */

import { useSearchParams } from "next/navigation"
import * as React from "react"

import { Director } from "./director"
import { Timeline } from "./timeline"
import { Wall } from "./wall"

/** ?director=fast shortens the idle wait to 500 ms (used by the tests). */
function IdleDirector({ active, onActiveChange }: { active: boolean; onActiveChange: (on: boolean) => void }) {
  const fast = useSearchParams().get("director") === "fast"
  return <Director active={active} onActiveChange={onActiveChange} idleMs={fast ? 500 : 4000} />
}

export function HomeStage() {
  const [director, setDirector] = React.useState(false)
  return (
    <>
      <Wall />
      <React.Suspense>
        <IdleDirector active={director} onActiveChange={setDirector} />
      </React.Suspense>
      <Timeline director={director} onDirector={setDirector} />
    </>
  )
}
