"use client"

/* Animated drop-in for `@ui-sdk/react/carousel`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  CarouselIndicator as CarouselIndicatorPart,
  CarouselItem as CarouselItemPart,
  CarouselNext as CarouselNextPart,
  CarouselPlayToggle as CarouselPlayTogglePart,
  CarouselPrevious as CarouselPreviousPart,
} from "@ui-sdk/react/carousel"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/carousel"

/* Direction: the slides travel by native scrolling. On top of that, a slide that leaves the
   current page sinks back (scale 0.9, a 2px blur) and dims, and the arriving one grows into
   place on a spring. The scale goes on the slide's content, not the slide, so the scroll range
   stays exact (a scaled slide would shorten it). */
function CarouselItem({ className, ...props }: React.ComponentProps<typeof CarouselItemPart>) {
  return (
    <CarouselItemPart
      className={withClass(
        cn(
          "transition-opacity duration-[calc(460ms*var(--kf-speed,1))] ease-house",
          "*:transition-[scale,filter] *:duration-[calc(520ms*var(--kf-speed,1))] *:ease-spring",
          "not-data-active:opacity-40 not-data-active:*:scale-[0.9] not-data-active:*:blur-[2px]",
          "motion-reduce:transition-none! motion-reduce:*:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Press: the key dips and springs back on release. */
const press =
  "[transition:scale_calc(220ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(150ms*var(--kf-speed,1)),background-color_calc(150ms*var(--kf-speed,1)),box-shadow_calc(150ms*var(--kf-speed,1)),color_calc(150ms*var(--kf-speed,1))] not-data-disabled:active:scale-[0.9] motion-reduce:transition-none!"

function CarouselPrevious({ className, ...props }: React.ComponentProps<typeof CarouselPreviousPart>) {
  return <CarouselPreviousPart className={withClass(press, className)} {...props} />
}

function CarouselNext({ className, ...props }: React.ComponentProps<typeof CarouselNextPart>) {
  return <CarouselNextPart className={withClass(press, className)} {...props} />
}

function CarouselPlayToggle({ className, ...props }: React.ComponentProps<typeof CarouselPlayTogglePart>) {
  return <CarouselPlayTogglePart className={withClass(press, className)} {...props} />
}

/* The current indicator widens on a spring, so it overshoots a touch and settles, while the one
   it left shrinks back. Give it its width in your styles (for example data-selected:w-5). */
function CarouselIndicator({ className, ...props }: React.ComponentProps<typeof CarouselIndicatorPart>) {
  return (
    <CarouselIndicatorPart
      className={withClass(
        cn(
          "[transition:width_calc(560ms*var(--kf-speed,1))_var(--ease-spring),height_calc(560ms*var(--kf-speed,1))_var(--ease-spring),background-color_calc(200ms*var(--kf-speed,1)),scale_calc(220ms*var(--kf-speed,1))_var(--ease-pop)] active:scale-[0.8]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { CarouselIndicator, CarouselItem, CarouselNext, CarouselPlayToggle, CarouselPrevious }
