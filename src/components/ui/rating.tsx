"use client"

export * from "@/components/primitives/rating"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --rating-fill-colour: Filled stars (default: --foreground)
   --rating-empty: Empty stars (default: --muted-foreground at 25%, 30% in dark)
   --rating-preview: Additional preview stars (default: --foreground at 50%)
   --rating-size: Star hit area (default: 1.5rem)
   --rating-icon-size: Star drawing size (default: 1.25rem)
   --rating-gap: Star gap (default: 0.125rem)
   --rating-radius: Focus corners (default: 6px)
*/

/* Styled rating: the animated primitive plus the Keyframery look. */

import * as React from "react"

import { Rating as RatingRoot, RatingItem as RatingItemPart } from "@/components/primitives/rating"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Rating({
  speed,
  className,
  children,
  ...props
}: React.ComponentProps<typeof RatingRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <RatingRoot
        className={withClass(
          cn(
            "inline-flex items-center gap-[var(--rating-gap,0.125rem)] outline-none",
            "data-disabled:opacity-50",
          ),
          className,
        )}
        {...props}
      >
        {children ?? <RatingItem />}
      </RatingRoot>
    </Speed>
  )
}

const starPath =
  "M8 1.9l1.83 3.72 4.1.6-2.97 2.89.7 4.08L8 11.26l-3.66 1.93.7-4.08L2.07 6.22l4.1-.6L8 1.9z"

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={cn("absolute inset-0 size-full", className)}>
      <path d={starPath} fill="currentColor" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  )
}

/* Each star is an empty star with a filled copy on top, clipped to --rating-fill (which the
   primitive animates, star by star from the left).
   The fill wipes in from the left; stars a pointer preview adds
   beyond the current score fill in a lighter tone. */
function RatingItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RatingItemPart>) {
  return (
    <RatingItemPart
      className={withClass(
        cn(
          "group/star relative grid size-[var(--rating-size,1.5rem)] shrink-0 place-items-center rounded-[var(--rating-radius,6px)] outline-none",
          "cursor-pointer data-disabled:cursor-not-allowed data-readonly:cursor-default",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-1 has-[:focus-visible]:ring-offset-background",
        ),
        className,
      )}
      {...props}
    >
      {children ?? (
        <span aria-hidden className="pointer-events-none relative block size-[var(--rating-icon-size,1.25rem)]">
          <Star className="text-[color:var(--rating-empty,color-mix(in_oklab,var(--muted-foreground)_25%,transparent))] dark:text-[color:var(--rating-empty,color-mix(in_oklab,var(--muted-foreground)_30%,transparent))]" />
          <Star
            className={cn(
              "text-[color:var(--rating-fill-colour,var(--foreground))] [clip-path:inset(0_calc((1-var(--rating-fill,0))*100%)_0_0)]",
              /* Lighter only for stars the preview adds beyond the current score. */
              "[[data-checked]~[data-highlighted]_&]:text-[color:var(--rating-preview,color-mix(in_oklab,var(--rating-fill-colour,var(--foreground))_50%,transparent))]",
              "[[data-slot=rating]:not(:has([data-checked]))_[data-highlighted]_&]:text-[color:var(--rating-preview,color-mix(in_oklab,var(--rating-fill-colour,var(--foreground))_50%,transparent))]",
              "transition-colors duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none!",
            )}
          />
        </span>
      )}
    </RatingItemPart>
  )
}

export { Rating, RatingItem }

/* UI SDK's helpers for this component, passed through. */
export { createRatingController } from "@/components/primitives/rating"
