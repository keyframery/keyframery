"use client"

/* Styled rating: the animated primitive plus the Keyframery look. */

import * as React from "react"

import { Rating as RatingRoot, RatingItem as RatingItemPart } from "@/components/primitives/rating"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

function Rating({
  speed,
  className,
  children,
  ...props
}: React.ComponentProps<typeof RatingRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <RatingRoot
        className={cn(
          "inline-flex items-center gap-0.5 outline-none",
          "data-disabled:opacity-50",
          className as string,
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
      className={cn(
        "group/star relative grid size-6 shrink-0 place-items-center rounded-[6px] outline-none",
        "cursor-pointer data-disabled:cursor-not-allowed data-readonly:cursor-default",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-1 has-[:focus-visible]:ring-offset-background",
        className as string,
      )}
      {...props}
    >
      {children ?? (
        <span aria-hidden className="pointer-events-none relative block size-5">
          <Star className="text-muted-foreground/25 dark:text-muted-foreground/30" />
          <Star
            className={cn(
              "text-foreground [clip-path:inset(0_calc((1-var(--rating-fill,0))*100%)_0_0)]",
              /* Lighter only for stars the preview adds beyond the current score. */
              "[[data-checked]~[data-highlighted]_&]:text-foreground/50",
              "[[data-slot=rating]:not(:has([data-checked]))_[data-highlighted]_&]:text-foreground/50",
              "transition-colors duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none!",
            )}
          />
        </span>
      )}
    </RatingItemPart>
  )
}

export { Rating, RatingItem }
