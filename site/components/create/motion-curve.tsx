"use client"

/* The preset's motion, drawn: the two springs every component eases with (--ease-spring for moves,
   --ease-pop for small payoffs) as curves over time, with the dashed line where a move lands. What
   rises above it is the overshoot. The curves redraw from the start whenever the motion changes, at
   the preset's own pace, so the picture and the preview agree. */

import * as React from "react"

import type { Preset } from "@site/lib/preset"
import { presetMotion } from "@site/lib/preset-tokens"

/* "linear(0, 0.2 10%, 0.5, 1)": values with optional positions; missing positions spread evenly. */
function points(easing: string): [number, number][] {
  const parts = easing.slice(easing.indexOf("(") + 1, easing.lastIndexOf(")")).split(",").map((part) => part.trim().split(/\s+/))
  const out: [number, number | null][] = parts.map(([value, at]) => [Number(value), at ? Number(at.replace("%", "")) / 100 : null])
  out[0][1] ??= 0
  out[out.length - 1][1] ??= 1
  for (let i = 1; i < out.length - 1; i++) {
    if (out[i][1] !== null) continue
    let j = i
    while (out[j][1] === null) j++
    const from = out[i - 1][1]!
    const to = out[j][1]!
    for (let k = i; k < j; k++) out[k][1] = from + ((to - from) * (k - i + 1)) / (j - i + 1)
  }
  return out.map(([value, at]) => [at!, value])
}

const W = 280
const H = 120
const TOP = 1.35 // the highest value drawn, so a 30% pop still fits
const y = (value: number) => H - 10 - (value / TOP) * (H - 20)
const path = (easing: string) => points(easing).map(([t, v], i) => `${i ? "L" : "M"}${(t * W).toFixed(1)},${y(v).toFixed(1)}`).join("")
const peak = (easing: string) => Math.max(0, Math.round((Math.max(...points(easing).map(([, v]) => v)) - 1) * 100))

export function MotionCurve({ preset }: { preset: Preset }) {
  const motion = presetMotion(preset)
  const key = `${preset.motion}|${preset.speed}|${preset.bounce}`
  return (
    <figure className="flex min-h-[150px] flex-1 flex-col rounded-[10px] bg-muted/60 p-3 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.04)]">
      <figcaption className="flex items-center gap-3 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-3 rounded-full bg-foreground" />
          Spring <span className="text-foreground tabular-nums">{peak(motion.spring)}%</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-3 rounded-full bg-[var(--cut)]" />
          Pop <span className="text-foreground tabular-nums">{peak(motion.pop)}%</span>
        </span>
        <span className="ms-auto tabular-nums">{motion.speed}× time</span>
      </figcaption>
      <svg
        key={key}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Spring overshoots ${peak(motion.spring)}%, pop ${peak(motion.pop)}%, durations ${motion.speed} times the base`}
        className="mt-2 min-h-[96px] w-full flex-1 overflow-visible"
        style={{ "--kf-speed": motion.speed } as React.CSSProperties}
      >
        <line x1="0" x2={W} y1={y(1)} y2={y(1)} className="stroke-border" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        <line x1="0" x2={W} y1={y(0)} y2={y(0)} className="stroke-border" vectorEffect="non-scaling-stroke" />
        <path d={path(motion.pop)} pathLength={1} className="kf-curve stroke-[var(--cut)]" fill="none" strokeWidth="1.75" vectorEffect="non-scaling-stroke" />
        <path d={path(motion.spring)} pathLength={1} className="kf-curve stroke-foreground" fill="none" strokeWidth="1.75" vectorEffect="non-scaling-stroke" />
      </svg>
    </figure>
  )
}
