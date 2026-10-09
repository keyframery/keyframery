"use client"

/* The site's one <Cuts />. The Theme page changes its cuts and pace through this context. */

import * as React from "react"

import { Cuts } from "@/components/keyframery/cuts"
import { IconMoves } from "@/components/keyframery/icon-moves"
import type { Menus } from "@/lib/keyframery/engine"

type Control = {
  enabled: boolean
  pace: number | undefined
  menus: Menus
  setEnabled: (on: boolean) => void
  setPace: (pace: number | undefined) => void
  setMenus: React.Dispatch<React.SetStateAction<Menus>>
  reset: () => void
}

const CutsContext = React.createContext<Control | null>(null)

export function CutsControl({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = React.useState(true)
  const [pace, setPace] = React.useState<number | undefined>(undefined)
  const [menus, setMenus] = React.useState<Menus>({})
  const reset = React.useCallback(() => {
    setEnabled(true)
    setPace(undefined)
    setMenus({})
  }, [])
  const value = React.useMemo(() => ({ enabled, pace, menus, setEnabled, setPace, setMenus, reset }), [enabled, pace, menus, reset])
  return (
    <CutsContext.Provider value={value}>
      {children}
      <Cuts {...menus} pace={pace} enabled={enabled} />
      <IconMoves />
    </CutsContext.Provider>
  )
}

export function useCutsControl(): Control {
  const ctx = React.useContext(CutsContext)
  if (!ctx) throw new Error("useCutsControl must be used inside <CutsControl>")
  return ctx
}
