"use client"

/* Animated drop-in for `@ui-sdk/react/pagination`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Glide: one current-page key, drawn by the list as its `before:`, glides from page to page on a
     spring (CSS anchors). Give it your own surface with `before:` classes on PaginationList.
   - Press: pages and steps give under the pointer and spring back.
   - Roll: `PaginationRoll` shows a number whose digits roll when it changes, for a count like "41 to 50". */

import {
  PaginationFirst as PaginationFirstPart,
  PaginationItem as PaginationItemPart,
  PaginationLast as PaginationLastPart,
  PaginationLink as PaginationLinkPart,
  PaginationList as PaginationListPart,
  PaginationNext as PaginationNextPart,
  PaginationPrevious as PaginationPreviousPart,
} from "@ui-sdk/react/pagination"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/pagination"

function PaginationList({ className, ...props }: React.ComponentProps<typeof PaginationListPart>) {
  return (
    <PaginationListPart
      className={withClass(
        cn(
          "relative isolate [anchor-scope:--kf-page]",
          "before:pointer-events-none before:absolute before:-z-10 before:opacity-0 before:content-[''] before:[position-anchor:--kf-page]",
          "before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
          "before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
          "before:[transition:top_calc(340ms*var(--kf-speed,1))_var(--ease-spring),right_calc(340ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(340ms*var(--kf-speed,1))_var(--ease-spring),left_calc(340ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)]",
          "has-[[data-slot=pagination-link][data-current]]:before:opacity-100 motion-reduce:before:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* A page that comes into the range as it shifts arrives where it lands. */
function PaginationItem({ className, ...props }: React.ComponentProps<typeof PaginationItemPart>) {
  return (
    <PaginationItemPart
      className={withClass("transition-[opacity,scale,filter] duration-[calc(300ms*var(--kf-speed,1))] ease-spring starting:scale-75 starting:opacity-0 starting:blur-[3px] motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

const press =
  "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.92] data-disabled:active:scale-100 motion-reduce:transition-none!"

/* The current page names itself as the key's anchor. */
function PaginationLink({ className, ...props }: React.ComponentProps<typeof PaginationLinkPart>) {
  return (
    <PaginationLinkPart
      className={withClass(
        cn(
          "data-current:[anchor-name:--kf-page]", press,
        ),
        className,
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationPreviousPart>) {
  return <PaginationPreviousPart className={withClass(press, className)} {...props} />
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationNextPart>) {
  return <PaginationNextPart className={withClass(press, className)} {...props} />
}

function PaginationFirst({ className, ...props }: React.ComponentProps<typeof PaginationFirstPart>) {
  return <PaginationFirstPart className={withClass(press, className)} {...props} />
}

function PaginationLast({ className, ...props }: React.ComponentProps<typeof PaginationLastPart>) {
  return <PaginationLastPart className={withClass(press, className)} {...props} />
}

/* Roll: each digit is a column of 0 to 9 that slides to its value on a spring. Screen readers
   read the plain number. */
function PaginationRoll({
  value,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & { value: number }) {
  const digits = String(Math.max(0, Math.round(value))).split("")
  return (
    <span data-slot="pagination-roll" className={cn("relative inline-flex tabular-nums", className)} {...props}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex h-[1lh] overflow-hidden">
        {digits.map((digit, index) => (
          <span
            key={digits.length - index}
            style={{ "--d": Number(digit) } as React.CSSProperties}
            className="flex flex-col transition-[translate] duration-[calc(500ms*var(--kf-speed,1))] ease-spring [translate:0_calc(var(--d)*-1lh)] motion-reduce:transition-none!"
          >
            {Array.from({ length: 10 }, (_, d) => (
              <span key={d} className="h-[1lh]">
                {d}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  )
}

export {
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationRoll,
}
