"use client"

/**
 * CombinationOtp: a one-time code field whose digits roll into place on small drums, like a combination lock.
 * Light slots with hairline edges that catch a little light: under your pointer, and on the slot you type into
 * next, where the light slides along as you type. When the code checks out, the digits roll away and the slots
 * slide together into a small "Verified" chip; a wrong code jams the drums and clears.
 * Built on input-otp, so paste, autofill and mobile keyboards behave like any code field.
 */

import * as React from "react"
import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from "input-otp"
import { MotionConfig, animate, motion, useMotionValue, useReducedMotion, useTransform, useVelocity, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"

const STEP = 36 // degrees between neighbouring digits on a drum
const FACE = 1.4 // one digit's face on the drum, in em
const RADIUS = FACE / 2 / Math.tan(((STEP / 2) * Math.PI) / 180) // the drum's radius, in em
const DIGITS = Array.from({ length: 10 }, (_, d) => d)
const SIZES = { sm: "text-[16px]", md: "text-[20px]", lg: "text-[24px]" }
const LIGHT = "var(--kf-accent, #3b82f6)" // the light the slot edges catch
const PITCH = 2.35 // one slot plus its gap, in em (w-[2em] and gap-[0.35em] below)
const SUCCESS = "var(--kf-success, #16a34a)"
const EASE = [0.2, 0.7, 0.2, 1] as const
const roll = { type: "spring", duration: 0.38, bounce: 0.16 } as const
const SPIN = 420 // ms until a rolling drum has settled

type Status = "idle" | "checking" | "verified" | "rejected" | "retry"

export type CombinationOtpProps = {
  /** How many digits the code has. */
  length?: number
  /** Checks the code. Return true (or resolve to true) when it's right. */
  verify: (code: string) => boolean | Promise<boolean>
  /** Called once Verified is showing. */
  onVerified?: (code: string) => void
  /** How big it is. */
  size?: keyof typeof SIZES
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  "aria-label"?: string
  /** Your own wording. "verified" is shown inside the field, so keep it short. */
  messages?: Partial<Record<"checking" | "verified" | "rejected", string>>
}

const MESSAGES = { checking: "Checking the code", verified: "Verified", rejected: "That code doesn't match. Try again." }

export function CombinationOtp({ length = 6, verify, onVerified, size = "md", disabled, autoFocus, className, messages, "aria-label": ariaLabel = "One-time code" }: CombinationOtpProps) {
  const [value, setValue] = React.useState("")
  const [status, setStatus] = React.useState<Status>("idle")
  // How the last change arrived: one key, several digits at once (paste, autofill), or the reset after a wrong code.
  const [arrival, setArrival] = React.useState<"key" | "burst" | "reset">("key")
  const [closed, setClosed] = React.useState(false) // the slots have slid together into one
  const [chip, setChip] = React.useState<number | null>(null) // the Verified chip's width, once measured
  const chipRef = React.useRef<HTMLSpanElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const landed = React.useRef(0) // when the last drum set rolling will have settled
  const reduce = useReducedMotion() ?? false
  const shake = useMotionValue(0)
  // The light on the slot you type into next: where it is, counted in slots, and how bright it is.
  const fx = useMotionValue(-1)
  const fo = useMotionValue(0)
  // Where the pointer is on screen, for the light on the slot edges; infinity while it's away.
  const px = useMotionValue(Number.POSITIVE_INFINITY)
  const py = useMotionValue(Number.POSITIVE_INFINITY)
  const text = { ...MESSAGES, ...messages }

  // The chip's width is only known once its label is on the page.
  React.useEffect(() => {
    if (closed && chipRef.current) setChip(chipRef.current.offsetWidth)
  }, [closed])

  async function check(code: string) {
    setStatus("checking")
    let ok = false
    try {
      ok = await verify(code)
    } catch {
      ok = false
    }
    // Let every drum settle before answering.
    if (!reduce) await wait(landed.current - performance.now())
    if (ok) {
      setStatus("verified")
      // The digits roll away first; then the slots slide together and narrow into the Verified chip.
      window.setTimeout(() => setClosed(true), reduce ? 0 : 260 + length * 35)
      onVerified?.(code)
      return
    }
    setStatus("rejected")
    if (!reduce) await animate(shake, [0, -6, 5, -3, 2, 0], { duration: 0.42, ease: "easeOut", delay: 0.08 })
    await wait(reduce ? 500 : 260)
    setArrival("reset")
    setValue("")
    setStatus("retry")
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const verified = status === "verified"
  const rejected = status === "rejected" || status === "retry"

  return (
    <MotionConfig reducedMotion="user">
      <div data-cut="none" data-status={status} className={cn("flex w-full flex-col items-center gap-3", SIZES[size], className)}>
        <OTPInput
          ref={inputRef}
          value={value}
          onChange={(next) => {
            const burst = Math.abs(next.length - value.length) > 1
            landed.current = performance.now() + SPIN + (burst ? (length - 1) * 50 : 0)
            setArrival(burst ? "burst" : "key")
            setValue(next)
            if (status === "retry") setStatus("idle")
          }}
          onPointerMove={(event) => {
            px.set(event.clientX)
            py.set(event.clientY)
          }}
          onPointerLeave={() => {
            px.set(Number.POSITIVE_INFINITY)
            py.set(Number.POSITIVE_INFINITY)
          }}
          maxLength={length}
          pattern={REGEXP_ONLY_DIGITS}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus={autoFocus}
          disabled={disabled || (status !== "idle" && status !== "retry")}
          onComplete={check}
          aria-label={ariaLabel}
          containerClassName="relative cursor-text has-[:disabled]:cursor-default"
          render={({ slots, isFocused }) => (
            <>
              <FollowSelection index={isFocused && (status === "idle" || status === "retry") ? slots.findIndex((slot) => slot.isActive) : -1} fx={fx} fo={fo} reduce={reduce} />
              <motion.div
                aria-hidden="true"
                style={{ x: shake }}
                animate={chip === null ? undefined : { width: chip }}
                transition={{ width: reduce ? { duration: 0 } : { type: "spring", duration: 0.6, bounce: 0.14, delay: 0.16 } }}
                className={cn(
                  "relative flex items-center gap-[0.35em] rounded-[0.5em] transition-[background-color,box-shadow] duration-200",
                  // Fused: one field with one hairline edge, the slots fading out inside it.
                  closed && "bg-card shadow-[0_2px_3px_-1px_rgb(0_0_0/0.1)] ring-1 ring-black/8 dark:shadow-[0_1px_2px_rgb(0_0_0/0.5)] dark:ring-white/10",
                )}
              >
                {slots.map((slot, i) => (
                  <DrumSlot
                    key={i}
                    slot={slot}
                    index={i}
                    focused={isFocused}
                    status={status}
                    closed={closed}
                    delay={arrival === "burst" ? i * 0.05 : arrival === "reset" ? (length - 1 - i) * 0.04 : 0}
                    px={px}
                    py={py}
                    fx={fx}
                    fo={fo}
                    reduce={reduce}
                  />
                ))}
                {closed && (
                  <span ref={chipRef} className="pointer-events-none absolute top-1/2 left-1/2 flex w-max -translate-x-1/2 -translate-y-1/2 items-center gap-[0.35em] px-[1em] text-[0.75em] font-medium tracking-[-0.01em] whitespace-nowrap text-foreground">
                    <motion.svg
                      viewBox="0 0 24 24"
                      className="size-[1.1em]"
                      fill="none"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ stroke: SUCCESS }}
                      aria-hidden="true"
                      initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", duration: 0.45, bounce: 0.35, delay: reduce ? 0 : 0.22 }}
                    >
                      <motion.path d="M5 12.5 10 17.5 19 7" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.38, delay: reduce ? 0 : 0.3, ease: [0.3, 0, 0.1, 1] }} />
                    </motion.svg>
                    <motion.span initial={reduce ? false : { opacity: 0, filter: "blur(4px)", x: -4 }} animate={{ opacity: 1, filter: "blur(0px)", x: 0 }} transition={{ duration: 0.4, delay: reduce ? 0 : 0.3, ease: EASE }}>
                      {text.verified}
                    </motion.span>
                  </span>
                )}
                {/* One soft ring of the success colour goes out from the chip's edge, once. */}
                {closed && !reduce && (
                  <motion.span
                    className="pointer-events-none absolute inset-0 rounded-[inherit] outline-2 outline-solid"
                    style={{ outlineColor: SUCCESS }}
                    initial={{ outlineOffset: 0, opacity: 0 }}
                    animate={{ outlineOffset: [0, 0, 8], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 0.8, times: [0, 0.04, 1], delay: 0.75, ease: EASE }}
                  />
                )}
              </motion.div>
            </>
          )}
        />
        <p role="status" className={cn("flex min-h-5 items-center gap-1.5 text-sm", rejected ? "text-destructive" : "text-muted-foreground")}>
          {status === "checking" && !reduce && (
            <motion.svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
              <path d="M8 2.5a5.5 5.5 0 1 0 5.5 5.5" />
            </motion.svg>
          )}
          {status === "checking" ? text.checking : verified ? <span className="sr-only">{text.verified}</span> : rejected ? text.rejected : ""}
        </p>
      </div>
    </MotionConfig>
  )
}

