"use client"

/* Animated drop-in for `@ui-sdk/react/avatar`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import { Avatar as AvatarRoot, AvatarImage as AvatarImagePart } from "@ui-sdk/react/avatar"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/avatar"

/* Moves on a spring when a group makes room for its neighbour, and dips when pressed
   (rendered as a button or link). */
function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarRoot>) {
  return (
    <AvatarRoot
      className={withClass(
        cn(
          "[transition:translate_calc(460ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(220ms*var(--kf-speed,1))_var(--ease-pop)] [&:is(button,a)]:active:scale-[0.92]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Blur-in: the photo arrives out of a 10px blur and a 1.25 zoom, the zoom settling on a spring.
   Until it has loaded, UI SDK keeps it out of sight with its own inline style. A cached image is
   loaded before its first paint, so `starting:` gives it the same entrance. */
function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarImagePart>) {
  return (
    <AvatarImagePart
      className={withClass(
        cn(
          "[transition:opacity_calc(420ms*var(--kf-speed,1))_var(--ease-house),filter_calc(560ms*var(--kf-speed,1))_var(--ease-house),scale_calc(680ms*var(--kf-speed,1))_var(--ease-spring)]",
          "not-data-[loading-status=loaded]:scale-125 not-data-[loading-status=loaded]:blur-[10px]",
          "starting:scale-125 starting:opacity-0 starting:blur-[10px]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Extra helper: overlapping avatars. The hovered one rises 4px and comes to the front; the ones
   after it step 6px right and the ones before it 6px left, so it has room. `data-hovered` on a
   child does the same, for hover you track yourself (touch, or a scripted demo). */
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "isolate flex items-center *:relative",
        "[&>*:is(:hover,[data-hovered])]:z-10 [&>*:is(:hover,[data-hovered])]:-translate-y-1",
        "[&>*:is(:hover,[data-hovered])~*]:translate-x-1.5 [&>*:has(~*:is(:hover,[data-hovered]))]:-translate-x-1.5",
        className,
      )}
      {...props}
    />
  )
}

/* Extra helper: the "+3" that closes a group, moving with it. */
function AvatarGroupCount({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-group-count"
      className={cn("transition-[translate] duration-[calc(460ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarGroup, AvatarGroupCount, AvatarImage }
