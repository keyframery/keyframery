"use client"

/* Chapter two. A statement that inks in as it is scrolled through, then a bill where tapping a face
   moves an item on or off that person. Four bills to try it on. */

import { AnimatePresence, motion, useSpring } from "motion/react"
import * as React from "react"

import { Toggle } from "@/components/primitives/toggle"

import { bills, person, type PersonId } from "./data"
import { Face, Money, useScrollProgress } from "./parts"

/* The statement, in pieces. A string is plain words; a person is a chip with their face. */
const statement: (string | PersonId)[] = [
  "maya",
  "had the branzino.",
  "jo",
  "and",
  "sam",
  "had the negronis. You had one fork of tiramisu. Splitting it four ways is quick. It is also how tables fall out.",
]

function Statement() {
  const ref = React.useRef<HTMLParagraphElement>(null)
  // From the moment the first line clears the bottom of the screen until the last one reaches the middle.
  const scrolled = useScrollProgress(() => {
    const box = ref.current?.getBoundingClientRect()
    if (!box) return 1
    return (window.innerHeight * 0.92 - box.top) / (box.height + window.innerHeight * 0.4)
  })
  const progress = useSpring(scrolled, { stiffness: 140, damping: 26, mass: 0.4 })

  const pieces = statement.flatMap((piece) => (piece in peopleById ? [piece as PersonId] : (piece as string).split(" ")))
  return (
    <motion.p ref={ref} className="rnd-say" style={{ "--p": progress } as unknown as React.CSSProperties}>
      {pieces.map((piece, index) => {
        const at = { "--w": ((index / pieces.length) * 0.88).toFixed(3) } as React.CSSProperties
        const who = peopleById[piece]
        return (
          <React.Fragment key={index}>
            {who ? (
              <span data-w style={at}>
                <span className="rnd-say-chip" style={{ "--chip": who.chip, "--chip-ink": who.chipInk } as React.CSSProperties}>
                  <Face who={who} />
                  {who.name}
                </span>
              </span>
            ) : (
              <span data-w style={at}>
                {piece}
              </span>
            )}{" "}
          </React.Fragment>
        )
      })}
    </motion.p>
  )
}

const peopleById: Record<string, ReturnType<typeof person>> = Object.fromEntries((["maya", "jo", "sam"] as PersonId[]).map((id) => [id, person(id)]))

export function Claim() {
  const [billId, setBillId] = React.useState(bills[0].id)
  /* Who shares each item, per bill, so a bill keeps its changes while you look at another. */
  const [claims, setClaims] = React.useState(() => Object.fromEntries(bills.map((bill) => [bill.id, bill.items.map((item) => item.who)])))
  const bill = bills.find((candidate) => candidate.id === billId)!
  const shared = claims[bill.id]
  const total = bill.items.reduce((sum, item) => sum + item.price, 0)
  const owes = bill.table.map((id) => ({
    who: person(id),
    amount: bill.items.reduce((sum, item, index) => (shared[index].includes(id) ? sum + item.price / shared[index].length : sum), 0),
  }))

  const tap = (index: number, id: PersonId) =>
    setClaims((now) => {
      const sharers = now[bill.id][index]
      // Somebody has to pay for it.
      const next = sharers.includes(id) ? (sharers.length > 1 ? sharers.filter((other) => other !== id) : sharers) : bill.table.filter((other) => other === id || sharers.includes(other))
      return { ...now, [bill.id]: now[bill.id].map((entry, at) => (at === index ? next : entry)) }
    })

  return (
    <section className="rnd-sheet" data-tone="paper">
      <div className="rnd-sheet-in">
        <div className="rnd-wrap">
          <div className="rnd-claim-top">
            <p className="rnd-kicker" data-reveal>
              <b>02</b> Claim
            </p>
            <Statement />
          </div>

          <div className="rnd-claim">
            <div className="rnd-claim-side">
              <h2 className="rnd-claim-title" data-reveal="lines">
                <span className="rnd-line">
                  <span>Tap who had what.</span>
                </span>
                <span className="rnd-line rnd-soft" style={{ "--i": 1 } as React.CSSProperties}>
                  <span>The maths follows.</span>
                </span>
              </h2>
              <div className="rnd-tabs" role="group" aria-label="Pick a bill" data-reveal>
                {bills.map((candidate) => (
                  <Toggle key={candidate.id} className="rnd-tab" pressed={candidate.id === bill.id} onPressedChange={() => setBillId(candidate.id)}>
                    <img src={candidate.thumb} alt="" loading="lazy" decoding="async" />
                    <span className="rnd-tab-name">{candidate.tab}</span>
                    <Money usd={candidate.items.reduce((sum, item) => sum + item.price, 0)} whole className="rnd-tab-total" />
                  </Toggle>
                ))}
              </div>
              <p className="rnd-claim-tip" data-reveal>
                Tap a face on any line to add or drop that person. Everyone&apos;s share updates as you go.
              </p>
            </div>

            <div data-reveal>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={bill.id}
                  className="rnd-bill"
                  initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -28, filter: "blur(6px)", transition: { duration: 0.16, ease: "easeIn" } }}
                  transition={{ type: "spring", duration: 0.62, bounce: 0.18 }}
                >
                  <div className="rnd-bill-head">
                    <div>
                      <div className="rnd-bill-title">{bill.title}</div>
                      <div className="rnd-bill-when">{bill.when}</div>
                    </div>
                    <Money usd={total} className="rnd-bill-total" />
                  </div>
                  {bill.items.map((item, index) => (
                    <div key={item.name} className="rnd-item" style={{ "--i": index } as React.CSSProperties}>
                      <span className="rnd-item-name">{item.name}</span>
                      <span className="rnd-item-who" role="group" aria-label={`Who shared ${item.name}`}>
                        {bill.table.map((id) => {
                          const who = person(id)
                          return (
                            <Toggle
                              key={id}
                              className="rnd-chip"
                              style={{ "--who": who.chip } as React.CSSProperties}
                              pressed={shared[index].includes(id)}
                              aria-label={who.name}
                              title={who.name}
                              onPressedChange={() => tap(index, id)}
                            >
                              <Face who={who} />
                            </Toggle>
                          )
                        })}
                      </span>
                      <Money usd={item.price} className="rnd-item-price" />
                    </div>
                  ))}
                  <div className="rnd-bill-foot">
                    <div className="rnd-bar" aria-hidden>
                      {owes.map(({ who, amount }) => (
                        <span key={who.id} style={{ flexGrow: amount, "--who": who.chip } as React.CSSProperties} />
                      ))}
                    </div>
                    <div className="rnd-owes">
                      {owes.map(({ who, amount }) => (
                        <div key={who.id} className="rnd-owe">
                          <Face who={who} />
                          <span>{who.id === "you" ? "You pay" : `${who.name} pays`}</span>
                          <b>
                            <Money usd={amount} />
                          </b>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
