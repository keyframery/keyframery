"use client"

import { ArrowUp, Check } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const R = 19
const C = 2 * Math.PI * R

/**
 * A ring at the bottom of the screen that fills as you read the article, and turns into a check at the end.
 * It's also the way back to the top. The article itself is plain server-rendered HTML; this only reads the
 * scroll position, so crawlers and AI bots (which don't scroll or run it) see exactly the same text.
 */
export function ReadingRing({ target }: { target: string }) {
  const [progress, setProgress] = useState(0)
  const frame = useRef(0)

  useEffect(() => {
    const article = document.getElementById(target)
    if (!article) return
    const measure = () => {
      frame.current = 0
      const { top, height } = article.getBoundingClientRect()
      // 0 when the article's top reaches the top of the screen, 1 when its end reaches the bottom.
      const span = height - window.innerHeight
      setProgress(span <= 0 ? 1 : Math.min(1, Math.max(0, -top / span)))
    }
    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(frame.current)
    }
  }, [target])

  const done = progress >= 0.995
  const shown = progress > 0.02

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      aria-label={done ? "Finished reading. Back to top" : `${Math.round(progress * 100)}% read. Back to top`}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      data-done={done || undefined}
      className="group fixed right-4 bottom-4 z-40 grid size-12 place-items-center rounded-full border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-[opacity,transform] duration-200 ease-out outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-done:text-foreground motion-reduce:transition-none md:right-6 md:bottom-6 [&:not([aria-hidden=false])]:pointer-events-none [&:not([aria-hidden=false])]:translate-y-2 [&:not([aria-hidden=false])]:opacity-0"
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle cx="24" cy="24" r={R} fill="none" strokeWidth="2.5" className="stroke-border" />
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          className="stroke-foreground transition-[stroke-dashoffset] duration-150 ease-out motion-reduce:transition-none"
        />
      </svg>
      {done ? (
        <Check aria-hidden="true" className="size-4 animate-in zoom-in-50 fade-in-0 duration-200" />
      ) : (
        <ArrowUp aria-hidden="true" className="size-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5" />
      )}
    </button>
  )
}
