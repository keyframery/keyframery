"use client"

/* The second half of the page: table talk, pricing with the questions, and the last call with the footer. */

import * as React from "react"

import { Button } from "@/components/primitives/button"
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

import { faqs, person, plans, quotes, stats } from "./data"
import { Face, Magnetic, Money, Roll, useSeen } from "./parts"

const i = (index: number) => ({ "--i": index }) as React.CSSProperties

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  )
}

/* ---------------------------------------------------------------- table talk */

function Stat({ from, to, unit, label, index }: (typeof stats)[number] & { index: number }) {
  const [ref, seen] = useSeen<HTMLDivElement>(0.6)
  return (
    <div ref={ref} className="rnd-stat" data-reveal style={i(index)}>
      <span className="rnd-stat-figure">
        <Roll value={seen ? to : from} />
        {unit && <small>{unit}</small>}
      </span>
      {label}
    </div>
  )
}

export function Talk() {
  return (
    <section className="rnd-sheet" data-tone="pink">
      <div className="rnd-sheet-in">
        <div className="rnd-wrap rnd-talk">
          <div className="rnd-stats">
            {stats.map((stat, index) => (
              <Stat key={stat.label} {...stat} index={index} />
            ))}
          </div>
          <div className="rnd-quotes">
            {quotes.map((quote) => (
              <figure key={quote.name} className="rnd-quote" data-reveal>
                <blockquote className="rnd-quote-text">{quote.text}</blockquote>
                <figcaption className="rnd-quote-by">
                  <Face who={person(quote.by)} />
                  <span>
                    <b>{quote.name}</b>
                    {quote.role}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- pricing and questions */

export function Pricing() {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("yearly")
  return (
    <section className="rnd-sheet" data-tone="paper">
      <div className="rnd-sheet-in">
        <div className="rnd-wrap">
          <div className="rnd-pricing">
            <div className="rnd-pricing-head">
              <h2 className="rnd-h2" data-reveal="lines">
                <span className="rnd-line">
                  <span>Free for the table.</span>
                </span>
                <span className="rnd-line rnd-soft" style={i(1)}>
                  <span>A little for the organiser.</span>
                </span>
              </h2>
              <SegmentedControl className="rnd-billing" aria-label="Billing" value={billing} onValueChange={(next) => next && setBilling(next as typeof billing)} data-reveal>
                <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
                <SegmentedControlItem value="yearly">Yearly, a quarter off</SegmentedControlItem>
              </SegmentedControl>
            </div>

            <div className="rnd-plans">
              {plans.map((plan, index) => {
                const paid = plan.monthly > 0
                return (
                  <div key={plan.id} className="rnd-plan" data-tone={paid ? "ink" : "paper"} data-reveal style={i(index)}>
                    <p className="rnd-plan-name">
                      <b>{plan.name}</b>
                      {plan.line}
                    </p>
                    <div>
                      <p className="rnd-plan-price">
                        <Money usd={billing === "yearly" ? plan.yearly / 12 : plan.monthly} whole />
                        <small>{paid ? "a month" : "always"}</small>
                      </p>
                      <p className="rnd-plan-note">
                        {paid && billing === "yearly" && (
                          <>
                            <Money usd={plan.yearly} whole /> once a year
                          </>
                        )}
                        {paid && billing === "monthly" && "Cancel whenever the trip is over"}
                        {!paid && "No card, no trial, no catch"}
                      </p>
                    </div>
                    <ul className="rnd-plan-list">
                      {plan.features.map((feature) => (
                        <li key={feature}>
                          <Check />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Magnetic>
                      <Button className="rnd-btn" data-kind={paid ? "hot" : undefined} render={<a href="#get" />}>
                        {plan.cta}
                        <Arrow />
                      </Button>
                    </Magnetic>
                  </div>
                )
              })}
            </div>
          </div>

          <span id="faq" className="rnd-anchor" />
          <div className="rnd-faq">
            <h2 className="rnd-claim-title" data-reveal="lines">
              <span className="rnd-line">
                <span>Fair questions.</span>
              </span>
              <span className="rnd-line rnd-soft" style={i(1)}>
                <span>Straight answers.</span>
              </span>
            </h2>
            <Accordion defaultValue={[faqs[0].q]} data-reveal>
              {faqs.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionHeader>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                  </AccordionHeader>
                  <AccordionPanel>{faq.a}</AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- last call and footer */

const footer = [
  { title: "Product", links: ["How it splits", "Round Plus", "Pay links", "What changed"] },
  { title: "Company", links: ["About", "Careers", "Press"] },
  { title: "Help", links: ["Questions", "Contact", "Privacy", "Terms"] },
]

export function Last() {
  return (
    <section className="rnd-sheet" data-tone="hot">
      <div className="rnd-sheet-in">
        <div className="rnd-wrap">
          <div className="rnd-last">
            <h2 className="rnd-display" data-reveal="lines">
              <span className="rnd-line">
                <span>Next round is</span>
              </span>
              <span className="rnd-line rnd-soft" style={i(1)}>
                <span>on everyone.</span>
              </span>
            </h2>
            <p className="rnd-lede" data-reveal>
              Put Round on one phone at the table. It takes it from there.
            </p>
            <div className="rnd-hero-actions" data-reveal>
              <Magnetic>
                <Button className="rnd-btn" render={<a href="#top" />}>
                  Get the app
                  <Arrow />
                </Button>
              </Magnetic>
              <Button className="rnd-btn" data-kind="line" render={<a href="#top" />}>
                Send it to your table
              </Button>
            </div>
          </div>

          <footer>
            <div className="rnd-foot">
              <div className="rnd-foot-brand">
                <span className="rnd-wordmark">round</span>
                Bills split the way the table ate.
              </div>
              {footer.map((column) => (
                <nav key={column.title} aria-label={column.title}>
                  <h3>{column.title}</h3>
                  <ul>
                    {column.links.map((link) => (
                      <li key={link}>
                        <a href="#top">{link}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
            <div className="rnd-legal">
              <span>© 2026 Round. A made-up company on a real template.</span>
              <span>
                Template by <a href="https://keyframery.com">Keyframery</a>
              </span>
            </div>
          </footer>
        </div>
      </div>
    </section>
  )
}

export { Arrow }
