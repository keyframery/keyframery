"use client"

import { useEffect, useLayoutEffect } from "react"

import { applyMenus, setEnabled, setPace, start, type Menus } from "@/lib/keyframery/engine"

import "./keyframery.css"

export type CutsProps = Menus & {
  /** Duration multiplier for the whole app. Beats --kf-pace in your CSS. */
  pace?: number
  /** false = stock shadcn motion everywhere. */
  enabled?: boolean
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

/** Film cuts for shadcn. Render once, in your root layout. */
export function Cuts({ dialog, sheet, drawer, tabs, toast, pace, enabled = true }: CutsProps) {
  useIsoLayoutEffect(() => {
    applyMenus({ dialog, sheet, drawer, tabs, toast })
  }, [dialog, sheet, drawer, tabs, toast])
  useIsoLayoutEffect(() => {
    setEnabled(enabled)
  }, [enabled])
  useIsoLayoutEffect(() => {
    setPace(pace)
  }, [pace])
  useEffect(() => start(), [])
  return null
}
