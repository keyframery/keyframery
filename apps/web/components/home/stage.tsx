"use client"

/* The wall and its timeline share Director's on/off state. */

import * as React from "react"

import { Timeline } from "./timeline"
import { Wall } from "./wall"

export function HomeStage() {
  const [director, setDirector] = React.useState(false)
  return (
    <>
      <Wall />
      <Timeline director={director} onDirector={setDirector} />
    </>
  )
}
