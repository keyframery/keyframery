"use client"

/* The hero: one bill drawn as a ring. Drag a handle to move the line between two people, tap a face to
   add or drop someone, change the tip. Every figure follows. Until someone touches it, one handle
   moves by itself now and then to show that it can. */

import * as React from "react"

import { Button } from "@/components/primitives/button"
import { Toggle } from "@/components/primitives/toggle"
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "@/components/ui/slider"

import { heroBill, people, type PersonId } from "./data"
import { Face, formatMoney, Money, motionSpeed, prefersReducedMotion, Roll, useCurrency } from "./parts"

/** The smallest slice anyone can be dragged down to. */
const MIN = 0.08
const RADIUS = 330
const CIRCLE = 2 * Math.PI * RADIUS
/** The blue line between two slices, in the ring's own units. */
const GAP = 10
const GAP_DEG = (GAP / CIRCLE) * 360
/** Where the first slice starts. 0 is three o'clock and angles run clockwise. */
const START = -150

type Split = { table: PersonId[]; shares: Record<PersonId, number>; start: number }

const initial: Split = {
  table: heroBill.table,
  shares: Object.fromEntries(people.map((p) => [p.id, heroBill.shares[p.id] ?? 0])) as Record<PersonId, number>,
  start: START,
}

const even = (split: Split): Split => ({
  ...split,
  shares: Object.fromEntries(people.map((p) => [p.id, split.table.includes(p.id) ? 1 / split.table.length : 0])) as Record<PersonId, number>,
})

/** Move the line that starts `id`'s slice by `turn` (a fraction of the ring): the person before gains what `id` gives up. */
function shift(split: Split, id: PersonId, turn: number): Split {
  const index = split.table.indexOf(id)
  const before = split.table[(index - 1 + split.table.length) % split.table.length]
  const by = Math.min(split.shares[id] - MIN, Math.max(MIN - split.shares[before], turn))
  if (!by) return split
  return {
    table: split.table,
    shares: { ...split.shares, [before]: split.shares[before] + by, [id]: split.shares[id] - by },
    start: index === 0 ? split.start + by * 360 : split.start,
  }
}

function toggle(split: Split, id: PersonId): Split {
  const shares = { ...split.shares }
  if (split.table.includes(id)) {
    if (id === "you" || split.table.length <= 2) return split
    const rest = split.table.filter((other) => other !== id)
    const kept = rest.reduce((sum, other) => sum + shares[other], 0)
    for (const other of rest) shares[other] += (shares[id] * shares[other]) / kept
    shares[id] = 0
    return { ...split, table: rest, shares }
  }
  const take = 1 / (split.table.length + 1)
  for (const other of split.table) shares[other] *= 1 - take
  shares[id] = take
  return { ...split, table: people.map((p) => p.id).filter((other) => other === id || split.table.includes(other)), shares }
}

const point = (degrees: number, reach: number) => {
  const angle = (degrees * Math.PI) / 180
  return { left: `${50 + Math.cos(angle) * reach}%`, top: `${50 + Math.sin(angle) * reach}%` }
}

