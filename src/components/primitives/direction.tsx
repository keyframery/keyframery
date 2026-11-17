"use client"

/* Animated reading direction, on UI SDK's core. The behaviour is defined in
   `@/components/core/direction` with `definePrimitive` and rendered here. This file adds motion
   only. Colours, radii, shadows and spacing stay yours.

   - Direction: when the direction flips, the content inside comes in from the side it now reads
     from (from the right into right to left, from the left back into left to right) out of a soft
     blur, one block after another. It never plays on first load.
   - DirectionToggle: Press; an icon inside it turns over on a spring as the direction flips.

   `Direction` is also exported as `DirectionProvider`, shadcn's name, though it provides nothing:
   it is an element with `dir`, and everything inside reads the direction from the page. */

import { createParts } from "@ui-sdk/react/primitive"
import * as React from "react"

import { type Dir, direction, directionOf, watchDirection } from "@/components/core/direction"
import { cn } from "@/lib/utils"

const { Root: DirectionRoot, Toggle: DirectionTogglePart } = createParts(direction, { root: "div", toggle: "button" })

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Two names, so switching direction switches animation and restarts it. */
const keyframes =
  "@keyframes kf-dir-rtl{from{opacity:0;translate:28px 0;filter:blur(6px)}}" +
  "@keyframes kf-dir-ltr{from{opacity:0;translate:-28px 0;filter:blur(6px)}}"

function Direction({ className, ...props }: React.ComponentProps<typeof DirectionRoot>) {
  return (
    <>
      <style href="kf-direction" precedence="default">
        {keyframes}
      </style>
      <DirectionRoot
        className={withClass(
          cn(
            "data-flipped:data-[dir=rtl]:[&>*]:animate-[kf-dir-rtl_calc(460ms*var(--kf-speed,1))_var(--ease-spring)_calc((min(sibling-index(),8)-1)*40ms*var(--kf-speed,1))_backwards]",
            "data-flipped:data-[dir=ltr]:[&>*]:animate-[kf-dir-ltr_calc(460ms*var(--kf-speed,1))_var(--ease-spring)_calc((min(sibling-index(),8)-1)*40ms*var(--kf-speed,1))_backwards]",
            "motion-reduce:[&>*]:animate-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

function DirectionToggle({ className, ...props }: React.ComponentProps<typeof DirectionTogglePart>) {
  return (
    <DirectionTogglePart
      className={withClass(
        cn(
          "transition-[scale] duration-[calc(220ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] active:duration-[calc(90ms*var(--kf-speed,1))] active:ease-house",
          "[&_svg]:transition-[scale] [&_svg]:duration-[calc(520ms*var(--kf-speed,1))] [&_svg]:ease-spring data-[dir=rtl]:[&_svg]:-scale-x-100",
          "motion-reduce:transition-none! motion-reduce:[&_svg]:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/** The direction an element is laid out in, kept current as any `dir` in the page changes. Pass a
    ref to read it where that element sits; without one it reads the page's. */
function useDirection(ref?: React.RefObject<Element | null>): Dir {
  const [dir, setDir] = React.useState<Dir>("ltr")
  React.useEffect(() => {
    const el = ref?.current ?? document.documentElement
    setDir(directionOf(el))
    return watchDirection(el, setDir)
  }, [ref])
  return dir
}

const DirectionProvider = Direction

export { Direction, DirectionProvider, DirectionToggle, directionOf, useDirection, type Dir }
