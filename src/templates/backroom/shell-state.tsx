"use client"

/* What the shell has open: the command menu, the appearance drawer, the shortcuts dialog and the
   sign-out confirmation. Several places open the same thing (the header, the profile menu, the
   command menu, a keyboard shortcut), so it lives here rather than in each trigger. */

import * as React from "react"

type Panel = "command" | "appearance" | "shortcuts" | "signOut"

type ShellState = {
  open: Record<Panel, boolean>
  setOpen: (panel: Panel, open: boolean) => void
  /** Bumps when the page should play its arrival again (after the motion style or speed changed). */
  replay: number
  replayPage: () => void
}

const ShellContext = React.createContext<ShellState | null>(null)

export function ShellStateProvider({ children }: { children: React.ReactNode }) {
  const [open, setAll] = React.useState<Record<Panel, boolean>>({ command: false, appearance: false, shortcuts: false, signOut: false })
  const setOpen = React.useCallback((panel: Panel, next: boolean) => setAll((now) => (now[panel] === next ? now : { ...now, [panel]: next })), [])
  const [replay, setReplay] = React.useState(0)
  const replayPage = React.useCallback(() => setReplay((n) => n + 1), [])
  const value = React.useMemo(() => ({ open, setOpen, replay, replayPage }), [open, setOpen, replay, replayPage])
  return <ShellContext value={value}>{children}</ShellContext>
}

export function useShellState() {
  const state = React.useContext(ShellContext)
  if (!state) throw new Error("useShellState must be used inside the Backroom shell.")
  return state
}
