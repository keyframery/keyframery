"use client"

/* Animated badge. UI SDK has no badge, so this is a plain span with shadcn's part name: swap the
   import and keep your markup. This file adds motion only. Colours, radii and spacing stay yours. */

import * as React from "react"

import { cn } from "@/lib/utils"

const keyframes =
  "@keyframes kf-badge-in{from{opacity:0;scale:.6}}" +
  "@keyframes kf-badge-ping{from{opacity:.55;scale:1}to{opacity:0;scale:3.4}}"

/* Roll: each digit is a column of 0 to 9 that slides to its value on a spring, so a count rolls up
   when it grows and down when it shrinks. Columns are keyed from the right, so a new leading digit
   rises in from below instead of every digit shifting. Exported for other numbers. */
function Roll({ text, className }: { text: string; className?: string }) {
  const chars = text.split("")
  return (
    <span
      aria-hidden
      data-slot="roll"
      className={cn(
        "inline-flex h-[1lh] overflow-hidden whitespace-pre tabular-nums [mask-image:linear-gradient(transparent,black_18%,black_82%,transparent)]",
        className,
      )}
    >
      {chars.map((c, i) => {
        const key = chars.length - i
        return /\d/.test(c) ? (
          <span
            key={key}
            style={{ "--d": Number(c) } as React.CSSProperties}
            className="flex flex-col transition-[translate] duration-[calc(520ms*var(--kf-speed,1))] ease-spring [translate:0_calc(var(--d)*-1lh)] starting:[translate:0_1lh] motion-reduce:transition-none!"
          >
            {Array.from({ length: 10 }, (_, d) => (
              <span key={d} className="h-[1lh]">
                {d}
              </span>
            ))}
          </span>
        ) : (
          <span key={key}>{c}</span>
        )
      })}
    </span>
  )
}

function textOf(node: React.ReactNode): string {
  return typeof node === "string" || typeof node === "number" ? String(node) : ""
}

function Badge({
  className,
  count,
  max,
  dot,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  /** Renders the number as rolling digits that roll up or down when it changes. */
  count?: number
  /** Above this, shows `max+`. */
  max?: number
  /** A leading status dot that pulses once whenever the badge's value (count or text) changes. */
  dot?: boolean
}) {
  const text = count === undefined ? "" : max !== undefined && count > max ? `${max}+` : String(count)

  /* Count changes of the value (React's "adjust state while rendering" pattern, no effect).
     Each change remounts the pulse, so it plays exactly once; nothing pulses on first render. */
  const value = count === undefined ? textOf(children) : text
  const [seen, setSeen] = React.useState(value)
  const [pulses, setPulses] = React.useState(0)
  if (seen !== value) {
    setSeen(value)
    setPulses((n) => n + 1)
  }

  return (
    <>
      <style href="kf-badge" precedence="default">
        {keyframes}
      </style>
      <span
        data-slot="badge"
        data-dot={dot || undefined}
        className={cn(
          "animate-[kf-badge-in_calc(380ms*var(--kf-speed,1))_var(--ease-pop)_backwards] motion-reduce:animate-none!",
          className,
        )}
        {...props}
      >
        {dot && (
          <span data-slot="badge-dot" aria-hidden className="relative inline-grid size-1.5 shrink-0">
            <span
              key={pulses}
              className={cn(
                "[grid-area:1/1] rounded-full bg-current",
                pulses > 0 && "animate-[kf-badge-in_calc(420ms*var(--kf-speed,1))_var(--ease-pop)_backwards] motion-reduce:animate-none!",
              )}
            />
            {pulses > 0 && (
              <span
                key={`ping-${pulses}`}
                className="[grid-area:1/1] rounded-full bg-current opacity-0 animate-[kf-badge-ping_calc(800ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:animate-none!"
              />
            )}
          </span>
        )}
        {count !== undefined && (
          <>
            <Roll text={text} />
            <span className="sr-only">{text}</span>
          </>
        )}
        {children}
      </span>
    </>
  )
}

export { Badge, Roll }
