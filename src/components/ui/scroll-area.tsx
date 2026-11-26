"use client"

export * from "@/components/primitives/scroll-area"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --scroll-area-thumb: Thumb pigment (30%, 45% hover, 60% drag) (default: --foreground)
   --scroll-area-key: Jump button surface (default: --background, --accent in dark)
   --scroll-area-ink: Jump button text (default: --foreground)
   --scroll-area-focus: Viewport focus ring (default: --ring)
   --scroll-area-thickness: Full thumb thickness (default: 0.5rem)
   --scroll-area-scrollbar-size: Scrollbar hit area (default: 0.875rem)
   --scroll-area-fade: Maximum edge fade (default: 24px)
   --scroll-area-radius: Thumb and jump button corners (default: 9999px)
*/

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
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Give it a size. The focus ring of the viewport is drawn here, outside the fades. */
function ScrollArea({
  speed,
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ScrollAreaRoot
        className={withClass(
          cn(
            "relative isolate",
            "has-[[data-slot=scroll-area-viewport]:focus-visible]:ring-2 has-[[data-slot=scroll-area-viewport]:focus-visible]:ring-[color:var(--scroll-area-focus,var(--ring))]",
            "has-[[data-slot=scroll-area-viewport]:focus-visible]:ring-offset-2 has-[[data-slot=scroll-area-viewport]:focus-visible]:ring-offset-background",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
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
      className={withClass(
        cn(
          "size-full rounded-[inherit] outline-none",
          "[--scroll-area-overflow-x-end:inherit] [--scroll-area-overflow-x-start:inherit] [--scroll-area-overflow-y-end:inherit] [--scroll-area-overflow-y-start:inherit]",
          "[--fade-bottom:min(var(--scroll-area-fade,24px),var(--scroll-area-overflow-y-end,0px))] [--fade-top:min(var(--scroll-area-fade,24px),var(--scroll-area-overflow-y-start,0px))]",
          "[--fade-end:min(var(--scroll-area-fade,24px),var(--scroll-area-overflow-x-end,0px))] [--fade-start:min(var(--scroll-area-fade,24px),var(--scroll-area-overflow-x-start,0px))]",
          "[mask-image:linear-gradient(to_bottom,transparent,black_var(--fade-top),black_calc(100%_-_var(--fade-bottom)),transparent),linear-gradient(to_right,transparent,black_var(--fade-start),black_calc(100%_-_var(--fade-end)),transparent)]",
          "[mask-composite:intersect]",
        ),
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
  return <ScrollAreaContentPart className={className} {...props} />
}

/* Hidden until the pointer is over the area or it scrolls. */
function ScrollAreaScrollbar({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaScrollbarPart>) {
  return (
    <ScrollAreaScrollbarPart
      className={withClass(
        cn(
          "group/scrollbar z-10 flex p-[min(3px,calc((var(--scroll-area-scrollbar-size,0.875rem)-var(--scroll-area-thickness,0.5rem))/2))]",
          "data-[orientation=vertical]:w-[var(--scroll-area-scrollbar-size,0.875rem)] data-[orientation=vertical]:justify-end",
          "data-[orientation=horizontal]:h-[var(--scroll-area-scrollbar-size,0.875rem)] data-[orientation=horizontal]:items-end",
        ),
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
      className={withClass(
        cn(
          "rounded-[var(--scroll-area-radius,9999px)] bg-[color-mix(in_oklab,var(--scroll-area-thumb,var(--foreground))_30%,transparent)]",
          "data-[orientation=vertical]:w-[var(--scroll-area-thickness,0.5rem)] data-[orientation=horizontal]:h-[var(--scroll-area-thickness,0.5rem)]",
          "group-hover/scrollbar:bg-[color-mix(in_oklab,var(--scroll-area-thumb,var(--foreground))_45%,transparent)] group-data-hovered/scrollbar:bg-[color-mix(in_oklab,var(--scroll-area-thumb,var(--foreground))_45%,transparent)] data-dragging:bg-[color-mix(in_oklab,var(--scroll-area-thumb,var(--foreground))_60%,transparent)]",
        ),
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
  return <ScrollAreaCornerPart className={withClass("z-10", className)} {...props} />
}

/* "Jump to latest": a small key that rises from the bottom edge once the view leaves the end. */
function ScrollAreaScrollToEnd({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaScrollToEndPart>) {
  return (
    <ScrollAreaScrollToEndPart
      className={withClass(
        cn(
          "absolute bottom-3 left-1/2 z-10 inline-flex h-7 -translate-x-1/2 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--scroll-area-radius,9999px)] bg-[var(--scroll-area-key,var(--background))] px-3",
          "text-[12px] leading-none font-medium whitespace-nowrap text-[color:var(--scroll-area-ink,var(--foreground))] outline-none select-none [&_svg]:size-3.5 [&_svg]:shrink-0",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
          "dark:bg-[var(--scroll-area-key,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
          "origin-bottom transition-[opacity,translate,scale,filter,box-shadow] duration-[calc(220ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
          "not-data-visible:pointer-events-none not-data-visible:translate-y-1 not-data-visible:scale-[0.96] not-data-visible:opacity-0 not-data-visible:blur-[calc(4px*var(--kf-flourish,1))] not-data-visible:duration-[calc(140ms*var(--kf-speed,1))]",
          "active:translate-y-[calc(1px*var(--kf-flourish,1))] active:scale-[calc(1-0.015*var(--kf-flourish,1))] active:duration-[calc(100ms*var(--kf-speed,1))]",
          "active:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.06)]",
          "dark:active:shadow-[0_0_0_1px_rgb(255_255_255/0.09),inset_0_1px_0_rgb(255_255_255/0.04),0_1px_2px_-1px_rgb(0_0_0/0.6)]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ),
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
