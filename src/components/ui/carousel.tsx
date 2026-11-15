"use client"

/* Styled carousel: the animated primitive plus the Keyframery look. */

import {
  Carousel as CarouselRoot,
  CarouselContent as CarouselContentPart,
  CarouselIndicator as CarouselIndicatorPart,
  CarouselIndicatorGroup as CarouselIndicatorGroupPart,
  CarouselItem as CarouselItemPart,
  CarouselNext as CarouselNextPart,
  CarouselPlayToggle as CarouselPlayTogglePart,
  CarouselPrevious as CarouselPreviousPart,
  CarouselViewport as CarouselViewportPart,
} from "@/components/primitives/carousel"
import * as React from "react"

import { cn } from "@/lib/utils"

function Carousel({ className, ...props }: React.ComponentProps<typeof CarouselRoot>) {
  return <CarouselRoot className={cn("relative flex flex-col gap-3", className)} {...props} />
}

/* The scrolling window. UI SDK writes its overflow and snapping inline; the scrollbar is hidden. */
function CarouselViewport({
  className,
  ...props
}: React.ComponentProps<typeof CarouselViewportPart>) {
  return (
    <CarouselViewportPart
      className={cn(
        "rounded-[14px] outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-dragging:cursor-grabbing",
        className,
      )}
      {...props}
    />
  )
}

function CarouselContent({
  className,
  ...props
}: React.ComponentProps<typeof CarouselContentPart>) {
  return (
    <CarouselContentPart
      className={cn("flex gap-3 data-[orientation=vertical]:flex-col", className)}
      {...props}
    />
  )
}

/* One slide to a view. The leaving slide sinks back and dims (from the primitive). */
function CarouselItem({ className, ...props }: React.ComponentProps<typeof CarouselItemPart>) {
  return <CarouselItemPart className={cn("min-w-0 shrink-0 grow-0 basis-full", className)} {...props} />
}

/* Round keys. At the ends they stay focusable but quiet down. */
const roundKey = [
  "inline-grid size-8 shrink-0 cursor-pointer place-items-center rounded-full bg-background text-foreground outline-none select-none [&_svg]:size-4",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--background),var(--foreground)_3%)] dark:not-data-disabled:hover:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_7%)]",
  "not-data-disabled:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.05),0_4px_8px_-2px_rgb(0_0_0/0.12)]",
  "dark:not-data-disabled:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.12),inset_0_1px_0_rgb(255_255_255/0.1),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "not-data-disabled:active:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.06)]",
  "dark:not-data-disabled:active:shadow-[0_0_0_1px_rgb(255_255_255/0.09),inset_0_1px_0_rgb(255_255_255/0.04),0_1px_2px_-1px_rgb(0_0_0/0.6)]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "data-disabled:cursor-not-allowed data-disabled:opacity-40",
]

function Chevron({ d }: { d: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

function CarouselPrevious({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CarouselPreviousPart>) {
  return (
    <CarouselPreviousPart aria-label="Previous slide" className={cn(roundKey, className)} {...props}>
      {children ?? <Chevron d="m10 4-4 4 4 4" />}
    </CarouselPreviousPart>
  )
}

function CarouselNext({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CarouselNextPart>) {
  return (
    <CarouselNextPart aria-label="Next slide" className={cn(roundKey, className)} {...props}>
      {children ?? <Chevron d="m6 4 4 4-4 4" />}
    </CarouselNextPart>
  )
}

function CarouselPlayToggle({
  className,
  ...props
}: React.ComponentProps<typeof CarouselPlayTogglePart>) {
  return <CarouselPlayTogglePart className={cn(roundKey, className)} {...props} />
}

/* The dots sit in a small pill well. */
function CarouselIndicatorGroup({
  className,
  ...props
}: React.ComponentProps<typeof CarouselIndicatorGroupPart>) {
  return (
    <CarouselIndicatorGroupPart
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1 rounded-full bg-muted px-1.5",
        "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)]",
        "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
        className,
      )}
      {...props}
    />
  )
}

/* The current dot is a short bar; it widens on a spring (from the primitive). */
function CarouselIndicator({
  className,
  ...props
}: React.ComponentProps<typeof CarouselIndicatorPart>) {
  return (
    <CarouselIndicatorPart
      className={cn(
        "relative h-1.5 w-1.5 cursor-pointer rounded-full bg-foreground/20 outline-none",
        "hover:bg-foreground/45 data-selected:w-5 data-selected:bg-foreground",
        /* A larger hit area than the dot itself. */
        "after:absolute after:-inset-x-0.5 after:-inset-y-2",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted",
        className,
      )}
      {...props}
    />
  )
}

/* A hairline that follows --carousel-progress on every frame of the scroll. */
function CarouselProgress({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      data-slot="carousel-progress"
      className={cn("h-0.5 w-full overflow-hidden rounded-full bg-foreground/10", className)}
      {...props}
    >
      <div className="h-full w-full origin-left scale-x-(--carousel-progress) rounded-full bg-foreground/70 rtl:origin-right" />
    </div>
  )
}

export {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPlayToggle,
  CarouselPrevious,
  CarouselProgress,
  CarouselViewport,
}
