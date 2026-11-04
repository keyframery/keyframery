"use client"

/*
 * The closing panel's backdrop: a dim horizon drawn as a timeline. Keyframe diamonds sit along the arc and a
 * point of light runs across it, lighting each diamond as it passes, the way a playhead crosses keyframes.
 * Runs only while on screen; under reduced motion the light rests in the middle.
 */

import * as React from "react"

const W = 1400
const H = 640
// Quadratic arc: from (x0, y0) through control (W/2, cy) to (x1, y0).
const A = { x0: -80, y0: 600, cx: W / 2, cy: 250, x1: W + 80 }
const at = (t: number) => {
  const u = 1 - t
  return { x: u * u * A.x0 + 2 * u * t * A.cx + t * t * A.x1, y: u * u * A.y0 + 2 * u * t * A.cy + t * t * A.y0 }
}
const KEYS = Array.from({ length: 11 }, (_, i) => 0.12 + (i * 0.76) / 10)
const PATH = `M ${A.x0} ${A.y0} Q ${A.cx} ${A.cy} ${A.x1} ${A.y0}`
const LOOP = 7000

const subscribeMotion = (notify: () => void) => {
  const q = matchMedia("(prefers-reduced-motion: reduce)")
  q.addEventListener("change", notify)
  return () => q.removeEventListener("change", notify)
}

export function KeyframeArc() {
  const svg = React.useRef<SVGSVGElement>(null)
  const head = React.useRef<SVGGElement>(null)
  const keys = React.useRef<(SVGPathElement | null)[]>([])
  const reduced = React.useSyncExternalStore(subscribeMotion, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => false)

  React.useEffect(() => {
    const paint = (t: number) => {
      const p = at(t)
      head.current?.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`)
      keys.current.forEach((k, i) => {
        if (!k) return
        const d = t - KEYS[i]
        // Lit as the light arrives, then a slow fade behind it.
        const glow = d >= -0.015 && d < 0.25 ? Math.max(0, 1 - Math.max(0, d) / 0.25) : 0
        k.style.opacity = String(0.28 + glow * 0.72)
        k.style.fill = glow > 0.05 ? `rgb(${Math.round(128 + 127 * glow)} ${Math.round(152 + 103 * glow)} 255)` : "transparent"
      })
    }
    if (reduced) {
      paint(0.5)
      return
    }
    let raf = 0
    let start = 0
    let running = false
    const frame = (now: number) => {
      if (!start) start = now
      paint(((now - start) % LOOP) / LOOP)
      raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true
        raf = requestAnimationFrame(frame)
      } else if (!e.isIntersecting && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    if (svg.current) io.observe(svg.current)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [reduced])

  return (
    <svg ref={svg} aria-hidden="true" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 -z-10 h-full w-full">
      <defs>
        <linearGradient id="kf-arc" x1="0" x2="1">
          <stop offset="0" stopColor="#8098ff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#a9b8ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#8098ff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="kf-sky" cx="0.5" cy="1" r="0.75">
          <stop offset="0" stopColor="#2f4fd8" stopOpacity="0.28" />
          <stop offset="0.6" stopColor="#6d5cf6" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="kf-head">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#a9b8ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#8098ff" stopOpacity="0" />
        </radialGradient>
        <filter id="kf-blur" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#kf-sky)" />
      {/* Below the arc stays dark: the planet. */}
      <path d={`${PATH} L ${A.x1} ${H} L ${A.x0} ${H} Z`} fill="#050608" />
      <path d={PATH} fill="none" stroke="#8098ff" strokeOpacity="0.35" strokeWidth="14" filter="url(#kf-blur)" />
      <path d={PATH} fill="none" stroke="url(#kf-arc)" strokeWidth="1.5" />
      {KEYS.map((t, i) => {
        const p = at(t)
        return (
          <path
            key={t}
            ref={(el) => {
              keys.current[i] = el
            }}
            d={`M ${p.x} ${p.y - 7} L ${p.x + 7} ${p.y} L ${p.x} ${p.y + 7} L ${p.x - 7} ${p.y} Z`}
            fill="transparent"
            stroke="#a9b8ff"
            strokeWidth="1.25"
            style={{ opacity: 0.28 }}
          />
        )
      })}
      <g ref={head} transform={`translate(${at(0.5).x} ${at(0.5).y})`}>
        <circle r="60" fill="url(#kf-head)" opacity="0.6" />
        <circle r="3.5" fill="#fff" />
      </g>
    </svg>
  )
}
