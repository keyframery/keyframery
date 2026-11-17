"use client"

/* Animated chat bubbles, on UI SDK's core. UI SDK ships no bubble, so the behaviour is defined in
   `@/components/core/bubble` with `definePrimitive` and rendered here. This file adds motion only.
   Colours, radii, shadows and spacing stay yours (style `data-variant` and `data-align`).

   - Pop: a new bubble grows out of its tail corner (bottom start for the other person, bottom end
     for you) from 60%, with a blur that clears, settling with `ease-pop`. Bubbles in a group
     arrive one after another.
   - Reactions pop a beat later, from the edge they hang on.
   - A bubble whose content is a button or a link presses in. */

import { createParts } from "@ui-sdk/react/primitive"
import * as React from "react"

import { bubble, bubbleGroup } from "@/components/core/bubble"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const { Root: BubbleRoot, Content: BubbleContentPart, Reactions: BubbleReactionsPart } = createParts(bubble, {
  root: "div",
  content: "div",
  reactions: "div",
})
const { Root: BubbleGroupRoot } = createParts(bubbleGroup, { root: "div" })

function BubbleGroup({ className, ...props }: React.ComponentProps<typeof BubbleGroupRoot>) {
  return (
    <BubbleGroupRoot
      className={withClass(/* In a group, each bubble arrives a beat after the one above it. */
        "*:data-[slot=bubble]:[transition-delay:calc((min(sibling-index(),6)-1)*90ms*var(--kf-speed,1))]", className)}
      {...props}
    />
  )
}

/* Pop. Only scale, translate, opacity and filter transition, so the delay never slows anything else. */
function Bubble({ className, ...props }: React.ComponentProps<typeof BubbleRoot>) {
  return (
    <BubbleRoot
      className={withClass(
        cn(
          "group/bubble origin-bottom-left rtl:origin-bottom-right data-[align=end]:origin-bottom-right rtl:data-[align=end]:origin-bottom-left",
          "transition-[scale,translate,opacity,filter] duration-[calc(560ms*var(--kf-speed,1))] ease-pop",
          "data-starting-style:scale-[0.6] data-starting-style:translate-y-2 data-starting-style:opacity-0 data-starting-style:blur-[6px] data-starting-style:transition-none",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Press, for a bubble that is a button or a link (`render={<button />}`). */
function BubbleContent({ className, ...props }: React.ComponentProps<typeof BubbleContentPart>) {
  return (
    <BubbleContentPart
      className={withClass(
        cn(
          "[button&,a&]:transition-[scale] [button&,a&]:duration-[calc(200ms*var(--kf-speed,1))] [button&,a&]:ease-pop [button&,a&]:active:scale-[0.97]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Pops in a beat after its bubble, from the edge it hangs on. */
function BubbleReactions({ className, ...props }: React.ComponentProps<typeof BubbleReactionsPart>) {
  return (
    <BubbleReactionsPart
      className={withClass(
        cn(
          "data-[side=bottom]:origin-top data-[side=top]:origin-bottom",
          "transition-[scale,opacity,filter] duration-[calc(480ms*var(--kf-speed,1))] ease-pop delay-[calc(260ms*var(--kf-speed,1))]",
          "data-starting-style:scale-[0.4] data-starting-style:opacity-0 data-starting-style:blur-[3px] data-starting-style:transition-none",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Bubble, BubbleContent, BubbleGroup, BubbleReactions }
