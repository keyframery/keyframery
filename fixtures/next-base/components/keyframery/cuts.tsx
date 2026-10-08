"use client"

import { useEffect, useLayoutEffect } from "react"

import { applyMenus, setEnabled, setPace, setResponses, start, type Menus, type Responses } from "@/lib/keyframery/engine"

import "./keyframery.css"

export type CutsProps = Menus & {
  /** Duration multiplier for the whole app. Beats --kf-pace in your CSS. */
  pace?: number
  /** false = stock shadcn motion everywhere. */
  enabled?: boolean
  /** "none" keeps the cuts but turns off how controls answer a press, a tick or a drag. */
  responses?: Responses
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

/** Film cuts for shadcn. Render once, in your root layout. */
export function Cuts({ dialog, sheet, drawer, tabs, toast, pace, enabled = true, responses }: CutsProps) {
  useIsoLayoutEffect(() => {
    applyMenus({ dialog, sheet, drawer, tabs, toast })
  }, [dialog, sheet, drawer, tabs, toast])
  useIsoLayoutEffect(() => {
    setEnabled(enabled)
  }, [enabled])
  useIsoLayoutEffect(() => {
    setPace(pace)
  }, [pace])
  useIsoLayoutEffect(() => {
    setResponses(responses)
  }, [responses])
  useEffect(() => start(), [])
  return null
}
