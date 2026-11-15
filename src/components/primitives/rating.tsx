"use client"

/* Animated drop-in for `@ui-sdk/react/rating`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import { Rating as RatingRoot, RatingItem as RatingItemPart } from "@ui-sdk/react/rating"
import * as React from "react"

import { cn } from "@/lib/utils"

export * from "@ui-sdk/react/rating"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Registering --rating-fill makes it animatable, so anything you paint from it (a clip, a
   gradient, a mask) fills smoothly with no extra work. */
const css =
  `@property --rating-fill{syntax:"<number>";inherits:true;initial-value:0}` +
  `@keyframes kf-rating-pop{0%{scale:.55}100%{scale:1}}`

function Rating(props: React.ComponentProps<typeof RatingRoot>) {
  return (
    <>
      <style href="kf-rating" precedence="default">
        {css}
      </style>
      <RatingRoot {...props} />
    </>
  )
}

/* Cascade: stars fill one after another from the left, 45ms apart; emptying is immediate.
   The star a score lands on pops in from 0.55 with an overshoot. */
function RatingItem({ className, ...props }: React.ComponentProps<typeof RatingItemPart>) {
  return (
    <RatingItemPart
      className={withClass(
        cn(
          "[transition:--rating-fill_calc(300ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-filled:[transition-delay:calc((min(sibling-index(),10)-1)*calc(45ms*var(--kf-speed,1)))]",
          "data-partial:[transition-delay:calc((min(sibling-index(),10)-1)*calc(45ms*var(--kf-speed,1)))]",
          "not-data-readonly:data-checked:animate-[kf-rating-pop_calc(520ms*var(--kf-speed,1))_var(--ease-pop)_both]",
          "motion-reduce:[transition:none]! motion-reduce:animate-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Rating, RatingItem }
