"use client"

/* Animated drop-in for `@ui-sdk/react/button`: same part, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.
   - Press: the button gives under the pointer and springs back with a small pop on release.
   - Direction: while its action runs, the label rises out and a spinner rises in from below.
   - Nudge: a `ButtonArrow` inside slides forward and grows its stem on hover. */

import { Button as ButtonPart } from "@ui-sdk/react/button"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/button"

/* Old content leaves fast and flat; new content arrives on a spring. */
const swap =
  "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none!"

function Spinner() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="size-4 animate-spin [animation-duration:calc(700ms*var(--kf-speed,1))] [animation-play-state:paused] group-data-pending/kf-button:[animation-play-state:running] motion-reduce:[animation-duration:calc(1600ms*var(--kf-speed,1))]"
    >
      <circle cx="8" cy="8" r="5.75" opacity="0.28" />
      <path d="M8 2.25A5.75 5.75 0 0 1 13.75 8" />
    </svg>
  )
}

function Button({
  className,
  children,
  pendingIndicator,
  ...props
}: React.ComponentProps<typeof ButtonPart> & {
  /** What rises in while the button is pending. Defaults to a spinner; pass `null` for none. */
  pendingIndicator?: React.ReactNode
}) {
  return (
    <ButtonPart
      className={withClass(
        cn(
          "group/kf-button relative",
          /* Colours and shadows ease as the pointer arrives; the press springs back with a pop. */
          "[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)]",
          "not-data-disabled:not-data-pending:active:scale-[0.96] not-data-disabled:not-data-pending:active:[transition-duration:calc(150ms*var(--kf-speed,1)),calc(150ms*var(--kf-speed,1)),calc(150ms*var(--kf-speed,1)),calc(150ms*var(--kf-speed,1)),calc(90ms*var(--kf-speed,1))]",
          "not-data-disabled:hover:[--kf-nudge:1] not-data-disabled:data-hovered:[--kf-nudge:1] focus-visible:[--kf-nudge:1]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    >
      {(state) => (
        <>
          <span
            data-slot="button-label"
            className={cn(
              "inline-flex flex-1 items-center [justify-content:inherit] [gap:inherit]",
              swap,
              "group-data-pending/kf-button:-translate-y-4 group-data-pending/kf-button:opacity-0 group-data-pending/kf-button:blur-[3px]",
              "group-data-pending/kf-button:duration-[calc(240ms*var(--kf-speed,1))] group-data-pending/kf-button:ease-house",
            )}
          >
            {typeof children === "function" ? children(state) : children}
          </span>
          {pendingIndicator !== null && (
            <span
              aria-hidden
              data-slot="button-pending"
              className={cn(
                "pointer-events-none absolute inset-0 grid place-items-center",
                swap,
                "translate-y-4 opacity-0 blur-[3px] duration-[calc(200ms*var(--kf-speed,1))] ease-house",
                "group-data-pending/kf-button:translate-y-0 group-data-pending/kf-button:opacity-100 group-data-pending/kf-button:blur-none",
                "group-data-pending/kf-button:duration-[calc(460ms*var(--kf-speed,1))] group-data-pending/kf-button:ease-spring",
              )}
            >
              {pendingIndicator ?? <Spinner />}
            </span>
          )}
        </>
      )}
    </ButtonPart>
  )
}

/* A trailing arrow for "go on" buttons. At rest it is a chevron; on hover (or keyboard focus)
   it slides forward and its stem draws in behind it. */
function ButtonArrow({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      data-slot="button-arrow"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("overflow-visible", className)}
      {...props}
    >
      <path
        d="M3.5 8h8"
        pathLength={1}
        className="[stroke-dasharray:1] [stroke-dashoffset:calc(1-var(--kf-nudge,0))] opacity-(--kf-nudge,0) [transition:stroke-dashoffset_calc(320ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(120ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:[transition:none]!"
      />
      <path
        d="M8 4.5 11.5 8 8 11.5"
        className="[translate:calc(var(--kf-nudge,0)*3px-2.5px)_0] [transition:translate_calc(320ms*var(--kf-speed,1))_var(--ease-spring)] motion-reduce:[transition:none]!"
      />
    </svg>
  )
}

export { Button, ButtonArrow }
