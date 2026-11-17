"use client"

/* Chapter three: one pinned screen. The scroll drives a screen-wide odometer from nothing to everything
   your table owes you, and each debt is ticked off as the figure passes it. */

import { useMotionValueEvent, useSpring } from "motion/react"
import * as React from "react"

import { currencies, debts, person } from "./data"
import { Face, formatMoney, Money, useCurrency, useScrollProgress } from "./parts"

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
const owed = debts.reduce((sum, debt) => sum + debt.amount, 0)
/** How far through the pinned scroll the count reaches the full amount. */
const HOLD = 0.9

export function Settle() {
  const currency = useCurrency()
  const sheet = React.useRef<HTMLElement>(null)
  const anchor = React.useRef<HTMLSpanElement>(null)

  /* The sheet sticks at the end of its scroll, so its own box stops moving. The anchor in front of it never sticks. */
  const scrolled = useScrollProgress(() => {
    const top = anchor.current?.getBoundingClientRect().top
    const height = sheet.current?.offsetHeight
    if (top === undefined || !height) return 0
    return -top / (height - window.innerHeight)
  })
  const progress = useSpring(scrolled, { stiffness: 110, damping: 24, mass: 0.45 })

  /* The final figure as its characters, each digit knowing its place: 0 is the smallest unit shown. */
  const { rate, digits } = currencies[currency]
  const final = Math.round(owed * rate * 10 ** digits)
  let place = String(final).length
  const chars = [...formatMoney(owed, currency)].map((char) => (/\d/.test(char) ? { char, place: --place } : { char, place: place - 1 }))

  const paint = React.useCallback(
    (at: number) => {
      const root = sheet.current
      if (!root) return
      // The count finishes a little before the pin lets go, so the last figure holds on screen.
      const done = at >= HOLD
      const amount = final * Math.min(1, Math.max(0, at / HOLD))
      for (const column of root.querySelectorAll<HTMLElement>("[data-place]")) {
        const power = 10 ** Number(column.dataset.place)
        // Leading zeros stay folded away until the figure grows into them; the whole units always show.
        column.toggleAttribute("data-ghost", amount < power && Number(column.dataset.place) > digits)
        if (!column.hasAttribute("data-digit")) continue
        const turns = amount / power
        const whole = Math.floor(turns)
        // The smallest digit spins freely. Each one above it only turns as the digit below passes nine.
        const turn = power === 1 ? turns % 10 : (whole % 10) + Math.max(0, (turns - whole - 0.9) / 0.1)
        column.style.setProperty("--d", turn.toFixed(3))
      }
      let paid = 0
      root.querySelectorAll<HTMLElement>("[data-debt]").forEach((row, index) => {
        paid += Math.round(debts[index].amount * rate * 10 ** digits)
        row.toggleAttribute("data-paid", done || amount >= paid)
      })
      root.toggleAttribute("data-done", done)
    },
    [final, rate, digits],
  )
  useMotionValueEvent(progress, "change", paint)
  React.useEffect(() => paint(progress.get()), [paint, progress])

  return (
    <>
      <span ref={anchor} id="settle" className="rnd-anchor" />
      <section ref={sheet} className="rnd-sheet rnd-settle" data-tone="ink">
        <div className="rnd-sheet-in">
          <div className="rnd-wrap rnd-pin">
            <div className="rnd-settle-head">
              <p className="rnd-kicker">
                <b>03</b> Settle
              </p>
              <h2 className="rnd-settle-title">
                <span>Keep scrolling. That is the whole flow.</span>
                <span aria-hidden>All square. Nobody had to ask.</span>
              </h2>
            </div>

            <div className="rnd-meter">
              <div className="rnd-odo">
                <span className="rnd-sr">{formatMoney(owed, currency)} settled</span>
                {chars.map(({ char, place: at }, index) =>
                  /\d/.test(char) ? (
                    <span key={`${currency}${index}`} aria-hidden className="rnd-odo-digit" data-place={at} data-digit="">
                      <span>
                        {[...DIGITS, "0"].map((digit, row) => (
                          <span key={row}>{digit}</span>
                        ))}
                      </span>
                    </span>
                  ) : (
                    // A comma belongs to the digit on its left and hides with it. The symbol and the point always show.
                    <span key={`${currency}${index}`} aria-hidden className="rnd-odo-digit" data-place={char === "," ? at + 1 : undefined}>
                      {char}
                    </span>
                  ),
                )}
              </div>
              <p className="rnd-meter-note">back in your account, out of the {formatMoney(owed, currency)} you covered</p>
            </div>

            <div className="rnd-debts">
              {debts.map((debt) => {
                const who = person(debt.from)
                return (
                  <div key={debt.from} className="rnd-debt" data-debt="">
                    <Face who={who} />
                    <div className="rnd-debt-text">
                      <b>
                        {who.name} · <Money usd={debt.amount} />
                      </b>
                      <span className="rnd-debt-note">{debt.note}</span>
                    </div>
                    <span className="rnd-debt-state" aria-hidden>
                      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3.5 8.5 3 3 6-7" />
                      </svg>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
