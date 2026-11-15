"use client"

/* Styled scroll area: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  ScrollArea as ScrollAreaRoot,
  ScrollAreaContent as ScrollAreaContentPart,
  ScrollAreaCorner as ScrollAreaCornerPart,
  ScrollAreaScrollbar as ScrollAreaScrollbarPart,
  ScrollAreaScrollToEnd as ScrollAreaScrollToEndPart,
  ScrollAreaThumb as ScrollAreaThumbPart,
  ScrollAreaViewport as ScrollAreaViewportPart,
} from "@/components/primitives/scroll-area"
export { createScrollAreaController } from "@/components/primitives/scroll-area"
import { cn } from "@/lib/utils"

/* Give it a size. The focus ring of the viewport is drawn here, outside the fades. */
function ScrollArea({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaRoot>) {
  return (
    <ScrollAreaRoot
      className={cn(
        "relative isolate",
        "has-[[data-slot=scroll-area-viewport]:focus-visible]:ring-2 has-[[data-slot=scroll-area-viewport]:focus-visible]:ring-ring",
        "has-[[data-slot=scroll-area-viewport]:focus-visible]:ring-offset-2 has-[[data-slot=scroll-area-viewport]:focus-visible]:ring-offset-background",
        className,
      )}
      {...props}
    />
  )
}

/* The scroller. Its edges fade as far as the content reaches past them, up to 24px:
   UI SDK writes those distances on the root and the viewport takes them with `inherit`. */
function ScrollAreaViewport({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaViewportPart>) {
  return (
    <ScrollAreaViewportPart
      className={cn(
        "size-full rounded-[inherit] outline-none",
        "[--scroll-area-overflow-x-end:inherit] [--scroll-area-overflow-x-start:inherit] [--scroll-area-overflow-y-end:inherit] [--scroll-area-overflow-y-start:inherit]",
        "[--fade-bottom:min(24px,var(--scroll-area-overflow-y-end,0px))] [--fade-top:min(24px,var(--scroll-area-overflow-y-start,0px))]",
        "[--fade-end:min(24px,var(--scroll-area-overflow-x-end,0px))] [--fade-start:min(24px,var(--scroll-area-overflow-x-start,0px))]",
        "[mask-image:linear-gradient(to_bottom,transparent,black_var(--fade-top),black_calc(100%_-_var(--fade-bottom)),transparent),linear-gradient(to_right,transparent,black_var(--fade-start),black_calc(100%_-_var(--fade-end)),transparent)]",
        "[mask-composite:intersect]",
        className,
      )}
      {...props}
    />
  )
}

function ScrollAreaContent({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaContentPart>) {
  return <ScrollAreaContentPart className={cn(className)} {...props} />
}

/* Hidden until the pointer is over the area or it scrolls. */
function ScrollAreaScrollbar({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaScrollbarPart>) {
  return (
    <ScrollAreaScrollbarPart
      className={cn(
        "group/scrollbar z-10 flex p-[3px]",
        "data-[orientation=vertical]:w-3.5 data-[orientation=vertical]:justify-end",
        "data-[orientation=horizontal]:h-3.5 data-[orientation=horizontal]:items-end",
        className,
      )}
      {...props}
    />
  )
}

/* A pill, drawn here at its full thickness. The primitive keeps it slim until the pointer is
   on its track or it is dragged. */
function ScrollAreaThumb({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaThumbPart>) {
  return (
    <ScrollAreaThumbPart
      className={cn(
        "rounded-full bg-foreground/30",
        "data-[orientation=vertical]:w-2 data-[orientation=horizontal]:h-2",
        "group-hover/scrollbar:bg-foreground/45 group-data-hovered/scrollbar:bg-foreground/45 data-dragging:bg-foreground/60",
        className,
      )}
      {...props}
    />
  )
}

function ScrollAreaCorner({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaCornerPart>) {
  return <ScrollAreaCornerPart className={cn("z-10", className)} {...props} />
}

/* "Jump to latest": a small key that rises from the bottom edge once the view leaves the end. */
function ScrollAreaScrollToEnd({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaScrollToEndPart>) {
  return (
    <ScrollAreaScrollToEndPart
      className={cn(
        "absolute bottom-3 left-1/2 z-10 inline-flex h-7 -translate-x-1/2 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-background px-3",
        "text-[12px] leading-none font-medium whitespace-nowrap text-foreground outline-none select-none [&_svg]:size-3.5 [&_svg]:shrink-0",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
        "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        "origin-bottom transition-[opacity,translate,scale,filter,box-shadow] duration-[calc(220ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
        "not-data-visible:pointer-events-none not-data-visible:translate-y-1 not-data-visible:scale-[0.96] not-data-visible:opacity-0 not-data-visible:blur-[4px] not-data-visible:duration-[calc(140ms*var(--kf-speed,1))]",
        "active:translate-y-px active:scale-[0.985] active:duration-[calc(100ms*var(--kf-speed,1))]",
        "active:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.06)]",
        "dark:active:shadow-[0_0_0_1px_rgb(255_255_255/0.09),inset_0_1px_0_rgb(255_255_255/0.04),0_1px_2px_-1px_rgb(0_0_0/0.6)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  )
}

export {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaScrollToEnd,
  ScrollAreaThumb,
  ScrollAreaViewport,
}
