"use client"

import { useEffect } from "react"

/** The stock twin: no Keyframery at all, only the hydration marker the tests wait for. */
export function KfCuts() {
  useEffect(() => document.documentElement.setAttribute("data-fixture-ready", ""), [])
  return null
}
