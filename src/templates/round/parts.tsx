"use client"

/* Small shared pieces of the Round landing page: money that rolls, a face, and the three page
   behaviours (reveal on scroll, sheets that stack, things that start when they come into view). */

import { motion, useMotionValue, useSpring } from "motion/react"
import * as React from "react"

import { currencies, type CurrencyId, type Person } from "./data"

/* ---------------------------------------------------------------- currency */

const CurrencyContext = React.createContext<CurrencyId>("usd")
export const CurrencyProvider = CurrencyContext.Provider
export const useCurrency = () => React.useContext(CurrencyContext)

/** A dollar amount in the chosen currency. Formatted by hand so the server and the browser always agree. */
export function formatMoney(usd: number, id: CurrencyId, whole = false) {
  const { symbol, rate, digits } = currencies[id]
  const [int, fraction] = Math.max(0, usd * rate).toFixed(whole ? 0 : digits).split(".")
  return symbol + int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (fraction ? `.${fraction}` : "")
}

/* ---------------------------------------------------------------- rolling figures */

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

/** Text whose digits roll to their new value. Columns are keyed from the right, so the units stay the units when a figure grows. */
export function Roll({ value, className }: { value: string; className?: string }) {
  const chars = [...value]
  return (
    <span className={className ? `rnd-roll ${className}` : "rnd-roll"}>
      <span className="rnd-sr">{value}</span>
      <span aria-hidden className="rnd-roll-row">
        {chars.map((char, index) => {
          const place = chars.length - index
          return /\d/.test(char) ? (
            <span key={`d${place}`} className="rnd-roll-digit" style={{ "--d": char } as React.CSSProperties}>
              <span className="rnd-roll-strip">
                {DIGITS.map((digit) => (
                  <span key={digit}>{digit}</span>
                ))}
              </span>
            </span>
          ) : (
            <span key={`c${place}${char}`} className="rnd-roll-char">
              {char}
            </span>
          )
        })}
      </span>
    </span>
  )
}

/** An amount in the visitor's currency, rolling when it changes. */
export function Money({ usd, whole, className }: { usd: number; whole?: boolean; className?: string }) {
  return <Roll value={formatMoney(usd, useCurrency(), whole)} className={className} />
}

/* ---------------------------------------------------------------- faces */

/** A person's photo, or their initial on their own colour. `onSlice` is for a face sitting on that person's own slice, where the colours swap. */
export function Face({ who, size, onSlice }: { who: Person; size?: number; onSlice?: boolean }) {
  const style = { "--face": onSlice ? who.ink : who.chip, "--face-ink": onSlice ? who.tone : who.chipInk, ...(size ? { "--face-size": `${size}px` } : null) } as React.CSSProperties
  return (
    <span className="rnd-face" style={style} aria-hidden>
      {who.face ? <img src={who.face} alt="" loading="lazy" decoding="async" draggable={false} /> : <span>{who.name[0]}</span>}
    </span>
  )
}

/* ---------------------------------------------------------------- motion */

/** A button that leans toward the pointer and springs back when it leaves. Mouse only. */
export function Magnetic({ children, pull = 0.3 }: { children: React.ReactNode; pull?: number }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness: 260, damping: 14, mass: 0.5 }
  const left = useSpring(x, spring)
  const top = useSpring(y, spring)
  return (
    <motion.span
      style={{ display: "inline-flex", x: left, y: top }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return
        const box = event.currentTarget.getBoundingClientRect()
        x.set((event.clientX - box.left - box.width / 2) * pull)
        y.set((event.clientY - box.top - box.height / 2) * pull)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}

/**
 * How far the page has scrolled through something, from 0 to 1, as a motion value.
 * `measure` reads the screen each frame the page moves; put a spring on the result to make it glide.
 */
export function useScrollProgress(measure: () => number) {
  const progress = useMotionValue(0)
  const read = React.useRef(measure)
  read.current = measure
  React.useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      progress.set(Math.min(1, Math.max(0, read.current())))
    }
    const queue = () => (frame ||= requestAnimationFrame(update))
    update()
    window.addEventListener("scroll", queue, { passive: true })
    window.addEventListener("resize", queue)
    return () => {
      window.removeEventListener("scroll", queue)
      window.removeEventListener("resize", queue)
      cancelAnimationFrame(frame)
    }
  }, [progress])
  return progress
}

/* ---------------------------------------------------------------- page behaviours */

/** True once the element has come into view. It stays true. */
export function useSeen<T extends Element>(threshold = 0.4) {
  const ref = React.useRef<T>(null)
  const [seen, setSeen] = React.useState(false)
  React.useEffect(() => {
    const element = ref.current
    if (!element || seen) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setSeen(true), { threshold })
    observer.observe(element)
    return () => observer.disconnect()
  }, [seen, threshold])
  return [ref, seen] as const
}

/** The motion style's speed (Calm 1.35, Snappy 0.6…), so timers keep pace with the CSS. */
export function motionSpeed(element: Element | null) {
  if (!element) return 1
  return parseFloat(getComputedStyle(element).getPropertyValue("--kf-speed")) || 1
}

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Two things for the whole page, on one root element:
 * - anything marked data-reveal arrives when it scrolls into view;
 * - each .rnd-sheet sticks while the next one slides over it, and --cover (0 to 1) says how far that has gone.
 * Content is fully visible until this runs, so nothing depends on it to be readable.
 */
export function usePage(root: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const page = root.current
    if (!page) return
    page.dataset.ready = ""

    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.in = ""
          seen.unobserve(entry.target)
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    )
    page.querySelectorAll("[data-reveal]").forEach((element) => seen.observe(element))

    const sheets = [...page.querySelectorAll<HTMLElement>(".rnd-sheet")]
    let frame = 0
    const measure = () => {
      frame = 0
      const height = window.innerHeight
      sheets.forEach((sheet, index) => {
        // A sheet taller than the screen sticks once its last line is on screen.
        sheet.style.setProperty("--stick", `${Math.min(0, height - sheet.offsetHeight)}px`)
        const next = sheets[index + 1]
        const cover = next ? Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / height)) : 0
        sheet.style.setProperty("--cover", cover.toFixed(3))
        sheet.toggleAttribute("data-under", cover > 0)
      })
    }
    const queue = () => (frame ||= requestAnimationFrame(measure))
    measure()
    window.addEventListener("scroll", queue, { passive: true })
    window.addEventListener("resize", queue)
    const resized = new ResizeObserver(queue)
    sheets.forEach((sheet) => resized.observe(sheet))

    return () => {
      seen.disconnect()
      resized.disconnect()
      window.removeEventListener("scroll", queue)
      window.removeEventListener("resize", queue)
      cancelAnimationFrame(frame)
      delete page.dataset.ready
    }
  }, [root])
}
