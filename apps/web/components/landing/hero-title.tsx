"use client"

/*
 * The hero headline. The second line names one thing at a time — dialogs, tabs, lists, toasts, numbers, menus —
 * and each word arrives the way Keyframery moves that thing: a dialog grows, a tab slides across, a list item
 * drops in, a toast rises, a number rolls, a menu unfolds. The slot eases to each word's width, so the line
 * re-centres smoothly. Crawlers and screen readers get the plain sentence; under reduced motion it stays on
 * "app animates." Pauses while off screen.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

const WORDS = [
  { word: "dialogs", cut: "grow" },
  { word: "tabs", cut: "slide" },
  { word: "lists", cut: "drop" },
  { word: "toasts", cut: "rise" },
  { word: "numbers", cut: "roll" },
  { word: "menus", cut: "unfold" },
] as const
const HOLD = 2200

const subscribeMotion = (notify: () => void) => {
  const q = matchMedia("(prefers-reduced-motion: reduce)")
  q.addEventListener("change", notify)
  return () => q.removeEventListener("change", notify)
}

export function HeroTitle({ className }: { className?: string }) {
  const reduced = React.useSyncExternalStore(subscribeMotion, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => false)
  const [i, setI] = React.useState(-1) // -1: the server line, "app animates."
  const [prev, setPrev] = React.useState<number | null>(null)
  const [widths, setWidths] = React.useState<number[]>([])
  const [inView, setInView] = React.useState(true)
  const root = React.useRef<HTMLHeadingElement>(null)
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
    <h1 ref={root} id="hero-title" className={className}>
      <span className="sr-only">Add one line. Your shadcn/ui app animates.</span>
      <span aria-hidden="true">
        Add one line.
        <span className="block text-white/75">
          Your shadcn/ui{" "}
          <span
            className="relative inline-block h-[1.08em] align-bottom text-white transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: width ? `${width}px` : undefined }}
          >
            {/* The outgoing word leaves while the new one arrives. */}
            {prev !== null && prev !== i && (
              <span key={`out-${prev}-${i}`} data-w={prev === -1 ? "fade" : WORDS[prev].cut} className="lp-word-out absolute top-0 left-0 whitespace-nowrap">
                {prev === -1 ? "app" : WORDS[prev].word}
              </span>
            )}
            <span key={`in-${i}`} data-w={current?.cut ?? "none"} className={cn("absolute top-0 left-0 whitespace-nowrap", current && "lp-word-in")}>
              {current?.word ?? "app"}
            </span>
            {/* Server and no-JS width: "app". */}
            {!width && <span className="invisible">app</span>}
          </span>{" "}
          {current ? "animate." : "animates."}
        </span>
      </span>
      {/* Off-screen copies for measuring widths at the headline's own size. */}
      <span ref={measure} aria-hidden="true" className="pointer-events-none invisible absolute top-0 left-0 whitespace-nowrap">
        {WORDS.map((w) => (
          <span key={w.word} className="inline-block">
            {w.word}
          </span>
        ))}
        <span className="inline-block">app</span>
      </span>
    </h1>
  )
}
