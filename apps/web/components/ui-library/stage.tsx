"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** A small segmented switch for a demo option, like the finale a component plays. */
export function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex w-fit shrink-0 items-center gap-0.5 rounded-lg bg-muted p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** The playable frame around one Keyframery UI component: the dotted stage, a hint, options and a reset. */
export function Stage({ children, hint, options, onReset, size = "default", className }: { children: React.ReactNode; hint?: React.ReactNode; options?: React.ReactNode; onReset?: () => void; size?: "default" | "large"; className?: string }) {
  return (
    <figure
      // Components take their accent from --kf-accent; on this site that's the cobalt the motion layer uses.
      style={{ "--kf-accent": "var(--cut)" } as React.CSSProperties}
      className={cn("not-prose m-0 flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card", className)}
    >
      <div className={cn("stage-grid flex flex-1 items-center justify-center px-4 py-10 sm:px-10 [&>*]:min-w-0", size === "large" ? "min-h-[380px]" : "min-h-[300px]")}>{children}</div>
      {(hint || onReset) && (
        <figcaption className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-t px-4 py-2 text-sm text-muted-foreground">
          <span className="min-w-0 flex-1 text-pretty">{hint}</span>
          {options}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Reset
            </button>
          )}
        </figcaption>
      )}
    </figure>
  )
}