type DrumSlotProps = { slot: SlotProps; index: number; focused: boolean; status: Status; closed: boolean; delay: number; px: MotionValue<number>; py: MotionValue<number>; fx: MotionValue<number>; fo: MotionValue<number>; reduce: boolean }

/** One digit: a light slot with a drum behind it. */
function DrumSlot({ slot, index, focused, status, closed, delay, px, py, fx, fo, reduce }: DrumSlotProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const digit = slot.char === null ? null : Number(slot.char)
  const pos = useMotionValue(digit ?? 0)
  const shown = useMotionValue(digit === null ? 0 : 1)
  const turn = useTransform(pos, (p) => p * STEP)
  const speed = useVelocity(pos)
  const blur = useTransform(speed, (v) => `blur(${Math.min(Math.abs(v) / 32, 1.4).toFixed(2)}px)`)
  const nudge = useMotionValue(0) // the digit, a pixel or so up or down
  const lift = useMotionValue(0) // the whole slot
  const previous = React.useRef(digit)
  // Two lights on the edge. The selection light sits just inside the left edge of the slot you type into next,
  // so about half the rim glows; it only reaches this slot while it's within one slot of here, so a neighbour
  // never looks selected, and it crosses the gap as it moves. The pointer light is a soft circle under the pointer.
  const light = useTransform(() => {
    const x = px.get()
    const y = py.get()
    const at = fx.get()
    const on = fo.get() * Math.max(0, 1 - Math.abs(at - index))
    const layers: string[] = []
    if (on > 0.01) layers.push(`radial-gradient(2.4em circle at ${((at - index) * PITCH + 0.35).toFixed(3)}em 50%, color-mix(in oklab, ${LIGHT} ${Math.round(on * 100)}%, transparent), transparent 75%)`)
    const el = ref.current
    if (el && Number.isFinite(x)) {
      const r = el.getBoundingClientRect()
      layers.push(`radial-gradient(64px circle at ${x - r.left}px ${y - r.top}px, ${LIGHT}, transparent 75%)`)
    }
    return layers.length ? layers.join(", ") : "transparent"
  })

  // A new digit rolls up into the slot from a few places back and settles with a small detent.
  React.useEffect(() => {
    const from = previous.current
    previous.current = digit
    if (from === digit) return
    if (reduce) {
      if (digit !== null) pos.jump(digit)
      shown.jump(digit === null ? 0 : 1)
      return
    }
    if (digit === null) {
      const away = animate(pos, pos.get() + 2, { duration: 0.26, ease: [0.5, 0, 1, 1], delay })
      const fade = animate(shown, 0, { duration: 0.18, delay: delay + 0.06 })
      return () => {
        away.stop()
        fade.stop()
      }
    }
    const start = from === null ? digit - 3 : wrap(pos.get())
    pos.jump(start)
    const fade = animate(shown, 1, { duration: 0.14, delay })
    const spin = animate(pos, from === null ? digit : start + (wrap(digit - start) || 10), { ...roll, delay })
    spin.then(() => {
      pos.jump(digit)
      animate(nudge, [0, 0.8, 0], { duration: 0.18, ease: "easeOut" })
    })
    return () => {
      spin.stop()
      fade.stop()
    }
  }, [digit, reduce, delay, pos, shown, nudge])

  // Checking: the drums are read one after another. Right: the digits roll away. Wrong: the drums jam.
  React.useEffect(() => {
    if (reduce || digit === null) return
    if (status === "checking") {
      const read = animate(nudge, [0, -1.2, 0], { duration: 0.32, delay: index * 0.06, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" })
      return () => {
        read.stop()
        nudge.set(0)
      }
    }
    if (status === "verified") {
      const away = animate(pos, pos.get() + 2, { duration: 0.3, ease: [0.5, 0, 1, 1], delay: index * 0.035 })
      const fade = animate(shown, 0, { duration: 0.2, delay: index * 0.035 + 0.08 })
      return () => {
        away.stop()
        fade.stop()
      }
    }
    if (status === "rejected") {
      const p = pos.get()
      const jam = animate(pos, [p, p + 0.25, p - 0.18, p + 0.08, p], { duration: 0.42, delay: index * 0.03, ease: "easeInOut" })
      return () => jam.stop()
    }
  }, [status, reduce, digit, index, pos, shown, nudge])

  // Focusing the field wakes the slots in a small wave.
  React.useEffect(() => {
    if (!focused || reduce) return
    const wake = animate(lift, [0, -2, 0], { duration: 0.42, delay: index * 0.035, ease: "easeInOut" })
    return () => wake.stop()
  }, [focused, reduce, index, lift])

  const rejected = status === "rejected"

  return (
    <motion.div
      ref={ref}
      style={{ y: lift }}
      className={cn(
        "relative h-[2.4em] w-[2em] min-w-0 rounded-[0.5em] bg-card transition-[box-shadow,opacity] duration-200",
        closed
          ? "opacity-0"
          : rejected
            ? "shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-destructive)_10%,transparent)] ring-1 ring-destructive/55"
            : "shadow-[0_2px_3px_-1px_rgb(0_0_0/0.1),0_1px_0_0_rgb(25_28_33/0.02)] ring-1 ring-black/8 dark:shadow-[0_1px_2px_rgb(0_0_0/0.5)] dark:ring-white/10",
      )}
    >
      {/* The lights on the slot's edge: a 1.5px rim. */}
      {!closed && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] p-[1.5px] [mask-clip:content-box,border-box] [mask-composite:exclude] [mask-image:linear-gradient(#000_0_0),linear-gradient(#000_0_0)]"
          style={{ background: light }}
        />
      )}
      <div aria-hidden="true" className={cn("absolute inset-0 overflow-hidden rounded-[inherit] transition-opacity duration-300", status === "checking" && "opacity-45")}>
        <motion.div className="absolute inset-0 [perspective:7em] [mask-image:linear-gradient(to_bottom,transparent_12%,#000_34%,#000_66%,transparent_88%)]" style={{ opacity: shown, filter: blur, y: nudge }}>
          <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ z: `${-RADIUS}em`, rotateX: turn }}>
            {DIGITS.map((d) => (
              <div
                key={d}
                className="absolute inset-x-0 top-1/2 -mt-[0.7em] flex h-[1.4em] items-center justify-center leading-none font-medium tracking-tight text-foreground tabular-nums [backface-visibility:hidden]"
                style={{ transform: `rotateX(${-d * STEP}deg) translateZ(${RADIUS}em)` }}
              >
                {d}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

/** Moves the selection light to the slot you type into next. It slides in from the left when the field gains focus. */
function FollowSelection({ index, fx, fo, reduce }: { index: number; fx: MotionValue<number>; fo: MotionValue<number>; reduce: boolean }) {
  React.useEffect(() => {
    if (index < 0) {
      const out = animate(fo, 0, { duration: reduce ? 0 : 0.3 })
      return () => out.stop()
    }
    if (reduce) {
      fx.jump(index)
      fo.jump(1)
      return
    }
    if (fo.get() < 0.05) fx.jump(index - 0.7)
    const on = animate(fo, 1, { duration: 0.3 })
    const go = animate(fx, index, { type: "spring", duration: 0.5, bounce: 0.1 })
    return () => {
      on.stop()
      go.stop()
    }
  }, [index, reduce, fx, fo])
  return null
}

/** Brings a drum position back into one turn, 0 to 10. */
const wrap = (n: number) => ((n % 10) + 10) % 10

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))
