"use client"

/*
 * The hero headline. The first line names the category; the second says what the components are built for, and its
 * verb performs itself one at a time (slide, grow, unfold, rise, roll, drop): each arrives the way Keyframery moves
 * that thing. The slot eases to each verb's width, so the line re-centres smoothly. Crawlers and screen readers get
 * the plain sentence; under reduced motion it stays on "Built to move." Pauses while off screen.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

const WORDS = [
  { word: "slide", cut: "slide" },
  { word: "grow", cut: "grow" },
  { word: "unfold", cut: "unfold" },
  { word: "rise", cut: "rise" },
  { word: "roll", cut: "roll" },
  { word: "drop", cut: "drop" },
] as const
const REST = "move"
const HOLD = 2200

const subscribeMotion = (notify: () => void) => {
  const q = matchMedia("(prefers-reduced-motion: reduce)")
  q.addEventListener("change", notify)
  return () => q.removeEventListener("change", notify)
}

export function HeroTitle({ className }: { className?: string }) {
  const reduced = React.useSyncExternalStore(subscribeMotion, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => false)
  const [i, setI] = React.useState(-1) // -1: the server line, "Built to move."
  const [prev, setPrev] = React.useState<number | null>(null)
  const [widths, setWidths] = React.useState<number[]>([])
  const [inView, setInView] = React.useState(true)
  const root = React.useRef<HTMLDivElement>(null)
  const measure = React.useRef<HTMLSpanElement>(null)

  // Measure every word once fonts are ready, so the slot can ease to each width.
  React.useEffect(() => {
    const read = () => setWidths([...(measure.current?.children ?? [])].map((c) => (c as HTMLElement).offsetWidth))
    read()
    document.fonts?.ready.then(read)
    addEventListener("resize", read)
    return () => removeEventListener("resize", read)
  }, [])

  React.useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  React.useEffect(() => {
    if (reduced || !inView) return
    const t = setTimeout(() => {
      setPrev(i)
      setI((n) => (n + 1) % WORDS.length)
    }, i === -1 ? 1400 : HOLD)
    return () => clearTimeout(t)
  }, [i, reduced, inView])

  const current = i === -1 ? null : WORDS[i]
  const width = i === -1 ? widths[WORDS.length] : widths[i]

  return (
    // The heading is the plain sentence, so search engines, AI tools and screen readers read exactly that. The animated
    // copy and the measuring words sit beside it, hidden from them, and only look like the heading.
    <div ref={root} className={className}>
      <h1 id="hero-title" className="sr-only">
        The component library for UI SDK. Built to move. Built for agents.
      </h1>
      <span aria-hidden="true">
        {/* On phones the category line breaks after "library", so it never re-wraps mid-phrase. */}
        <span className="max-sm:block">The component library</span> for UI SDK.
        <span className="block text-white/75">
          Built to{" "}
          <span
            className="relative inline-block h-[1.08em] align-bottom text-white transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: width ? `${width}px` : undefined }}
          >
            {/* The outgoing verb leaves while the new one arrives. */}
            {prev !== null && prev !== i && (
              <span key={`out-${prev}-${i}`} data-w={prev === -1 ? "fade" : WORDS[prev].cut} className="lp-word-out absolute top-0 left-0 whitespace-nowrap">
                {prev === -1 ? REST : WORDS[prev].word}
              </span>
            )}
            <span key={`in-${i}`} data-w={current?.cut ?? "none"} className={cn("absolute top-0 left-0 whitespace-nowrap", current && "lp-word-in")}>
              {current?.word ?? REST}
            </span>
            {/* Server and no-JS width: the resting verb. */}
            {!width && <span className="invisible">{REST}</span>}
          </span>
          . <span className="max-sm:block">Built for agents.</span>
        </span>
      </span>
      {/* Off-screen copies for measuring widths at the headline's own size. */}
      <span ref={measure} aria-hidden="true" className="pointer-events-none invisible absolute top-0 left-0 whitespace-nowrap">
        {WORDS.map((w) => (
          <span key={w.word} className="inline-block">
            {w.word}
          </span>
        ))}
        <span className="inline-block">{REST}</span>
      </span>
    </div>
  )
}
