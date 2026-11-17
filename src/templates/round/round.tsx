"use client"

/* Round: a landing page for a made-up bill-splitting app, built to be operated.
   - The page loads by splitting a bill: a white ring draws, flies into the hero and becomes four slices.
   - The hero ring is live: drag a line, tap a face, change the tip.
   - The scroll stacks full-colour sheets, inks in a statement and drives a screen-wide odometer.
   - One switch in the bar re-prices every figure on the page.
   Controls come from Keyframery's UI SDK components; springs and scroll-linked motion come from Motion.
   Copy, people, bills and prices live in data.ts; colours are the six --rnd-* values in round.css. */

import { animate, MotionConfig } from "motion/react"
import * as React from "react"
import { flushSync } from "react-dom"

import { Button } from "@/components/primitives/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

import { Claim } from "./claim"
import { currencies, nav, type CurrencyId } from "./data"
import { CurrencyProvider, Magnetic, motionSpeed, prefersReducedMotion, usePage } from "./parts"
import { Arrow, Last, Pricing, Talk } from "./rest"
import { SplitRing } from "./ring"
import { Settle } from "./settle"

import "./round.css"

const i = (index: number) => ({ "--i": index }) as React.CSSProperties

/** load: the white ring in the middle of the screen. place: it flies to the hero. done: the page is open. */
type Intro = "load" | "place" | "done"

export function RoundLanding() {
  const page = React.useRef<HTMLDivElement>(null)
  const [currency, setCurrency] = React.useState<CurrencyId>("usd")
  const [intro, setIntro] = React.useState<Intro>("load")
  const [settled, setSettled] = React.useState(false)
  usePage(page)

  React.useEffect(() => {
    const root = page.current
    // No loading sequence with reduced motion, or when the page reopens part-way down.
    if (!root || prefersReducedMotion() || window.scrollY > 40) {
      setIntro("done")
      setSettled(true)
      return
    }
    const pace = motionSpeed(root)
    const html = document.documentElement
    html.style.overflow = "hidden"
    const timers = [
      window.setTimeout(() => {
        const ring = root.querySelector<HTMLElement>(".rnd-ring")
        const from = ring?.getBoundingClientRect()
        // The ring goes back to its place in the hero in one step, then is animated from where it was.
        flushSync(() => setIntro("place"))
        const to = ring?.getBoundingClientRect()
        if (ring && from && to) {
          animate(
            ring,
            {
              x: [from.left + from.width / 2 - (to.left + to.width / 2), 0],
              y: [from.top + from.height / 2 - (to.top + to.height / 2), 0],
              scale: [from.width / to.width, 1],
            },
            { type: "spring", duration: 1.2 * pace, bounce: 0.24 },
          )
        }
        html.style.overflow = ""
      }, 1750 * pace),
      window.setTimeout(() => setIntro("done"), 1950 * pace),
      // The staggered arrivals are over: later changes should not wait their turn.
      window.setTimeout(() => setSettled(true), 4400 * pace),
    ]
    return () => {
      timers.forEach(window.clearTimeout)
      html.style.overflow = ""
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <CurrencyProvider value={currency}>
        <div ref={page} className="rnd" data-intro={intro === "done" ? undefined : intro} data-settled={settled ? "" : undefined}>
          <header className="rnd-nav">
            <a className="rnd-wordmark" href="#top" aria-label="Round, back to the top">
              round
            </a>
            <nav className="rnd-nav-links" aria-label="Sections">
              {nav.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
            <SegmentedControl className="rnd-nav-money" aria-label="Show prices in" value={currency} onValueChange={(next) => next && setCurrency(next as CurrencyId)}>
              {(Object.keys(currencies) as CurrencyId[]).map((id) => (
                <SegmentedControlItem key={id} value={id} aria-label={currencies[id].label}>
                  {currencies[id].symbol}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
            <Button className="rnd-btn" data-size="sm" render={<a href="#pricing" />}>
              Get the app
            </Button>
          </header>

          <span id="top" className="rnd-anchor" />
          <span id="split" className="rnd-anchor" />
          <section className="rnd-sheet" data-tone="blue">
            <div className="rnd-sheet-in">
              <div className="rnd-wrap rnd-hero">
                <div className="rnd-hero-copy">
                  <h1 className="rnd-display">
                    <span className="rnd-line">
                      <span>Split it.</span>
                    </span>
                    <span className="rnd-line rnd-soft" style={i(1)}>
                      <span>Stay</span>
                    </span>
                    <span className="rnd-line rnd-soft" style={i(2)}>
                      <span>friends.</span>
                    </span>
                  </h1>
                  <p className="rnd-lede" style={i(2)}>
                    Round divides any bill the way your table actually ate. Drag a slice, tap a friend, and it is settled before the plates are cleared.
                  </p>
                  <div className="rnd-hero-actions" style={i(3)}>
                    <Magnetic>
                      <Button className="rnd-btn" render={<a href="#pricing" />}>
                        Get the app
                        <Arrow />
                      </Button>
                    </Magnetic>
                    <Button className="rnd-btn" data-kind="line" render={<a href="#claim" />}>
                      See how it splits
                    </Button>
                  </div>
                </div>

                <SplitRing />

                <div className="rnd-hero-notes" style={i(5)}>
                  <p>
                    <b>Free for the whole table</b>
                    Only the organiser ever pays
                  </p>
                  <p>
                    <b>iPhone, Android and the browser</b>
                    Friends pay from a link
                  </p>
                  <p>
                    <b>4.9 from 61,000 ratings</b>
                    Mostly from people who hate maths
                  </p>
                </div>
              </div>
            </div>
          </section>

          <span id="claim" className="rnd-anchor" />
          <Claim />
          <Settle />
          <Talk />
          <span id="pricing" className="rnd-anchor" />
          <Pricing />
          <Last />
        </div>
      </CurrencyProvider>
    </MotionConfig>
  )
}

export default RoundLanding
