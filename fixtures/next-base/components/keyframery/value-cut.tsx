"use client"

/* ValueCut: a value that changes in place (a price, a count, "Pending → Paid") punches in. */

import * as React from "react"

import { easingOf, emitCut, reducedMotion, scaled } from "@/lib/keyframery/motion"
import { optedOut } from "@/lib/keyframery/state"
import { changedUnits, formatValue, previousUnit, unitsOf } from "@/lib/keyframery/value"

export type ValueCutProps = {
  value: number | string
  /** Intl.NumberFormat options (numbers only). */
  format?: Intl.NumberFormatOptions
  locale?: string
  /** Also announce changes to screen readers (aria-live="polite"). */
  announce?: boolean
  /** Duration multiplier for this value. */
  pace?: number
  /** "none" swaps the value instantly. */
  cut?: "punch-in" | "none"
  className?: string
}


export function ValueCut({ value, format, locale, announce, pace, cut, className }: ValueCutProps) {
  const text = formatValue(value, locale, format)
  const units = unitsOf(value, text)
  const rowRef = React.useRef<HTMLSpanElement>(null)
  const before = React.useRef<{ value: number | string; units: string[]; width: number } | null>(null)

  React.useLayoutEffect(() => {
    const row = rowRef.current
    if (!row) return
    const prev = before.current
    const width = row.getBoundingClientRect().width
    before.current = { value, units, width }
    if (!prev || prev.units.join("") === units.join("") || optedOut(row) || reducedMotion()) return
    const numeric = typeof value === "number" && typeof prev.value === "number"
    const up = numeric ? (value as number) >= (prev.value as number) : true
    const travel = numeric ? "100%" : "6px"
    const ms = scaled(300, row)
    const enterEase = easingOf(row)
    const exitEase = easingOf(row, "exit", "cubic-bezier(0.4, 0, 1, 1)")
    const changed = changedUnits(prev.units, units)
    row.querySelectorAll<HTMLElement>(":scope > [data-kf-cell]").forEach((cell, i) => {
      if (!changed[i]) return
      ;(cell.firstElementChild as HTMLElement).animate(
        [
          { translate: `0 ${up ? travel : `-${travel}`}`, opacity: 0 },
          { translate: "0 0", opacity: 1 },
        ],
        { duration: ms, easing: enterEase },
      )
      const old = previousUnit(prev.units, units, i)
      if (old === undefined) return
      const ghost = document.createElement("span")
      ghost.textContent = old
      ghost.setAttribute("aria-hidden", "true")
      ghost.setAttribute("data-kf-ghost", "")
      Object.assign(ghost.style, { position: "absolute", inset: "0", whiteSpace: "pre" })
      cell.append(ghost)
      const done = () => ghost.remove()
      ghost
        .animate(
          [
            { translate: "0 0", opacity: 1 },
            { translate: `0 ${up ? `-${travel}` : travel}`, opacity: 0 },
          ],
          { duration: ms * 0.8, easing: exitEase, fill: "forwards" },
        )
        .finished.then(done, done)
    })
    if (Math.abs(width - prev.width) > 0.5) row.animate([{ width: `${prev.width}px` }, { width: `${width}px` }], { duration: ms, easing: enterEase })
    // The punch peaks at 0.35 with this curve; the theme's steeper entrance curves would make it an instant pop.
    row.animate([{ scale: "1" }, { scale: "1.06", offset: 0.35 }, { scale: "1" }], { duration: ms, easing: "ease-out" })
    emitCut({ cut: "punch-in", component: "value", phase: "enter", ms: Math.round(ms) })
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span
      data-slot="value-cut"
      data-cut={cut === "none" ? "none" : undefined}
      className={className}
      style={pace ? ({ "--kf-pace": pace } as React.CSSProperties) : undefined}
    >
      <span ref={rowRef} aria-hidden="true" style={{ display: "inline-flex", fontVariantNumeric: "tabular-nums", whiteSpace: "pre", verticalAlign: "bottom" }}>
        {units.map((unit, i) => (
          <span key={units.length - i} data-kf-cell="" style={{ position: "relative", display: "inline-block", overflow: "clip" }}>
            <span style={{ display: "inline-block" }}>{unit}</span>
          </span>
        ))}
      </span>
      <span className="sr-only" aria-live={announce ? "polite" : undefined}>
        {text}
      </span>
    </span>
  )
}
