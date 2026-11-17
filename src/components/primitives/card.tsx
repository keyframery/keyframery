"use client"

/* Animated card, on UI SDK's core. UI SDK ships no card, so the behaviour is defined in
   `@/components/core/card` with `definePrimitive` and rendered here with the shadcn part names
   (Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter): swap the import
   and keep your markup. This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Cascade: the card fades up out of a light blur, then its parts follow one after another, and
     inside the header the title leads the description.
   - `interactive`: lifts 2px on hover on a spring and sinks with a pop while pressed
     (`data-hovered`, `data-pressed`, set by the primitive from the pointer and from Space or Enter).
   - `spotlight`: a soft light follows the pointer (`--kf-x`, `--kf-y`). */

import { createParts } from "@ui-sdk/react/primitive"
import type { StateOf } from "@ui-sdk/core"
import * as React from "react"

import { card } from "@/components/core/card"
import { cn } from "@/lib/utils"

/* Keyframes with a backwards fill, so a part is hidden on its first frame and the delay never
   slows anything later (hover, press). */
const keyframes =
  "@keyframes kf-card-in{from{opacity:0;scale:.97;filter:blur(6px)}}" +
  "@keyframes kf-card-part{from{opacity:0;translate:0 12px;filter:blur(5px)}}"

const parts = createParts(card, {
  root: "div",
  header: "div",
  title: "div",
  description: "div",
  action: "div",
  content: "div",
  footer: "div",
})

type CardRootState = StateOf<typeof card, "root">

/* A class name that may be a function of the part's state, merged after ours. */
function withClass<S>(ours: string, theirs: string | ((state: S) => string | undefined) | undefined) {
  return typeof theirs === "function" ? (state: S) => cn(ours, theirs(state)) : cn(ours, theirs)
}

const cardMotion = cn(
  "group/card relative isolate",
  "animate-[kf-card-in_calc(520ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none!",
  "[&>*]:animate-[kf-card-part_calc(560ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:[&>*]:animate-none",
  "[&>*]:[animation-delay:calc(calc(70ms*var(--kf-speed,1))+(min(sibling-index(),10)-1)*calc(70ms*var(--kf-speed,1)))]",
  /* Lift and press. Translate and shadow settle on a spring; the press scale pops back. */
  "[transition:translate_calc(420ms*var(--kf-speed,1))_var(--ease-spring),box-shadow_calc(320ms*var(--kf-speed,1))_var(--ease-house),scale_calc(280ms*var(--kf-speed,1))_var(--ease-pop)]",
  "[&[data-interactive]:is(:hover,[data-hovered])]:-translate-y-0.5",
  "[&[data-interactive]:is(:hover,[data-hovered]):is(:active,[data-pressed])]:translate-y-0 [&[data-interactive]:is(:active,[data-pressed])]:scale-[0.985]",
  "motion-reduce:[transition:none]!",
  /* The light: a radial wash under the content, centred on the pointer. It follows the text
     colour by default; set --kf-spotlight to change it. */
  "data-spotlight:before:pointer-events-none data-spotlight:before:absolute data-spotlight:before:inset-0 data-spotlight:before:-z-10 data-spotlight:before:rounded-[inherit]",
  "data-spotlight:before:bg-[radial-gradient(300px_circle_at_var(--kf-x,50%)_var(--kf-y,0%),var(--kf-spotlight,color-mix(in_oklch,currentColor_13%,transparent)),transparent_70%)]",
  "data-spotlight:before:opacity-0 data-spotlight:before:transition-opacity data-spotlight:before:duration-[calc(320ms*var(--kf-speed,1))] data-spotlight:before:ease-house",
  "data-spotlight:[&:is(:hover,[data-hovered])]:before:opacity-100 motion-reduce:before:transition-none!",
)

function Card({ className, ...props }: React.ComponentProps<typeof parts.Root>) {
  return (
    <>
      <style href="kf-card" precedence="default">
        {keyframes}
      </style>
      <parts.Root className={withClass<CardRootState>(cardMotion, className)} {...props} />
    </>
  )
}

/* Inside the header the title leads the description. */
function CardHeader({ className, ...props }: React.ComponentProps<typeof parts.Header>) {
  return (
    <parts.Header
      className={withClass(
        cn(
          "[&>*]:animate-[kf-card-part_calc(560ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:[&>*]:animate-none",
          "[&>*]:[animation-delay:calc(calc(110ms*var(--kf-speed,1))+(min(sibling-index(),10)-1)*calc(60ms*var(--kf-speed,1)))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

const CardTitle = parts.Title
const CardDescription = parts.Description
const CardAction = parts.Action
const CardContent = parts.Content
const CardFooter = parts.Footer

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
