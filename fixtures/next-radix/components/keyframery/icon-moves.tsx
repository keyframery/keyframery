"use client"

/* IconMoves: when a control with an icon is pressed, its icon plays its own move: a gear turns, a bell
   rings, a lid lifts. Render it once, next to <Cuts />. Hover moves are opt-in (on="hover"), because people
   hover hundreds of times a day and motion that often turns into noise. */

import { useEffect } from "react"

import { playMove } from "@/lib/keyframery/moves"

export type IconMovesProps = {
  /** "press" (default): when the control is pressed. "hover": also when the pointer arrives on it. */
  on?: "press" | "hover"
}

/** Controls whose icon may move. Chevrons, carets and spinners are state icons, handled by <Cuts />. */
const CONTROLS = [
  "button",
  "sidebar-menu-button",
  "sidebar-menu-sub-button",
  "sidebar-menu-action",
  "collapsible-trigger",
  "dropdown-menu-item",
  "context-menu-item",
  "menubar-item",
  "command-item",
  "tabs-trigger",
  "toggle",
  "toggle-group-item",
  "navigation-menu-link",
]
  .map((s) => `[data-slot="${s}"]`)
  .join(",")
const STATE_ICON = /^lucide-(chevron|chevrons|caret|grip|loader)/

function iconOf(control: Element): SVGSVGElement | null {
  for (const svg of control.querySelectorAll("svg")) {
    if (svg.parentElement?.closest(CONTROLS) !== control) continue // it belongs to a control inside this one
    if ([...svg.classList].some((c) => STATE_ICON.test(c))) continue
    return svg
  }
  return null
}

export function IconMoves({ on = "press" }: IconMovesProps) {
  useEffect(() => {
    const html = document.documentElement
    const play = (target: EventTarget | null) => {
      const control = target instanceof Element ? target.closest(CONTROLS) : null
      if (!control || !html.hasAttribute("data-kf") || html.getAttribute("data-kf-responses") === "none") return
      if (control.closest('[data-cut="none"]') || control.matches(":disabled, [aria-disabled='true'], [data-disabled]")) return
      const svg = iconOf(control)
      if (svg) playMove(svg)
    }
    const onPress = (e: PointerEvent) => play(e.target)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") play(e.target)
    }
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !(e.target instanceof Element)) return
      const control = e.target.closest(CONTROLS)
      if (control && !(e.relatedTarget instanceof Node && control.contains(e.relatedTarget))) play(control)
    }
    document.addEventListener("pointerdown", onPress, true)
    document.addEventListener("keydown", onKey, true)
    if (on === "hover") document.addEventListener("pointerover", onOver, true)
    return () => {
      document.removeEventListener("pointerdown", onPress, true)
      document.removeEventListener("keydown", onKey, true)
      document.removeEventListener("pointerover", onOver, true)
    }
  }, [on])
  return null
}