export function SplitRing() {
  const [split, setSplit] = React.useState(initial)
  const [tip, setTip] = React.useState(heroBill.tip)
  const [dragging, setDragging] = React.useState<PersonId | null>(null)
  const [touched, setTouched] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const ring = React.useRef<HTMLDivElement>(null)
  const total = heroBill.subtotal * (1 + tip / 100)

  /* The bill adds up while the page loads: the total starts as zeros and rolls to its figure. */
  const [counted, setCounted] = React.useState(false)
  const totalText = formatMoney(total, useCurrency())
  React.useEffect(() => {
    const wait = window.setTimeout(() => setCounted(true), prefersReducedMotion() ? 0 : 420 * motionSpeed(ring.current))
    return () => window.clearTimeout(wait)
  }, [])

  /* Where every slice starts. People who are not at the table keep a place of zero width, so a slice
     grows out of the line it joins at and closes back into it. */
  let angle = split.start
  const slices = people.map((who) => {
    const share = split.shares[who.id]
    const slice = { who, share, from: angle, mid: angle + share * 180, on: split.table.includes(who.id) }
    angle += share * 360
    return slice
  })
  const isEven = split.table.every((id) => Math.abs(split.shares[id] - 1 / split.table.length) < 0.004)

  /* The hint: the second line on the ring (top right, clear of the controls on every screen) swings out and back. */
  const hintId = split.table[1]
  React.useEffect(() => {
    if (touched || hovered || prefersReducedMotion()) return
    const pace = motionSpeed(ring.current)
    let back = 0
    const swing = () => {
      setSplit((now) => shift(now, hintId, 0.07))
      back = window.setTimeout(() => setSplit((now) => shift(now, hintId, -0.07)), 1100 * pace)
    }
    // The first swing waits for the loading sequence to finish.
    const first = window.setTimeout(swing, 5400 * pace)
    const loop = window.setInterval(swing, 6400 * pace)
    return () => {
      window.clearTimeout(first)
      window.clearTimeout(back)
      window.clearInterval(loop)
    }
  }, [touched, hovered, hintId])

  const dragTo = (id: PersonId, event: React.PointerEvent) => {
    const box = ring.current?.getBoundingClientRect()
    if (!box) return
    const pointer = (Math.atan2(event.clientY - (box.top + box.height / 2), event.clientX - (box.left + box.width / 2)) * 180) / Math.PI
    setSplit((now) => {
      let from = now.start
      for (const other of now.table) {
        if (other === id) break
        from += now.shares[other] * 360
      }
      // The shortest way round from where the line is to where the pointer is.
      const turn = ((((pointer - from) % 360) + 540) % 360) - 180
      return shift(now, id, turn / 360)
    })
  }

  return (
    <div className="rnd-split" onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <div className="rnd-ring-slot">
      <div ref={ring} className="rnd-ring" data-dragging={dragging ? "" : undefined}>
        <svg className="rnd-ring-art" viewBox="-500 -500 1000 1000" aria-hidden>
          {slices.map(({ who, share, from }, index) => (
            <circle
              key={who.id}
              className="rnd-ring-slice"
              r={RADIUS}
              style={
                {
                  "--i": index,
                  stroke: who.tone,
                  strokeDasharray: `${Math.max(0, share * CIRCLE - GAP)} ${CIRCLE}`,
                  rotate: `${from + GAP_DEG / 2}deg`,
                } as React.CSSProperties
              }
            />
          ))}
          {/* The loading sequence: one white ring over the slices, drawn in and then peeled away. */}
          <circle className="rnd-ring-cover" r={RADIUS} pathLength={1} />
        </svg>

        <div className="rnd-ring-hub">
          <span className="rnd-ring-hub-label">{heroBill.title}</span>
          <Roll value={counted ? totalText : totalText.replace(/\d/g, "0")} className="rnd-ring-hub-total" />
          <span className="rnd-ring-hub-note">with {tip}% tip</span>
        </div>

        {slices.map(({ who, share, mid, on }, index) => (
          <div
            key={who.id}
            className="rnd-ring-label"
            data-on={on ? "" : undefined}
            data-small={share < 0.13 ? "" : undefined}
            style={{ ...point(mid, 33), color: who.ink, "--i": index } as React.CSSProperties}
          >
            {who.id !== "you" && <Face who={who} onSlice />}
            <span className="rnd-ring-label-name">{who.name}</span>
            <Money usd={share * total} className="rnd-ring-label-amount" />
          </div>
        ))}

        {split.table.map((id, index) => {
          const slice = slices.find(({ who }) => who.id === id)!
          const before = slices.find(({ who }) => who.id === split.table[(index - 1 + split.table.length) % split.table.length])!
          const percent = Math.round(before.share * 100)
          return (
            <button
              key={id}
              type="button"
              className="rnd-ring-handle"
              role="slider"
              aria-label={`Line between ${before.who.name} and ${slice.who.name}`}
              aria-valuemin={Math.round(MIN * 100)}
              aria-valuemax={Math.round((before.share + slice.share - MIN) * 100)}
              aria-valuenow={percent}
              aria-valuetext={`${before.who.name} ${percent}%, ${slice.who.name} ${Math.round(slice.share * 100)}%`}
              data-active={dragging === id ? "" : undefined}
              style={point(slice.from, 48)}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId)
                setTouched(true)
                setDragging(id)
              }}
              onPointerMove={(event) => dragging === id && dragTo(id, event)}
              onPointerUp={() => setDragging(null)}
              onPointerCancel={() => setDragging(null)}
              onKeyDown={(event) => {
                const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 0.02 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -0.02 : 0
                if (!step) return
                event.preventDefault()
                setTouched(true)
                setSplit((now) => shift(now, id, step))
              }}
            />
          )
        })}

        {!touched && hintId && (
          <span className="rnd-ring-hint" style={point(slices.find(({ who }) => who.id === hintId)!.from, 58)} aria-hidden>
            Drag me
          </span>
        )}
      </div>
      </div>

      <div className="rnd-controls" data-tone="paper">
        <div className="rnd-controls-tip">
          <span id="rnd-tip" className="rnd-controls-name">
            Tip
          </span>
          <Slider
            className="rnd-controls-slider"
            value={tip}
            min={0}
            max={30}
            step={1}
            onValueChange={(value) => {
              setTouched(true)
              setTip(Array.isArray(value) ? value[0] : (value as number))
            }}
          >
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb aria-labelledby="rnd-tip" />
              </SliderTrack>
            </SliderControl>
          </Slider>
          <span className="rnd-controls-value">{tip}%</span>
        </div>
        <div className="rnd-controls-table" role="group" aria-label="Who is at the table">
          {people.map((who) => {
            const on = split.table.includes(who.id)
            const locked = who.id === "you" || (on && split.table.length <= 2)
            return (
              <Toggle
                key={who.id}
                className="rnd-seat"
                pressed={on}
                aria-label={who.name}
                title={locked ? `${who.name} stays at the table` : on ? `Take ${who.name} off the bill` : `Add ${who.name} to the bill`}
                onPressedChange={(_, details) => {
                  // The ring owns who is at the table; you, and the last two people, stay on it.
                  if (locked) return details.cancel()
                  setTouched(true)
                  setSplit((now) => toggle(now, who.id))
                }}
              >
                <Face who={who} />
              </Toggle>
            )
          })}
        </div>
        <Button
          className="rnd-controls-even"
          disabled={isEven}
          onClick={() => {
            setTouched(true)
            setSplit(even)
          }}
        >
          Split evenly
        </Button>
      </div>
    </div>
  )
}
